/* =========================================
   COMICORA - DISCOVER PAGE
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    initDiscoverPage();
});


/* =========================================
   STATE
   ========================================= */

let currentFilter = "all";
let currentGenre = "all";
let currentSearch = "";


/* =========================================
   INITIALIZE
   ========================================= */

function initDiscoverPage() {
    const container = document.querySelector(
        "#discover-comics"
    );

    if (!container) {
        return;
    }

    renderDiscoverComics();
    initDiscoverTabs();
    initGenreFilters();
    initDiscoverSearch();

    if (window.Comicora) {
        window.Comicora.updateAllBookmarkButtons();
    }

    readURLFilters();
}


/* =========================================
   READ URL FILTER
   ========================================= */

function readURLFilters() {
    const params = new URLSearchParams(
        window.location.search
    );

    const genre = params.get("genre");
    const sort = params.get("sort");

    if (genre) {
        const genreButton = document.querySelector(
            `[data-genre="${genre}"]`
        );

        if (genreButton) {
            currentGenre = genre;

            document
                .querySelectorAll(
                    ".genre-filter-button"
                )
                .forEach((button) => {
                    button.classList.remove(
                        "is-active"
                    );
                });

            genreButton.classList.add(
                "is-active"
            );
        }
    }

    if (sort) {
        let filter = "all";

        if (sort === "popular") {
            filter = "popular";
        }

        if (sort === "new") {
            filter = "new";
        }

        const filterButton =
            document.querySelector(
                `[data-filter="${filter}"]`
            );

        if (filterButton) {
            currentFilter = filter;

            document
                .querySelectorAll(
                    ".discover-tab"
                )
                .forEach((button) => {
                    button.classList.remove(
                        "is-active"
                    );
                });

            filterButton.classList.add(
                "is-active"
            );
        }
    }

    renderDiscoverComics();
}


/* =========================================
   FILTER TABS
   ========================================= */

function initDiscoverTabs() {
    const tabs = document.querySelectorAll(
        ".discover-tab"
    );

    tabs.forEach((tab) => {
        tab.addEventListener(
            "click",
            () => {

                currentFilter =
                    tab.dataset.filter || "all";

                tabs.forEach((item) => {
                    item.classList.remove(
                        "is-active"
                    );
                });

                tab.classList.add(
                    "is-active"
                );

                updateResultsTitle();

                renderDiscoverComics();
            }
        );
    });
}


/* =========================================
   GENRE FILTER
   ========================================= */

function initGenreFilters() {
    const buttons =
        document.querySelectorAll(
            ".genre-filter-button"
        );

    buttons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {

                currentGenre =
                    button.dataset.genre || "all";

                buttons.forEach((item) => {
                    item.classList.remove(
                        "is-active"
                    );
                });

                button.classList.add(
                    "is-active"
                );

                renderDiscoverComics();
            }
        );
    });
}


/* =========================================
   SEARCH
   ========================================= */

function initDiscoverSearch() {
    const form = document.querySelector(
        "#discover-search-form"
    );

    const input = document.querySelector(
        "#discover-search-input"
    );

    if (!form || !input) {
        return;
    }

    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            currentSearch =
                input.value
                    .trim()
                    .toLowerCase();

            renderDiscoverComics();

        }
    );

    input.addEventListener(
        "input",
        () => {

            currentSearch =
                input.value
                    .trim()
                    .toLowerCase();

            renderDiscoverComics();

        }
    );
}


/* =========================================
   FILTER DATA
   ========================================= */

function getFilteredComics() {

    let results = [
        ...comicData
    ];


    /* -----------------------------------------
       SEARCH
       ----------------------------------------- */

    if (currentSearch) {

        results = results.filter(
            (comic) => {

                const title =
                    comic.title.toLowerCase();

                const genre =
                    comic.genre.toLowerCase();

                const description =
                    comic.description
                        .toLowerCase();

                return (
                    title.includes(
                        currentSearch
                    ) ||
                    genre.includes(
                        currentSearch
                    ) ||
                    description.includes(
                        currentSearch
                    )
                );

            }
        );

    }


    /* -----------------------------------------
       GENRE
       ----------------------------------------- */

    if (
        currentGenre &&
        currentGenre !== "all"
    ) {

        results = results.filter(
            (comic) => {
                return (
                    comic.genre ===
                    currentGenre
                );
            }
        );

    }


    /* -----------------------------------------
       TAB
       ----------------------------------------- */

    if (currentFilter === "completed") {

        results = results.filter(
            (comic) => {
                return (
                    comic.status ===
                    "Completed"
                );
            }
        );

    }


    if (currentFilter === "popular") {

        results.sort(
            (a, b) => {
                return (
                    Number(b.rating) -
                    Number(a.rating)
                );
            }
        );

    }


    if (currentFilter === "new") {

        /*
         * Untuk sementara data terbaru
         * menggunakan urutan data.
         *
         * Nanti saat CMS/backend aktif,
         * sorting akan menggunakan
         * published_at / created_at.
         */

        results = results.reverse();

    }


    return results;
}


/* =========================================
   RENDER
   ========================================= */

function renderDiscoverComics() {

    const container =
        document.querySelector(
            "#discover-comics"
        );

    const emptyState =
        document.querySelector(
            "#discover-empty"
        );

    if (!container) {
        return;
    }


    const results =
        getFilteredComics();


    /* -----------------------------------------
       Update count
       ----------------------------------------- */

    const count =
        document.querySelector(
            "#results-count"
        );

    if (count) {

        count.textContent =
            `${results.length} komik`;

    }


    /* -----------------------------------------
       Empty state
       ----------------------------------------- */

    if (
        results.length === 0
    ) {

        container.innerHTML = "";

        if (emptyState) {
            emptyState.classList.add(
                "is-visible"
            );
        }

        return;

    }


    if (emptyState) {
        emptyState.classList.remove(
            "is-visible"
        );
    }


    /* -----------------------------------------
       Render cards
       ----------------------------------------- */

    container.innerHTML =
        results
            .map(
                (comic) =>
                    createDiscoverCard(
                        comic
                    )
            )
            .join("");


    if (window.Comicora) {
        window.Comicora
            .updateAllBookmarkButtons();
    }

}


/* =========================================
   DISCOVER CARD
   ========================================= */

function createDiscoverCard(comic) {

    return `
        <article class="comic-card">

            <a
                href="detail.html?id=${comic.id}"
                class="comic-card-link"
                aria-label="Buka ${escapeHTML(
                    comic.title
                )}"
            >

                <div class="comic-card-cover">

                    <img
                        src="../${comic.cover}"
                        alt="Cover ${escapeHTML(
                            comic.title
                        )}"
                        loading="lazy"
                        onerror="this.src='../assets/images/covers/placeholder.jpg'"
                    >

                    <span class="comic-status">
                        ${escapeHTML(
                            comic.status
                        )}
                    </span>

                </div>


                <div class="comic-card-content">

                    <h3 class="comic-card-title">
                        ${escapeHTML(
                            comic.title
                        )}
                    </h3>


                    <div class="comic-card-meta">

                        <span>
                            ${escapeHTML(
                                comic.genre
                            )}
                        </span>

                        <span>
                            ★ ${escapeHTML(
                                comic.rating
                            )}
                        </span>

                    </div>


                    <div class="comic-card-chapter">
                        ${escapeHTML(
                            comic.chapter
                        )}
                    </div>

                </div>

            </a>


            <button
                type="button"
                class="comic-bookmark"
                data-bookmark="${comic.id}"
                aria-label="Tambahkan ke bookmark"
            >

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >

                    <path
                        d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
                    ></path>

                </svg>

            </button>

        </article>
    `;
}


/* =========================================
   RESULTS TITLE
   ========================================= */

function updateResultsTitle() {

    const title =
        document.querySelector(
            "#results-title"
        );

    if (!title) {
        return;
    }


    if (currentSearch) {

        title.textContent =
            `Hasil untuk "${currentSearch}"`;

        return;
    }


    if (
        currentGenre &&
        currentGenre !== "all"
    ) {

        title.textContent =
            currentGenre;

        return;
    }


    const titles = {
        all: "Semua Komik",
        popular: "Komik Popular",
        new: "Komik Terbaru",
        completed: "Komik Completed"
    };


    title.textContent =
        titles[currentFilter] ||
        "Semua Komik";
}


/* =========================================
   ESCAPE HTML
   ========================================= */

function escapeHTML(value) {

    const element =
        document.createElement(
            "div"
        );

    element.textContent = value;

    return element.innerHTML;
}