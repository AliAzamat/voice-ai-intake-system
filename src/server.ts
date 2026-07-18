import Fastify from 'fastify';
import { CallWebhook, IntakeJob } from './types';
import { processIntake } from './pipeline';
import { listQueue, resolveIntake } from './queue';

export function buildServer() {
  const app = Fastify({ logger: true });

  // Load-balancer health probe: cheap, no dependencies, always fast.
  app.get('/healthz', async () => ({ ok: true }));

  app.post('/webhooks/call', async (req, reply) => {
    const parsed = CallWebhook.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'bad payload' });
    }
    const call = parsed.data;
    const job: IntakeJob = {
      call_id: call.call_id,
      recording_url: call.recording_url,
      from_number: call.from_number,
    };
    setImmediate(() => processIntake(job).catch((e) => app.log.error(e)));
    return reply.code(202).send({ accepted: true });
  });

  app.get('/review/queue', async () => {
    return { items: await listQueue() };
  });

  app.post<{ Params: { id: string }; Body: { outcome: 'approved' | 'rejected' } }>(
    '/review/:id',
    async (req, reply) => {
      const ok = await resolveIntake(Number(req.params.id), req.body.outcome);
      if (!ok) return reply.code(409).send({ error: 'already resolved or not found' });
      return { resolved: true };
    },
  );

  return app;
}
