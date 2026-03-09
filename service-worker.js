const CACHE_NAME = "v1";

async function cacheResources() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll([
    "/",
    "/style.css",
    "/vendored/qunit-2.25.0.js",
    "/vendored/material-icons.css",
    "/vendored/normalize-8.0.1.css",
    "/vendored/qunit-2.25.0.css",
    "/vendored/mithril-2.3.8.js",
    "/vendored/material-icons.ttf",
    "/index.js",
    "/models/round.js",
    "/models/round_result.js",
    "/models/game_rules.js",
    "/models/game.js",
    "/models/session.js",
    "/data/db.js",
    "/data/session_repo.js",
    "/ui/info_view.js",
    "/ui/round.js",
    "/ui/session_list.js",
    "/ui/field.css",
    "/ui/game.js",
    "/ui/session-list.css",
    "/ui/round.css",
    "/ui/session.js",
    "/ui/box.css",
    "/ui/layout.js",
    "/ui/session_head.js",
    "/ui/base_view.js",
    "/ui/button.css",
    "/ui/session-view.css",
    "/ui/layout.css",
    "/ui/splash.css",
  ]);
}

function isStale(response) {
  let date = response.headers.get("Date");
  if (date === null)
    return true;

  date = new Date(date);
  date.setTime(date.getTime() + 60 * 60 * 1000);
  return date <= new Date();
}

async function revalidateIndex() {
  const index = await caches.match("/");
  if (!index || isStale(index))
    await cacheResources();
}

async function getFromCache(request, event) {
  const response = await caches.match(request);
  if (!response)
    return null;
  if (isStale(response))
    event.waitUntil(getFromNetwork(request, event));
  return response;
}

async function putInCache(request, response) {
  const cache = await cache.open(CACHE_NAME);
  await cache.put(request, response);
}

async function getFromNetwork(request, event) {
  const response = await fetch(request);
  event.waitUntil(putInCache(request, response.clone()));
  return response;
}

async function getResponse(request, event) {
  const cached = await getFromCache(request, event);
  if (cached)
    return cached;

  try {
    const fetched = await getFromNetwork(request, event);
    return fetched;
  } catch {
    const index = await getFromCache("/");
    if (index)
      return index;

    return new Response("Irgendwas is komplett faul", { status: 500 });
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheResources());
});

self.addEventListener("fetch", (event) => {
  event.waitUntil(revalidateIndex());
  event.respondWith(getResponse(event.request, event));
})
