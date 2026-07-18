// Pull the recording the webhook pointed at. This is network I/O against a
// URL we did not generate, so it gets a timeout AND a hard size cap.
const MAX_BYTES = 25 * 1024 * 1024; // Whisper's per-request audio limit
const FETCH_TIMEOUT_MS = 10_000;

export type Recording = { bytes: Buffer; contentType: string };

export async function fetchRecording(url: string): Promise<Recording> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      throw new Error(`recording fetch failed: ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) {
      throw new Error(`recording too large: ${buf.byteLength} bytes`);
    }
    return {
      bytes: buf,
      contentType: res.headers.get('content-type') ?? 'audio/mpeg',
    };
  } finally {
    clearTimeout(timer);
  }
}
