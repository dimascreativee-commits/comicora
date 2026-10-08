/*
 * Comicora Home
 * Mengambil data komik langsung dari Komikku API
 */

document.addEventListener("DOMContentLoaded", () => {
    initHome();
});


/*
 * Inisialisasi halaman Home
 */
async function initHome() {
    const popularContainer =
        document.getElementById("popular-comics");

    const latestContainer =
        document.getElementById("latest-comics");

    const recommendedContainer =
        document.getElementById("recommended-comics");

    if (
        !popularContainer &&
        !latestContainer &&
        !recommendedContainer
    ) {
        return;
    }

    /*
     * Tampilkan loading
     */
    showLoading(popularContainer);
    showLoading(latestContainer);
    showLoading(recommendedContainer);

    try {
        /*
         * Ambil tiga kategori secara bersamaan
         */
        const [
            popularResult,
            latestResult,
            recommendedResult
        ] = await Promise.allSettled([
            ComicoraAPI.getPopularComics(1),
            ComicoraAPI.getNewestComics(1),
            ComicoraAPI.getRecommendedComics(1)
        ]);


        /*
         * Popular
         */
        if (
            popularResult.status === "fulfilled"
        ) {
            const popularComics =
                normalizeComicList(
                    popularResult.value
                );

            renderComicGrid(
                popularContainer,
                popularComics
            );
        } else {
            showError(
                popularContainer,
                "Popular gagal dimuat."
            );
        }


        /*
         * Latest
         */
        if (
            latestResult.status === "fulfilled"
        ) {
            const latestComics =
                normalizeComicList(
                    latestResult.value
                );

            renderComicGrid(
                latestContainer,
                latestComics
            );
        } else {
            showError(
                latestContainer,
                "Komik terbaru gagal dimuat."
            );
        }


        /*
         * Recommended
         */
        if (
            recommendedResult.status === "fulfilled"
        ) {
            const recommendedComics =
                normalizeComicList(
                    recommendedResult.value
                );

            renderComicGrid(
                recommendedContainer,
                recommendedComics
            );
        } else {
            showError(
                recommendedContainer,
                "Rekomendasi gagal dimuat."
            );
        }

    } catch (error) {
        console.error(
            "Comicora Home Error:",
            error
        );

        showError(
            popularContainer,
            "Gagal memuat komik."
        );

        showError(
            latestContainer,
            "Gagal memuat komik."
        );

        showError(
            recommendedContainer,
            "Gagal memuat komik."
        );
    }
}


/*
 * Normalisasi data dari API
 */
function normalizeComicList(data) {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((comic, index) => {
            const normalized = ComicoraAPI.normalizeComic(comic);

            return {
                id: createComicId(
                    normalized.endpoint,
                    index
                ),
                ...normalized
            };
        })
        .filter(comic => comic.title || comic.cover || comic.endpoint);
}


/*
 * Membuat ID dari endpoint API
 */
function createComicId(
    endpoint,
    index
) {
    if (!endpoint) {
        return `comic-${index}`;
    }

    return endpoint
        .replace(/^\/+/, "")
        .replace(/^manga\//, "")
        .replace(/\/+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-");
}


/*
 * Render Comic Grid
 */
function renderComicGrid(
    container,
    comics
) {
    if (!container) {
        return;
    }

    if (!comics.length) {
        container.innerHTML = `
            <div class="comic-empty">
                <p>
                    Belum ada komik yang tersedia.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = comics
        .map((comic) => {
            return createComicCard(
                comic
            );
        })
        .join("");


    /*
     * Update status bookmark
     * setelah card selesai dibuat.
     */
    if (
        window.Comicora &&
        typeof window.Comicora
            .updateAllBookmarkButtons === "function"
    ) {
        window.Comicora
            .updateAllBookmarkButtons();
    }
}


/*
 * Membuat Comic Card
 */
function createComicCard(
    comic
) {
    const detailUrl =
        `pages/detail.html?endpoint=${encodeURIComponent(
            comic.endpoint
        )}`;

    const safeTitle =
        escapeComicHTML(comic.title);

    const safeType =
        escapeComicHTML(comic.type);

    const safeCover =
        escapeComicHTML(comic.cover);

    const safeEndpoint =
        escapeComicHTML(comic.endpoint);

    return `
        <article class="comic-card">

            <div class="comic-cover-wrapper">

                <a
                    href="${detailUrl}"
                    class="comic-card-link"
                    aria-label="Lihat ${safeTitle}"
                >
                    <img
                        src="${safeCover || 'assets/images/covers/placeholder.jpg'}"
                        alt="${safeTitle}"
                        class="comic-cover"
                        loading="lazy"
                        decoding="async"
                    >
                </a>

                <button
                    type="button"
                    class="comic-bookmark-button"
                    data-bookmark="${safeEndpoint}"
                    aria-label="Bookmark ${safeTitle}"
                >
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z"
                        ></path>
                    </svg>
                </button>

            </div>

            <div class="comic-card-content">

                <a
                    href="${detailUrl}"
                    class="comic-title"
                    title="${safeTitle}"
                >
                    ${safeTitle}
                </a>

                <div class="comic-meta">
                    <span>${safeType}</span>
                </div>

            </div>

        </article>
    `;
}

/*
 * Loading state
 */
function showLoading(
    container
) {
    if (!container) {
        return;
    }

    container.innerHTML = `
        ${createSkeletonCard()}
        ${createSkeletonCard()}
        ${createSkeletonCard()}
        ${createSkeletonCard()}
        ${createSkeletonCard()}
        ${createSkeletonCard()}
    `;
}


/*
 * Skeleton card
 */
function createSkeletonCard() {
    return `
        <div class="comic-card comic-card-skeleton">

            <div class="comic-card-cover">
                <div class="skeleton"></div>
            </div>

            <div class="comic-card-body">

                <div
                    class="skeleton skeleton-title"
                ></div>

                <div
                    class="skeleton skeleton-meta"
                ></div>

            </div>

        </div>
    `;
}


/*
 * Error state
 */
function showError(
    container,
    message
) {
    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="comic-empty">

            <p>
                ${escapeComicHTML(message)}
            </p>

            <button
                type="button"
                class="btn btn-primary"
                onclick="location.reload()"
            >
                Coba Lagi
            </button>

        </div>
    `;
}


/*
 * Escape HTML
 */
function escapeComicHTML(
    value
) {
    if (
        window.Comicora &&
        typeof window.Comicora.escapeHTML === "function"
    ) {
        return window.Comicora.escapeHTML(
            String(value || "")
        );
    }

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}