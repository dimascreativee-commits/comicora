/* =========================================
   COMICORA - SERVICE WORKER
   ========================================= */

const CACHE_NAME = "comicora-v3";

const STATIC_ASSETS = [
    "/",
    "/index.html",

    "/manifest.json",

    "/css/reset.css",
    "/css/variables.css",
    "/css/global.css",
    "/css/header.css",
    "/css/footer.css",
    "/css/cards.css",
    "/css/home.css",
    "/css/responsive.css",

    "/js/app.js",
    "/js/home.js",
    "/js/pwa.js",

    "/assets/images/covers/placeholder.jpg"
];


/* =========================================
   INSTALL
   ========================================= */

self.addEventListener(
    "install",
    (event) => {

        event.waitUntil(
            caches
                .open(CACHE_NAME)
                .then((cache) => {
                    return cache.addAll(
                        STATIC_ASSETS
                    );
                })
                .then(() => {
                    return self.skipWaiting();
                })
                .catch((error) => {
                    console.error(
                        "Gagal melakukan precache:",
                        error
                    );
                })
        );

    }
);


/* =========================================
   ACTIVATE
   ========================================= */

self.addEventListener(
    "activate",
    (event) => {

        event.waitUntil(
            caches
                .keys()
                .then((cacheNames) => {

                    return Promise.all(
                        cacheNames
                            .filter(
                                (cacheName) => {
                                    return (
                                        cacheName !==
                                        CACHE_NAME
                                    );
                                }
                            )
                            .map(
                                (cacheName) => {
                                    return caches.delete(
                                        cacheName
                                    );
                                }
                            )
                    );

                })
                .then(() => {
                    return self.clients.claim();
                })
        );

    }
);


/* =========================================
   FETCH
   ========================================= */

self.addEventListener(
    "fetch",
    (event) => {

        const request =
            event.request;

        if (
            request.method !== "GET"
        ) {
            return;
        }

        const requestURL =
            new URL(request.url);


        /*
         * Jangan intercept request
         * dari domain eksternal.
         */

        if (
            requestURL.origin !==
            self.location.origin
        ) {
            return;
        }


        /*
         * Navigation request
         * menggunakan network-first.
         */

        if (
            request.mode === "navigate"
        ) {

            event.respondWith(
                networkFirstNavigation(
                    request
                )
            );

            return;
        }


        /*
         * Asset menggunakan
         * cache-first.
         */

        event.respondWith(
            cacheFirst(request)
        );

    }
);


/* =========================================
   NETWORK FIRST
   ========================================= */

async function networkFirstNavigation(
    request
) {

    try {

        const networkResponse =
            await fetch(request);

        if (
            networkResponse &&
            networkResponse.ok
        ) {

            const cache =
                await caches.open(
                    CACHE_NAME
                );

            await cache.put(
                request,
                networkResponse.clone()
            );

        }

        return networkResponse;

    } catch (error) {

        const cachedResponse =
            await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        return createOfflineResponse();

    }

}


/* =========================================
   CACHE FIRST
   ========================================= */

async function cacheFirst(
    request
) {

    const cachedResponse =
        await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }


    try {

        const networkResponse =
            await fetch(request);

        if (
            networkResponse &&
            networkResponse.ok
        ) {

            const cache =
                await caches.open(
                    CACHE_NAME
                );

            await cache.put(
                request,
                networkResponse.clone()
            );

        }

        return networkResponse;

    } catch (error) {

        return new Response(
            "",
            {
                status: 503,
                statusText:
                    "Service Unavailable"
            }
        );

    }

}


/* =========================================
   OFFLINE FALLBACK
   ========================================= */

function createOfflineResponse() {

    const offlineHTML = `
        <!DOCTYPE html>

        <html lang="id">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <meta
                name="theme-color"
                content="#00B14F"
            >

            <title>
                Offline - Comicora
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    min-height: 100vh;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    padding: 24px;

                    background: #ffffff;
                    color: #151515;

                    font-family:
                        Arial,
                        sans-serif;

                    text-align: center;
                }

                .offline {
                    width: 100%;
                    max-width: 420px;
                }

                .offline-icon {
                    width: 72px;
                    height: 72px;

                    margin: 0 auto 24px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    background: #E8F8EF;
                    color: #00B14F;

                    border-radius: 20px;

                    font-size: 32px;
                }

                h1 {
                    margin: 0 0 12px;

                    font-size: 28px;
                    line-height: 1.2;
                }

                p {
                    margin: 0;

                    color: #6B7280;

                    font-size: 15px;
                    line-height: 1.6;
                }

                .retry {
                    display: inline-block;

                    margin-top: 24px;
                    padding: 12px 20px;

                    border: 0;
                    border-radius: 10px;

                    background: #00B14F;
                    color: #ffffff;

                    font-size: 14px;
                    font-weight: 700;

                    text-decoration: none;
                }

            </style>

        </head>

        <body>

            <main class="offline">

                <div class="offline-icon">
                    📡
                </div>

                <h1>
                    Koneksi terputus
                </h1>

                <p>
                    Comicora membutuhkan koneksi
                    internet untuk memuat halaman ini.
                    Periksa koneksi kamu lalu coba lagi.
                </p>

                <a
                    href="/"
                    class="retry"
                >
                    Coba Lagi
                </a>

            </main>

        </body>

        </html>
    `;

    return new Response(
        offlineHTML,
        {
            status: 503,
            headers: {
                "Content-Type":
                    "text/html; charset=UTF-8"
            }
        }
    );

}