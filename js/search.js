document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");

    const resultsContainer = document.getElementById("search-results");
    const resultsTitle = document.getElementById("search-results-title");
    const resultsCount = document.getElementById("search-results-count");

    const emptyState = document.getElementById("search-empty");

    const recentSearchContainer =
        document.getElementById("recent-search");

    const recentSearchList =
        document.getElementById("recent-search-list");

    if (!searchForm || !resultsContainer) {
        return;
    }

    /*
    ========================================
    CONFIGURATION
    ========================================
    */

    const RECENT_SEARCH_KEY = "comicora_recent_searches";
    const MAX_RECENT_SEARCHES = 6;

    /*
    ========================================
    GET COMIC DATA
    ========================================
    */

    const comics = Array.isArray(window.comicData)
        ? window.comicData
        : typeof comicData !== "undefined"
            ? comicData
            : [];

    /*
    ========================================
    ESCAPE HTML
    ========================================
    */

    function escapeHTML(value) {
        if (typeof value !== "string") {
            return "";
        }

        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /*
    ========================================
    GET URL QUERY
    ========================================
    */

    function getSearchQuery() {
        const params = new URLSearchParams(
            window.location.search
        );

        return params.get("q") || "";
    }

    /*
    ========================================
    SAVE RECENT SEARCH
    ========================================
    */

    function saveRecentSearch(query) {
        const cleanQuery = query.trim();

        if (!cleanQuery) {
            return;
        }

        let searches = getRecentSearches();

        searches = searches.filter(
            (item) =>
                item.toLowerCase() !==
                cleanQuery.toLowerCase()
        );

        searches.unshift(cleanQuery);

        searches = searches.slice(
            0,
            MAX_RECENT_SEARCHES
        );

        localStorage.setItem(
            RECENT_SEARCH_KEY,
            JSON.stringify(searches)
        );
    }

    /*
    ========================================
    GET RECENT SEARCH
    ========================================
    */

    function getRecentSearches() {
        try {
            const saved =
                localStorage.getItem(
                    RECENT_SEARCH_KEY
                );

            if (!saved) {
                return [];
            }

            const parsed = JSON.parse(saved);

            return Array.isArray(parsed)
                ? parsed
                : [];
        } catch (error) {
            return [];
        }
    }

    /*
    ========================================
    RENDER RECENT SEARCH
    ========================================
    */

    function renderRecentSearches() {
        const searches = getRecentSearches();

        if (!recentSearchContainer || !recentSearchList) {
            return;
        }

        if (searches.length === 0) {
            recentSearchContainer.style.display = "none";
            return;
        }

        recentSearchContainer.style.display = "block";

        recentSearchList.innerHTML = searches
            .map(
                (query) => `
                    <button
                        type="button"
                        class="recent-search-item"
                        data-recent-search="${escapeHTML(query)}"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="9"
                            ></circle>

                            <path
                                d="M12 7v5l3 2"
                            ></path>
                        </svg>

                        <span>
                            ${escapeHTML(query)}
                        </span>
                    </button>
                `
            )
            .join("");
    }

    /*
    ========================================
    FILTER COMICS
    ========================================
    */

    function searchComics(query) {
        const cleanQuery = query
            .trim()
            .toLowerCase();

        if (!cleanQuery) {
            return comics;
        }

        return comics.filter((comic) => {
            const title =
                comic.title || "";

            const genre =
                comic.genre || "";

            const description =
                comic.description || "";

            const author =
                comic.author || "";

            const alternativeTitle =
                comic.alternativeTitle || "";

            const searchableText = [
                title,
                genre,
                description,
                author,
                alternativeTitle
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
                cleanQuery
            );
        });
    }

    /*
    ========================================
    RENDER COMIC CARD
    ========================================
    */

    function createComicCard(comic) {
        const cover = comic.cover || "";
        const title = comic.title || "Untitled";

        const genre =
            comic.genre || "Webcomic";

        const status =
            comic.status || "Ongoing";

        const chapter =
            comic.chapter || 0;

        const rating =
            comic.rating || "—";

        const statusClass =
            status.toLowerCase() === "completed"
                ? "completed"
                : "ongoing";

        return `
            <article
                class="comic-card"
                data-comic-id="${escapeHTML(
                    comic.id || ""
                )}"
            >

                <a
                    href="detail.html?id=${encodeURIComponent(
                        comic.id || ""
                    )}"
                    class="comic-card-link"
                >

                    <div class="comic-cover">

                        <img
                            src="../${escapeHTML(cover)}"
                            alt="${escapeHTML(title)}"
                            loading="lazy"
                            onerror="
                                this.src='../assets/images/covers/placeholder.jpg';
                            "
                        >

                        <span
                            class="
                                comic-status
                                ${statusClass}
                            "
                        >
                            ${escapeHTML(status)}
                        </span>

                    </div>

                </a>


                <button
                    type="button"
                    class="comic-bookmark"
                    data-bookmark="${escapeHTML(
                        comic.id || ""
                    )}"
                    aria-label="Tambah bookmark"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z"
                        ></path>
                    </svg>
                </button>


                <div class="comic-card-content">

                    <a
                        href="detail.html?id=${encodeURIComponent(
                            comic.id || ""
                        )}"
                        class="comic-title"
                    >
                        ${escapeHTML(title)}
                    </a>

                    <div class="comic-meta">

                        <span>
                            ${escapeHTML(genre)}
                        </span>

                        <span>
                            ★ ${escapeHTML(
                                String(rating)
                            )}
                        </span>

                    </div>

                    <div class="comic-chapter">
                        Chapter ${escapeHTML(
                            String(chapter)
                        )}
                    </div>

                </div>

            </article>
        `;
    }

    /*
    ========================================
    RENDER RESULTS
    ========================================
    */

    function renderResults(query = "") {
        const results = searchComics(query);

        resultsContainer.innerHTML = "";

        if (query.trim()) {
            resultsTitle.textContent =
                `Hasil untuk "${query.trim()}"`;
        } else {
            resultsTitle.textContent =
                "Semua Komik";
        }

        resultsCount.textContent =
            `${results.length} komik`;

        if (results.length === 0) {
            emptyState.classList.add(
                "is-visible"
            );

            return;
        }

        emptyState.classList.remove(
            "is-visible"
        );

        resultsContainer.innerHTML =
            results
                .map(createComicCard)
                .join("");

        /*
        Update bookmark state
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
    PERFORM SEARCH
    ========================================
    */

    function performSearch(query) {
        const cleanQuery =
            query.trim();

        if (searchInput) {
            searchInput.value =
                cleanQuery;
        }

        if (cleanQuery) {
            saveRecentSearch(
                cleanQuery
            );

            renderRecentSearches();
        }

        const url =
            new URL(
                window.location.href
            );

        if (cleanQuery) {
            url.searchParams.set(
                "q",
                cleanQuery
            );
        } else {
            url.searchParams.delete(
                "q"
            );
        }

        window.history.replaceState(
            {},
            "",
            url
        );

        renderResults(
            cleanQuery
        );
    }

    /*
    ========================================
    SEARCH FORM
    ========================================
    */

    searchForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            const query =
                searchInput
                    ? searchInput.value
                    : "";

            performSearch(query);
        }
    );

    /*
    ========================================
    RECENT SEARCH CLICK
    ========================================
    */

    if (recentSearchList) {
        recentSearchList.addEventListener(
            "click",
            (event) => {
                const button =
                    event.target.closest(
                        "[data-recent-search]"
                    );

                if (!button) {
                    return;
                }

                const query =
                    button.dataset
                        .recentSearch || "";

                performSearch(
                    query
                );
            }
        );
    }

    /*
    ========================================
    INITIALIZE
    ========================================
    */

    renderRecentSearches();

    const initialQuery =
        getSearchQuery();

    renderResults(
        initialQuery
    );
});