document.addEventListener("DOMContentLoaded", () => {

    /*
    ========================================
    ELEMENTS
    ========================================
    */

    const bookmarkGrid =
        document.getElementById(
            "bookmark-comics"
        );

    const emptyState =
        document.getElementById(
            "bookmark-empty"
        );

    const bookmarkCount =
        document.getElementById(
            "bookmark-count"
        );


    /*
    ========================================
    CHECK ELEMENTS
    ========================================
    */

    if (!bookmarkGrid) {
        return;
    }


    /*
    ========================================
    GET COMIC DATA
    ========================================
    */

    const comics =
        Array.isArray(window.comicData)
            ? window.comicData
            : typeof comicData !== "undefined"
                ? comicData
                : [];


    /*
    ========================================
    GET BOOKMARKS
    ========================================
    */

    function getBookmarkIds() {
        if (
            window.Comicora &&
            typeof window.Comicora
                .getBookmarks === "function"
        ) {
            return window.Comicora
                .getBookmarks();
        }

        try {
            return JSON.parse(
                localStorage.getItem(
                    "comicora_bookmarks"
                )
            ) || [];
        } catch (error) {
            return [];
        }
    }


    /*
    ========================================
    RENDER
    ========================================
    */

    function renderBookmarks() {

        const bookmarkIds =
            getBookmarkIds();

        const bookmarkedComics =
            comics.filter(
                (comic) =>
                    bookmarkIds.includes(
                        comic.id
                    )
            );


        /*
        Update count
        */

        bookmarkCount.textContent =
            `${bookmarkedComics.length} ${
                bookmarkedComics.length === 1
                    ? "komik"
                    : "komik"
            }`;


        /*
        Empty state
        */

        if (
            bookmarkedComics.length === 0
        ) {
            bookmarkGrid.innerHTML = "";

            emptyState.classList.add(
                "is-visible"
            );

            return;
        }


        emptyState.classList.remove(
            "is-visible"
        );


        /*
        Render cards
        */

        bookmarkGrid.innerHTML =
            bookmarkedComics
                .map(
                    (comic) =>
                        createComicCard(
                            comic
                        )
                )
                .join("");


        /*
        Update bookmark icon
        */

        if (
            window.Comicora &&
            typeof window.Comicora
                .updateAllBookmarkButtons ===
                "function"
        ) {
            window.Comicora
                .updateAllBookmarkButtons();
        }
    }


    /*
    ========================================
    CREATE COMIC CARD
    ========================================
    */

    function createComicCard(comic) {

        const cover =
            comic.cover ||
            "../assets/images/covers/placeholder.jpg";

        const title =
            comic.title ||
            "Untitled";

        const genre =
            comic.genre ||
            "Webcomic";

        const chapter =
            comic.chapter ||
            0;

        const rating =
            comic.rating ||
            "-";

        const status =
            comic.status ||
            "Ongoing";


        return `
            <article class="comic-card">

                <div class="comic-card-cover">

                    <a
                        href="detail.html?id=${encodeURIComponent(
                            comic.id
                        )}"
                    >

                        <img
                            src="../${cover}"
                            alt="${escapeHTML(
                                title
                            )}"
                            loading="lazy"
                            onerror="this.src='../assets/images/covers/placeholder.jpg'"
                        >

                    </a>


                    <span class="comic-status">
                        ${escapeHTML(
                            status
                        )}
                    </span>


                    <button
                        type="button"
                        class="comic-bookmark-button is-active"
                        data-bookmark="${escapeHTML(
                            comic.id
                        )}"
                        aria-label="Hapus bookmark ${escapeHTML(
                            title
                        )}"
                        aria-pressed="true"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.8L6 21V4.5Z"
                            ></path>
                        </svg>
                    </button>

                </div>


                <div class="comic-card-content">

                    <h3 class="comic-card-title">

                        <a
                            href="detail.html?id=${encodeURIComponent(
                                comic.id
                            )}"
                        >
                            ${escapeHTML(
                                title
                            )}
                        </a>

                    </h3>


                    <div class="comic-card-meta">

                        <span>
                            ${escapeHTML(
                                genre
                            )}
                        </span>

                        <span>
                            ★ ${escapeHTML(
                                String(rating)
                            )}
                        </span>

                    </div>


                    <div class="comic-card-chapter">

                        Chapter
                        ${escapeHTML(
                            String(chapter)
                        )}

                    </div>

                </div>

            </article>
        `;
    }


    /*
    ========================================
    ESCAPE HTML
    ========================================
    */

    function escapeHTML(value) {

        if (
            typeof value !==
            "string"
        ) {
            return "";
        }

        return value
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /*
    ========================================
    BOOKMARK CLICK
    ========================================
    */

    bookmarkGrid.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    "[data-bookmark]"
                );

            if (!button) {
                return;
            }

            const comicId =
                button.dataset.bookmark;

            if (
                window.Comicora &&
                typeof window.Comicora
                    .toggleBookmark ===
                    "function"
            ) {

                window.Comicora
                    .toggleBookmark(
                        comicId
                    );

                /*
                Render ulang supaya
                komik yang dihapus langsung
                hilang dari library.
                */

                setTimeout(
                    () => {
                        renderBookmarks();
                    },
                    0
                );
            }
        }
    );


    /*
    ========================================
    STORAGE EVENT
    ========================================

    Kalau bookmark berubah dari tab lain,
    halaman ini ikut diperbarui.
    ========================================
    */

    window.addEventListener(
        "storage",
        (event) => {

            if (
                event.key ===
                "comicora_bookmarks"
            ) {
                renderBookmarks();
            }

        }
    );


    /*
    ========================================
    INITIAL RENDER
    ========================================
    */

    renderBookmarks();

});