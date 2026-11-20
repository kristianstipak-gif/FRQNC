const ORIGIN = "https://cdn.aethersdr.com/kiwi.json";
const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=1800"
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...HEADERS, "Content-Type": "application/json; charset=utf-8", ...extra }
  });
}

function nullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isOffline(value) {
  return value === true || value === 1 || value === "yes" || value === "true";
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: HEADERS });
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);

    if (url.pathname === "/api/health") {
      return json({
        service: "FRQNC API",
        status: "online",
        source: "AetherSDR public KiwiSDR mirror",
        checked_at: new Date().toISOString()
      });
    }

    if (url.pathname === "/api/receivers") {
      try {
        const upstream = await fetch(ORIGIN, {
          headers: { Accept: "application/json", "User-Agent": "FRQNC-Frequency-Explorer/0.1" },
          cf: { cacheTtl: 1800, cacheEverything: true }
        });
        if (!upstream.ok) return json({ error: "Receiver directory unavailable", upstream_status: upstream.status }, 502);

        const payload = await upstream.json();
        if (!payload || payload.schema !== 1 || !Array.isArray(payload.receivers)) {
          return json({ error: "Unsupported or invalid receiver directory schema" }, 502);
        }

        const receivers = payload.receivers.slice(0, 2000).map((r, i) => ({
          id: String(r.id || r.url || i),
          name: String(r.name || "KiwiSDR"),
          url: String(r.url || ""),
          location: String(r.loc || ""),
          antenna: String(r.antenna || ""),
          users: nullableNumber(r.users),
          users_max: nullableNumber(r.users_max),
          ext_api: nullableNumber(r.ext_api),
          offline: isOffline(r.offline),
          bands: String(r.bands || "")
        })).filter(r => {
          try {
            const receiverUrl = new URL(r.url);
            return receiverUrl.protocol === "http:" || receiverUrl.protocol === "https:";
          } catch {
            return false;
          }
        });

        return json({
          source: payload.source || "AetherSDR public KiwiSDR mirror",
          fetched_at: payload.fetched_at || null,
          receiver_count: receivers.length,
          receivers
        }, 200, { "Cache-Control": "public, max-age=1800, s-maxage=1800" });
      } catch (error) {
        return json({ error: "Could not load public receiver directory", detail: String(error?.message || error) }, 502);
      }
    }

    return json({ service: "FRQNC API", routes: ["/api/health", "/api/receivers"] });
  }
};