// GET /api/worker-status — proxies to the Python worker's /health endpoint
export default async function handler(req, res) {
  const workerUrl = process.env.WORKER_URL || 'http://localhost:8000';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const response = await fetch(`${workerUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      return res.status(200).json({ status: 'error', online: false });
    }
    const data = await response.json();
    res.status(200).json({ status: 'online', online: true, ...data });
  } catch (error) {
    clearTimeout(timeout);
    // Worker is unreachable or timed out — return graceful offline response
    res.status(200).json({ status: 'offline', online: false, last_seen: null });
  }
}
