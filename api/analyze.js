export const config = { runtime: "edge" };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: CORS });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...CORS, "Content-Type": "application/json" } });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: "API key not configured on server" }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      // Force streaming so tokens flow immediately — prevents idle timeout
      body: JSON.stringify({ ...body, stream: true }),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...CORS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Anthropic fetch error:", err);
    return new Response(JSON.stringify({ error: err.message || "Request to Anthropic failed" }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
}
