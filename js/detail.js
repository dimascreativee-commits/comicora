/*
 * Comicora Comic Detail
 * Mengambil detail komik langsung dari Komikku API
 */

document.addEventListener("DOMContentLoaded", () => {
    initComicDetail();
});


/*
 * Inisialisasi halaman detail
 */
async function initComicDetail() {
    const loading =
        document.getElementById("detail-loading");

    const detail =
        document.getElementById("comic-detail");

    const notFound =
        document.getElementById("detail-not-found");

    const params =
        new URLSearchParams(
            window.location.search
        );

    const endpoint =
        params.get("endpoint");

    if (!endpoint) {
        showNotFound(
            loading,
            detail,
            notFound
        );

        return;
    }

    if (loading) {
        loading.hidden = false;
    }

    if (detail) {
        detail.hidden = true;
    }

    if (notFound) {
        notFound.hidden = true;
    }

        try {
        const comicData =
            await ComicoraAPI.getComicDetail(
                endpoint
            );

        if (!comicData) {
            throw new Error(
                "Data komik tidak ditemukan."
            );
        }


        /*
         * Ambil daftar chapter.
         */
        let chapterResult = {
            chapters: []
        };

        try {
            chapterResult =
                await ComicoraAPI.getChapters(
                    endpoint
                );
        } catch (chapterError) {
            console.warn(
                "Chapter gagal dimuat:",
                chapterError
            );
        }


        /*
         * Cari cover dari Search API.
         */
        let coverData = null;

        try {
            const searchResult =
                await ComicoraAPI.searchComics(
                    comicData.title
                );

            if (Array.isArray(searchResult)) {
                coverData =
                    searchResult.find(
                        item =>
                            item.id ===
                            comicData.id
                    ) ||
                    searchResult[0] ||
                    null;
            }
        } catch (searchError) {
            console.warn(
                "Cover gagal dimuat:",
                searchError
            );
        }


        /*
         * Normalisasi data.
         */
        const comic =
            normalizeDetailData(
                comicData,
                chapterResult,
                coverData
            );


        /*
         * Render detail.
         */
        renderComicDetail(
            comic
        );


        /*
         * Render chapter.
         */
        renderChapterList(
            comic.chapters,
            comic.endpoint
        );


        document.title =
            `${comic.title} - Comicora`;


        if (loading) {
            loading.hidden = true;
        }

        if (detail) {
            detail.hidden = false;
        }

    } catch (error) {
        console.error(
            "Comic Detail Error:",
            error
        );

        showNotFound(
            loading,
            detail,
            notFound
        );
    }
}

/*
 * Normalisasi data detail
 */
function normalizeDetailData(
    data,
    chapterResult,
    coverData
) {
    const chapterSource =
        chapterResult?.chapters ||
        chapterResult?.data ||
        chapterResult?.items ||
        [];

    return {
        title:
            data.title ||
            coverData?.title ||
            "Tanpa Judul",

        alternativeTitle:
            data.alternative_title ||
            data.alt_title ||
            "",

        cover:
            coverData?.coverArtUrl ||
            data.coverArtUrl ||
            data.thumbnail ||
            data.image ||
            "",

        description:
            data.description ||
            data.desc ||
            "Deskripsi belum tersedia.",

        type:
            data.type ||
            coverData?.type ||
            "Manga",

        status:
            data.status ||
            "Tidak diketahui",

        author:
            data.author ||
            "Tidak diketahui",

        artist:
            data.artist ||
            "",

        rating:
            data.rating ||
            "",

        genre:
            normalizeGenres(
                data.genre ||
                data.genres
            ),

        endpoint:
            data.id ||
            coverData?.id ||
            "",

        chapters:
            normalizeChapters(
                chapterSource
            )
    };
}

/*
 * Normalisasi genre
 */
function normalizeGenres(
    genres
) {
    if (!genres) {
        return [];
    }


    if (Array.isArray(genres)) {
        return genres.map((genre) => {

            if (
                typeof genre ===
                "string"
            ) {
                return genre;
            }

            return (
                genre.name ||
                genre.title ||
                ""
            );

        }).filter(Boolean);
    }


    if (
        typeof genres ===
        "string"
    ) {
        return genres
            .split(",")
            .map((genre) => genre.trim())
            .filter(Boolean);
    }


    return [];
}


/*
 * Normalisasi chapter
 */
function normalizeChapters(
    chapters
) {
    if (!Array.isArray(chapters)) {
        return [];
    }

    return chapters
        .map((chapter) => {

            if (typeof chapter === "string") {
                return {
                    title: chapter,
                    chapter: "",
                    endpoint: chapter
                };
            }

            return {
                title:
                    chapter.title ||
                    chapter.name ||
                    `Chapter ${
                        chapter.chapter ||
                        chapter.number ||
                        ""
                    }`,

                chapter:
                    chapter.chapter ||
                    chapter.number ||
                    "",

                endpoint:
                    chapter.id ||
                    chapter.slug ||
                    chapter.endpoint ||
                    chapter.url ||
                    chapter.link ||
                    ""
            };

        })
        .filter(
            chapter =>
                chapter.endpoint
        );
}

/*
 * Render informasi komik
 */
function renderComicDetail(
    comic
) {
    const cover =
        document.getElementById(
            "detail-cover"
        );

    const status =
        document.getElementById(
            "detail-status"
        );

    const title =
        document.getElementById(
            "detail-title"
        );

    const alternative =
        document.getElementById(
            "detail-alternative"
        );

    const meta =
        document.getElementById(
            "detail-meta"
        );

    const genres =
        document.getElementById(
            "detail-genres"
        );

    const synopsis =
        document.getElementById(
            "detail-synopsis"
        );

    const creator =
        document.getElementById(
            "detail-creator"
        );

    const chapterCount =
        document.getElementById(
            "chapter-count"
        );


    /*
     * Cover
     */
    if (cover) {

        cover.src =
            comic.cover ||
            "../assets/images/covers/placeholder.jpg";

        cover.alt =
            comic.title;

        cover.onerror = () => {
            cover.src =
                "../assets/images/covers/placeholder.jpg";
        };
    }


    /*
     * Status
     */
    if (status) {
        status.textContent =
            comic.status;
    }


    /*
     * Title
     */
    if (title) {
        title.textContent =
            comic.title;
    }


    /*
     * Alternative title
     */
    if (alternative) {

        if (comic.alternativeTitle) {

            alternative.textContent =
                comic.alternativeTitle;

            alternative.hidden = false;

        } else {

            alternative.hidden = true;

        }
    }


    /*
     * Meta
     */
    if (meta) {

        const metaItems = [];

        if (comic.type) {
            metaItems.push(
                comic.type
            );
        }

        if (comic.author) {
            metaItems.push(
                comic.author
            );
        }

        if (comic.status) {
            metaItems.push(
                comic.status
            );
        }

        meta.innerHTML =
            metaItems
                .map(
                    (item) =>
                        `<span>${escapeDetailHTML(
                            item
                        )}</span>`
                )
                .join("");
    }


    /*
     * Genre
     */
    if (genres) {

        genres.innerHTML =
            comic.genre
                .map(
                    (genre) => `
                        <span class="genre-tag">
                            ${escapeDetailHTML(
                                genre
                            )}
                        </span>
                    `
                )
                .join("");
    }


    /*
     * Synopsis
     */
    if (synopsis) {
        synopsis.textContent =
            comic.description;
    }


    /*
     * Creator
     */
    if (creator) {

        const creatorParts = [];

        if (comic.author) {
            creatorParts.push(
                `Author: ${comic.author}`
            );
        }

        if (comic.artist) {
            creatorParts.push(
                `Artist: ${comic.artist}`
            );
        }

        creator.textContent =
            creatorParts.join(" • ");
    }


    /*
     * Chapter count
     */
    if (chapterCount) {

        chapterCount.textContent =
            `${comic.chapters.length} Chapter`;
    }


    /*
     * Tombol mulai baca
     */
    setupReadButton(
        comic
    );


    /*
     * Bookmark
     */
    setupBookmarkButton(
        comic
    );
}


/*
 * Tombol "Mulai Baca"
 */
function setupReadButton(
    comic
) {
    const button =
        document.getElementById(
            "read-first-button"
        );

    if (!button) {
        return;
    }


    if (!comic.chapters.length) {

        button.disabled = true;
        button.textContent =
            "Belum Ada Chapter";

        return;
    }


    /*
     * Chapter pertama dalam list
     */
    const firstChapter =
        comic.chapters[
            comic.chapters.length - 1
        ];


    button.disabled = false;

    button.href =
        `reader.html?endpoint=${
            encodeURIComponent(
                comic.endpoint
            )
        }&chapter=${
            encodeURIComponent(
                firstChapter.endpoint
            )
        }`;
}


/*
 * Bookmark
 */
function setupBookmarkButton(
    comic
) {
    const button =
        document.getElementById(
            "detail-bookmark-button"
        );

    if (!button) {
        return;
    }


    /*
     * Gunakan endpoint sebagai ID
     */
    button.dataset.bookmark =
        comic.endpoint;


    /*
     * Update status awal
     */
    if (
        window.Comicora &&
        typeof window.Comicora
            .updateBookmarkIcon ===
            "function"
    ) {
        window.Comicora
            .updateBookmarkIcon(
                button
            );
    }


    /*
     * Hapus listener lama
     */
    button.onclick = null;


    /*
     * Listener bookmark
     */
    button.addEventListener(
        "click",
        () => {

            if (
                window.Comicora &&
                typeof window.Comicora
                    .toggleBookmark ===
                    "function"
            ) {
                window.Comicora
                    .toggleBookmark(
                        button
                    );
            }

        }
    );
}


/*
 * Render daftar chapter
 */
function renderChapterList(
    chapters,
    comicEndpoint
) {
    const container =
        document.getElementById(
            "chapter-list"
        );


    if (!container) {
        return;
    }


    if (!chapters.length) {

        container.innerHTML = `
            <div class="comic-empty">
                <p>
                    Belum ada chapter.
                </p>
            </div>
        `;

        return;
    }


    /*
     * Urutan chapter
     *
     * Chapter terbaru ditampilkan
     * di bagian atas.
     */
    const sortedChapters =
        [...chapters].reverse();


    container.innerHTML =
        sortedChapters
            .map(
                (chapter, index) => {

                    const title =
                        chapter.title ||
                        `Chapter ${
                            chapter.chapter ||
                            sortedChapters.length -
                            index
                        }`;

                    const readerUrl =
                        `reader.html?endpoint=${
                            encodeURIComponent(
                                comicEndpoint
                            )
                        }&chapter=${
                            encodeURIComponent(
                                chapter.endpoint
                            )
                        }`;


                    return `
                        <a
                            href="${readerUrl}"
                            class="chapter-item"
                        >
                            <span>
                                ${escapeDetailHTML(
                                    title
                                )}
                            </span>

                            <span>
                                Baca →
                            </span>
                        </a>
                    `;
                }
            )
            .join("");
}


/*
 * Tampilkan halaman tidak ditemukan
 */
function showNotFound(
    loading,
    detail,
    notFound
) {
    if (loading) {
        loading.hidden = true;
    }

    if (detail) {
        detail.hidden = true;
    }

    if (notFound) {
        notFound.hidden = false;
    }
}


/*
 * Escape HTML
 */
function escapeDetailHTML(
    value
) {
    if (
        window.Comicora &&
        typeof window.Comicora.escapeHTML ===
        "function"
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