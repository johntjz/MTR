export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const stop = url.searchParams.get("stop");

  if (!stop) {
    return new Response("Missing stop parameter", { status: 400 });
  }

  const apiUrl = `https://rt.data.gov.hk/v1/transport/mtr/lrt/getSchedule?station_id=${stop}`;
  const cacheKey = new Request(apiUrl, request);
  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (!response) {
    response = await fetch(apiUrl);
    response = new Response(response.body, response);
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Cache-Control", "s-maxage=15");
    context.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
}
