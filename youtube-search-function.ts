// SeboTV – Supabase Edge Function: youtube-search
// Sucht YouTube-Videos über die offizielle YouTube Data API v3.
// Der API-Key liegt als Supabase-Secret und wird NIE an den Browser geschickt.
//
// Deploy:  supabase functions deploy youtube-search --no-verify-jwt
// Secret:  supabase secrets set YT_API_KEY=<dein Key>
//
// Aufruf:  GET /functions/v1/youtube-search?q=sido&limit=12

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

function youtubeIsoToSeconds(iso) {
  const m = /P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || "");
  if (!m) return 0;
  return (Number(m[1] || 0) * 86400) + (Number(m[2] || 0) * 3600)
    + (Number(m[3] || 0) * 60) + Number(m[4] || 0);
}

Deno.serve(async (req) => {
  // Vorabanfrage des Browsers: muss IMMER mit 200 + CORS-Kopfzeilen beantwortet werden,
  // sonst blockiert der Browser jeden Aufruf ("preflight doesn't pass access control check").
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: CORS });

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(15, Math.max(1, Number(url.searchParams.get("limit")) || 12));
  const region = url.searchParams.get("region") || "DE";
  const lang = url.searchParams.get("lang") || "de";

  if (!q) return json({ error: "Suchbegriff fehlt (q)" }, 400);

  const key = Deno.env.get("YT_API_KEY");
  if (!key) return json({ error: "YT_API_KEY ist in Supabase nicht gesetzt" }, 500);

  try {
    const searchUrl = "https://www.googleapis.com/youtube/v3/search"
      + "?part=snippet&type=video&maxResults=" + limit
      + "&regionCode=" + encodeURIComponent(region)
      + "&relevanceLanguage=" + encodeURIComponent(lang)
      + "&q=" + encodeURIComponent(q)
      + "&key=" + encodeURIComponent(key);

    const r = await fetch(searchUrl);
    const j = await r.json();

    if (!r.ok) {
      const msg = (j && j.error && j.error.message) || ("HTTP " + r.status);
      const reasons = (j && j.error && j.error.errors)
        ? j.error.errors.map((e) => e.reason).join(", ") : "";
      return json({ error: msg + (reasons ? " (" + reasons + ")" : "") }, r.status);
    }

    const items = j.items || [];
    const ids = items.map((i) => i.id && i.id.videoId).filter(Boolean);

    // Laufzeit + Einbettbarkeit nachladen (1 Kontingent-Einheit)
    const details = {};
    if (ids.length) {
      const dUrl = "https://www.googleapis.com/youtube/v3/videos"
        + "?part=contentDetails,status&id=" + ids.join(",")
        + "&key=" + encodeURIComponent(key);
      const dr = await fetch(dUrl);
      const dj = await dr.json();
      if (dr.ok && Array.isArray(dj.items)) {
        dj.items.forEach((v) => {
          details[v.id] = {
            duration: (v.contentDetails && v.contentDetails.duration) || "",
            embeddable: !(v.status && v.status.embeddable === false),
          };
        });
      }
    }

    const tracks = items.map((i) => {
      const d = details[i.id.videoId] || {};
      const sn = i.snippet || {};
      const th = sn.thumbnails || {};
      return {
        video_id: i.id.videoId,
        title: sn.title || "YouTube-Video",
        author: sn.channelTitle || "",
        published: sn.publishedAt || "",
        thumb: (th.medium && th.medium.url) || (th.default && th.default.url) || "",
        duration: youtubeIsoToSeconds(d.duration),
        embeddable: d.embeddable !== false,
      };
    });

    return json({ tracks });
  } catch (e) {
    return json({ error: String((e && e.message) || e) }, 500);
  }
});
