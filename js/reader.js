/*
 * Comicora Reader
 * Mengambil gambar chapter langsung dari Komikku API
 */

document.addEventListener("DOMContentLoaded", () => {
    initReader();
});


/*
 * Local Storage
 */
const HISTORY_KEY = "comicora_history";


/*
 * State reader
 */
let currentComic = null;
let currentChapter = null;
let chapterList = [];
let readerImages = [];


/*
 * Inisialisasi Reader
 */
async function initReader() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const comicEndpoint =
        params.get("endpoint");

    const chapterEndpoint =
        params.get("chapter");


    /*
     * Validasi URL
     */
    if (
        !comicEndpoint ||
        !chapterEndpoint
    ) {
        showReaderError(
            "Chapter tidak ditemukan."
        );

        return;
    }


    /*
     * Ambil elemen halaman
     */
    const elements =
        getReaderElements();


    /*
     * Tampilkan loading
     */
    showReaderLoading(
        elements
    );


    try {

        /*
         * Ambil data chapter
         */
        const chapterData =
            await ComicoraAPI.getChapter(
                chapterEndpoint
            );


        if (!chapterData) {
            throw new Error(
                "Data chapter kosong."
            );
        }


        /*
         * Normalisasi chapter
         */
        currentChapter =
            normalizeChapter(
                chapterData,
                chapterEndpoint
            );


        /*
         * Ambil informasi comic
         */
        await loadComicInformation(
            comicEndpoint
        );


        /*
         * Ambil daftar chapter
         */
        await loadChapterList(
            comicEndpoint
        );


        /*
         * Render gambar
         */
        renderReaderImages(
            currentChapter.images,
            elements
        );


        /*
         * Update UI
         */
        updateReaderHeader(
            currentChapter,
            elements
        );


        /*
         * Setup navigasi
         */
        setupReaderNavigation(
            comicEndpoint,
            chapterEndpoint,
            elements
        );


        /*
         * Setup chapter selector
         */
        setupChapterSelector(
            elements
        );


        /*
         * Setup progress
         */
        setupReaderProgress(
            elements
        );


        /*
         * Setup online/offline
         */
        setupNetworkStatus(
            elements
        );


        /*
         * Simpan history awal
         */
        saveReadingHistory();


        /*
         * Update title browser
         */
        document.title =
            `${currentChapter.title} - Comicora`;


    } catch (error) {

        console.error(
            "Comicora Reader Error:",
            error
        );

        showReaderError(
            "Gagal memuat chapter. Silakan coba lagi."
        );
    }
}


/*
 * Ambil elemen Reader
 */
function getReaderElements() {
    return {
        loading:
            document.getElementById(
                "reader-loading"
            ),

        images:
            document.getElementById(
                "reader-images"
            ),

        empty:
            document.getElementById(
                "reader-empty"
            ),

        title:
            document.getElementById(
                "reader-comic-title"
            ),

        chapterTitle:
            document.getElementById(
                "reader-chapter-title"
            ),

        progress:
            document.getElementById(
                "reader-progress"
            ),

        selector:
            document.getElementById(
                "reader-chapter-selector"
            ),

        selectorList:
            document.getElementById(
                "reader-selector-list"
            ),

        previous:
            document.getElementById(
                "previous-chapter"
            ),

        next:
            document.getElementById(
                "next-chapter"
            ),

        chapterList:
            document.getElementById(
                "chapter-list-button"
            ),

        offline:
            document.getElementById(
                "reader-offline"
            ),

        back:
            document.getElementById(
                "reader-back"
            )
    };
}


/*
 * Loading state
 */
function showReaderLoading(
    elements
) {
    if (elements.loading) {
        elements.loading.hidden = false;
    }

    if (elements.images) {
        elements.images.innerHTML = "";
    }

    if (elements.empty) {
        elements.empty.hidden = true;
    }
}


/*
 * Normalisasi data chapter
 */
function normalizeChapter(
    data,
    endpoint
) {
    /*
     * API dapat mengembalikan
     * array gambar secara langsung
     * atau berada di property tertentu.
     */
    let images = [];


    if (Array.isArray(data)) {
        images = data;
    } else if (
        Array.isArray(data.images)
    ) {
        images = data.images;
    } else if (
        Array.isArray(data.image)
    ) {
        images = data.image;
    } else if (
        Array.isArray(data.pages)
    ) {
        images = data.pages;
    }


    /*
     * Normalisasi URL gambar
     */
    images = images
        .map((image) => {

            if (
                typeof image ===
                "string"
            ) {
                return image;
            }

            return (
                image.image ||
                image.url ||
                image.src ||
                ""
            );

        })
        .filter(Boolean);


    return {
        endpoint,

        title:
            data.title ||
            data.chapter ||
            "Chapter",

        chapter:
            data.chapter ||
            data.number ||
            "",

        images
    };
}


/*
 * Ambil informasi comic
 */
async function loadComicInformation(
    endpoint
) {
    try {

        const data =
            await ComicoraAPI.getComicDetail(
                endpoint
            );


        if (!data) {
            return;
        }


        currentComic = {
            title:
                data.title ||
                "Comicora",

            endpoint,

            cover:
                data.thumbnail ||
                data.image ||
                ""
        };


    } catch (error) {

        console.warn(
            "Comic information gagal dimuat:",
            error
        );


        currentComic = {
            title: "Comicora",
            endpoint,
            cover: ""
        };
    }
}


/*
 * Ambil daftar chapter
 */
async function loadChapterList(
    endpoint
) {
    /*
     * Detail comic menyediakan
     * chapter list.
     */
    try {

        const data =
            await ComicoraAPI.getComicDetail(
                endpoint
            );


        if (!data) {
            chapterList = [];

            return;
        }


        const chapters =
            data.chapter_list ||
            data.chapters ||
            [];


        if (!Array.isArray(chapters)) {
            chapterList = [];

            return;
        }


        chapterList =
            chapters
                .map((chapter) => {

                    if (
                        typeof chapter ===
                        "string"
                    ) {
                        return {
                            title: chapter,
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
                            chapter.endpoint ||
                            chapter.url ||
                            chapter.link ||
                            ""
                    };

                })
                .filter(
                    (chapter) =>
                        chapter.endpoint
                );


    } catch (error) {

        console.warn(
            "Chapter list gagal dimuat:",
            error
        );

        chapterList = [];
    }
}


/*
 * Render gambar chapter
 */
function renderReaderImages(
    images,
    elements
) {
    if (
        elements.loading
    ) {
        elements.loading.hidden = true;
    }


    if (
        !images ||
        !images.length
    ) {

        if (elements.empty) {
            elements.empty.hidden = false;
        }

        return;
    }


    readerImages = images;


    if (elements.empty) {
        elements.empty.hidden = true;
    }


    if (!elements.images) {
        return;
    }


    elements.images.innerHTML =
        images
            .map(
                (imageUrl, index) => {

                    const safeUrl =
                        escapeReaderHTML(
                            imageUrl
                        );


                    return `
                        <figure
                            class="reader-image-wrapper"
                            data-page="${index + 1}"
                        >

                            <div
                                class="reader-image-loading"
                            >
                                Memuat halaman...
                            </div>

                            <img
                                src="${safeUrl}"
                                alt="Halaman ${
                                    index + 1
                                }"
                                class="reader-image"
                                loading="${
                                    index === 0
                                        ? "eager"
                                        : "lazy"
                                }"
                                decoding="async"
                                data-reader-image
                            >

                            <div
                                class="reader-image-error"
                            >
                                Gagal memuat gambar.
                            </div>

                        </figure>
                    `;
                }
            )
            .join("");


    setupImageStates(
        elements.images
    );
}


/*
 * Loading/error image
 */
function setupImageStates(
    container
) {
    const images =
        container.querySelectorAll(
            "[data-reader-image]"
        );


    images.forEach((image) => {

        const wrapper =
            image.closest(
                ".reader-image-wrapper"
            );


        if (!wrapper) {
            return;
        }


        const loading =
            wrapper.querySelector(
                ".reader-image-loading"
            );

        const error =
            wrapper.querySelector(
                ".reader-image-error"
            );


        /*
         * Berhasil dimuat
         */
        image.addEventListener(
            "load",
            () => {

                if (loading) {
                    loading.hidden = true;
                }

                image.classList.add(
                    "is-loaded"
                );

            }
        );


        /*
         * Gagal
         */
        image.addEventListener(
            "error",
            () => {

                if (loading) {
                    loading.hidden = true;
                }

                if (error) {
                    error.hidden = false;
                }

                image.classList.add(
                    "is-error"
                );

            }
        );


        /*
         * Cache browser sudah punya
         * gambar
         */
        if (image.complete) {

            if (image.naturalWidth > 0) {

                if (loading) {
                    loading.hidden = true;
                }

                image.classList.add(
                    "is-loaded"
                );

            } else {

                if (loading) {
                    loading.hidden = true;
                }

                if (error) {
                    error.hidden = false;
                }
            }
        }
    });
}


/*
 * Update header reader
 */
function updateReaderHeader(
    chapter,
    elements
) {
    if (elements.title) {
        elements.title.textContent =
            currentComic
                ? currentComic.title
                : "Comicora";
    }


    if (elements.chapterTitle) {
        elements.chapterTitle.textContent =
            chapter.title;
    }
}


/*
 * Navigasi chapter
 */
function setupReaderNavigation(
    comicEndpoint,
    currentEndpoint,
    elements
) {
    if (!chapterList.length) {

        if (elements.previous) {
            elements.previous.disabled = true;
        }

        if (elements.next) {
            elements.next.disabled = true;
        }

        return;
    }


    const currentIndex =
        chapterList.findIndex(
            (chapter) =>
                normalizeEndpoint(
                    chapter.endpoint
                ) ===
                normalizeEndpoint(
                    currentEndpoint
                )
        );


    /*
     * Chapter list biasanya
     * terbaru → terlama.
     */
    const previousChapter =
        currentIndex <
        chapterList.length - 1
            ? chapterList[
                currentIndex + 1
            ]
            : null;


    const nextChapter =
        currentIndex > 0
            ? chapterList[
                currentIndex - 1
            ]
            : null;


    /*
     * Previous
     */
    if (elements.previous) {

        if (previousChapter) {

            elements.previous.disabled =
                false;

            elements.previous.onclick =
                () => {

                    navigateToChapter(
                        comicEndpoint,
                        previousChapter.endpoint
                    );

                };

        } else {

            elements.previous.disabled =
                true;

        }
    }


    /*
     * Next
     */
    if (elements.next) {

        if (nextChapter) {

            elements.next.disabled =
                false;

            elements.next.onclick =
                () => {

                    navigateToChapter(
                        comicEndpoint,
                        nextChapter.endpoint
                    );

                };

        } else {

            elements.next.disabled =
                true;

        }
    }


    /*
     * Chapter list button
     */
    if (elements.chapterList) {

        elements.chapterList.onclick =
            () => {

                window.history.back();

            };
    }
}


/*
 * Pindah chapter
 */
function navigateToChapter(
    comicEndpoint,
    chapterEndpoint
) {
    const url =
        `reader.html?endpoint=${
            encodeURIComponent(
                comicEndpoint
            )
        }&chapter=${
            encodeURIComponent(
                chapterEndpoint
            )
        }`;


    window.location.href = url;
}


/*
 * Chapter selector
 */
function setupChapterSelector(
    elements
) {
    if (
        !elements.selector ||
        !elements.selectorList
    ) {
        return;
    }


    if (!chapterList.length) {
        return;
    }


    elements.selectorList.innerHTML =
        chapterList
            .map(
                (chapter) => {

                    return `
                        <a
                            href="reader.html?endpoint=${
                                encodeURIComponent(
                                    currentComic.endpoint
                                )
                            }&chapter=${
                                encodeURIComponent(
                                    chapter.endpoint
                                )
                            }"
                            class="reader-chapter-option"
                        >
                            ${escapeReaderHTML(
                                chapter.title
                            )}
                        </a>
                    `;
                }
            )
            .join("");


    const button =
        document.getElementById(
            "chapter-menu-button"
        );


    if (button) {

        button.addEventListener(
            "click",
            () => {

                elements.selector.hidden =
                    !elements.selector.hidden;

            }
        );
    }
}


/*
 * Progress reader
 */
function setupReaderProgress(
    elements
) {
    if (!elements.progress) {
        return;
    }


    const updateProgress =
        () => {

            const scrollTop =
                window.scrollY;


            const documentHeight =
                document.documentElement
                    .scrollHeight -
                window.innerHeight;


            if (documentHeight <= 0) {
                elements.progress.style.width =
                    "0%";

                return;
            }


            const percentage =
                Math.min(
                    100,
                    Math.max(
                        0,
                        (
                            scrollTop /
                            documentHeight
                        ) * 100
                    )
                );


            elements.progress.style.width =
                `${percentage}%`;


            saveReadingHistory(
                percentage
            );
        };


    window.addEventListener(
        "scroll",
        updateProgress,
        {
            passive: true
        }
    );


    updateProgress();
}


/*
 * Simpan history
 */
function saveReadingHistory(
    progress = 0
) {
    if (!currentComic) {
        return;
    }


    const history =
        getReadingHistory();


    const comicId =
        currentComic.endpoint;


    const item = {
        comicId,

        comicEndpoint:
            currentComic.endpoint,

        comicTitle:
            currentComic.title,

        chapter:
            currentChapter
                ? currentChapter.chapter
                : "",

        chapterTitle:
            currentChapter
                ? currentChapter.title
                : "",

        chapterEndpoint:
            currentChapter
                ? currentChapter.endpoint
                : "",

        progress:
            Math.round(progress),

        lastReadAt:
            new Date().toISOString()
    };


    const existingIndex =
        history.findIndex(
            (entry) =>
                entry.comicId ===
                comicId
        );


    if (existingIndex !== -1) {

        history[
            existingIndex
        ] = item;

    } else {

        history.unshift(
            item
        );
    }


    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
            history.slice(0, 50)
        )
    );
}


/*
 * Ambil history
 */
function getReadingHistory() {
    try {

        const data =
            localStorage.getItem(
                HISTORY_KEY
            );


        if (!data) {
            return [];
        }


        const parsed =
            JSON.parse(data);


        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "History error:",
            error
        );

        return [];
    }
}


/*
 * Online / Offline
 */
function setupNetworkStatus(
    elements
) {
    const updateNetworkStatus =
        () => {

            if (!elements.offline) {
                return;
            }


            elements.offline.hidden =
                navigator.onLine;
        };


    window.addEventListener(
        "online",
        updateNetworkStatus
    );


    window.addEventListener(
        "offline",
        updateNetworkStatus
    );


    updateNetworkStatus();
}


/*
 * Error Reader
 */
function showReaderError(
    message
) {
    const loading =
        document.getElementById(
            "reader-loading"
        );

    const images =
        document.getElementById(
            "reader-images"
        );

    const empty =
        document.getElementById(
            "reader-empty"
        );


    if (loading) {
        loading.hidden = true;
    }


    if (images) {
        images.innerHTML = "";
    }


    if (empty) {

        empty.hidden = false;

        empty.innerHTML = `
            <div class="reader-error">

                <h2>
                    Tidak dapat memuat chapter
                </h2>

                <p>
                    ${escapeReaderHTML(
                        message
                    )}
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
}


/*
 * Normalisasi endpoint
 */
function normalizeEndpoint(
    endpoint
) {
    return String(
        endpoint || ""
    )
        .replace(/^\/+/, "")
        .replace(/\/+$/, "");
}


/*
 * Escape HTML
 */
function escapeReaderHTML(
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