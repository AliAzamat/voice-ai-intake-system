import { buildServer } from './server';

const app = buildServer();
const port = Number(process.env.PORT ?? 8080);

app.listen({ port, host: '0.0.0.0' }).then(() => {
  app.log.info(`voice-intake listening on :${port}`);
});
