import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import { Recording } from './audio';

const client = new OpenAI();

export type Transcript = {
  text: string;
  // Whisper can return the detected language; useful for routing/eval later.
  language?: string;
};

export async function transcribe(rec: Recording): Promise<Transcript> {
  // Whisper wants an uploadable file, not a raw Buffer. toFile wraps the bytes
  // with a name + content type so the multipart upload is well-formed.
  const file = await toFile(rec.bytes, 'call.mp3', { type: rec.contentType });

  const res = await client.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    response_format: 'verbose_json', // gives us text + detected language
  });

  return {
    text: res.text,
    language: (res as { language?: string }).language,
  };
}
