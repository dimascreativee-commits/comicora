document.addEventListener("DOMContentLoaded", () => {

    /*
    ========================================
    ELEMENTS
    ========================================
    */

    const historyList =
        document.getElementById(
            "history-list"
        );

    const emptyState =
        document.getElementById(
            "history-empty"
        );

    const historyCount =
        document.getElementById(
            "history-count"
        );


    if (!historyList) {
        return;
    }


    /*
    ========================================
    DATA
    ========================================
    */

    const HISTORY_KEY =
        "comicora_history";

    const comics =
        Array.isArray(window.comicData)
            ? window.comicData
            : typeof comicData !== "undefined"
                ? comicData
                : [];


    /*
    ========================================
    GET HISTORY
    ========================================
    */

    function getHistory() {

        try {

            const data =
                JSON.parse(
                    localStorage.getItem(
                        HISTORY_KEY
                    )
                );

            if (!Array.isArray(data)) {
                return [];
            }

            return data;

        } catch (error) {

            console.warn(
                "Gagal membaca history:",
                error
            );

            return [];
        }
    }


    /*
    ========================================
    SAVE HISTORY
    ========================================
    */

    function saveHistory(history) {

        try {

            localStorage.setItem(
                HISTORY_KEY,
                JSON.stringify(history)
            );

        } catch (error) {

            console.warn(
                "Gagal menyimpan history:",
                error
            );
        }
    }


    /*
    ========================================
    FIND COMIC
    ========================================
    */

    function findComic(comicId) {

        return comics.find(
            (comic) =>
                String(comic.id) ===
                String(comicId)
        );
    }


    /*
    ========================================
    FORMAT DATE
    ========================================
    */

    function formatDate(dateString) {

        if (!dateString) {
            return "Baru saja";
        }

        const date =
            new Date(
                dateString
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "Baru saja";
        }

        return date.toLocaleDateString(
            "id-ID",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }


    /*
    ========================================
    CREATE HISTORY ITEM
    ========================================
    */

    function createHistoryItem(
        item,
        comic
    ) {

        const title =
            comic?.title ||
            item.comicTitle ||
            "Untitled";

        const cover =
            comic?.cover ||
            "assets/images/covers/placeholder.jpg";

        const chapter =
            Number(item.chapter) || 1;

        const progress =
            Math.min(
                100,
                Math.max(
                    0,
                    Number(item.progress) || 0
                )
            );


        return `
            <article
                class="history-item"
                data-history-id="${escapeHTML(
                    String(item.comicId)
                )}"
            >

                <a
                    href="detail.html?id=${encodeURIComponent(
                        item.comicId
                    )}"
                    class="history-cover"
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


                <div class="history-content">

                    <h2>
                        <a
                            href="detail.html?id=${encodeURIComponent(
                                item.comicId
                            )}"
                        >
                            ${escapeHTML(
                                title
                            )}
                        </a>
                    </h2>


                    <div class="history-chapter">

                        Chapter
                        ${escapeHTML(
                            String(chapter)
                        )}

                    </div>


                    <div class="history-progress-text">

                        Progress
                        ${progress}%

                    </div>


                    <div class="history-progress">

                        <div
                            class="history-progress-bar"
                            style="width: ${progress}%"
                        ></div>

                    </div>


                    <div class="history-date">

                        Terakhir dibaca:
                        ${escapeHTML(
                            formatDate(
                                item.lastReadAt
                            )
                        )}

                    </div>

                </div>


                <div class="history-actions">

                    <a
                        href="reader.html?id=${encodeURIComponent(
                            item.comicId
                        )}&chapter=${encodeURIComponent(
                            chapter
                        )}"
                        class="history-read-button"
                    >
                        Lanjut Baca
                    </a>


                    <button
                        type="button"
                        class="history-remove-button"
                        data-remove-history="${escapeHTML(
                            String(item.comicId)
                        )}"
                        aria-label="Hapus riwayat ${escapeHTML(
                            title
                        )}"
                    >
                        ×
                    </button>

                </div>

            </article>
        `;
    }


    /*
    ========================================
    RENDER HISTORY
    ========================================
    */

    function renderHistory() {

        const history =
            getHistory();


        /*
        Bersihkan history
        yang comic-nya sudah tidak
        tersedia di data.
        */

        const validHistory =
            history.filter(
                (item) =>
                    findComic(
                        item.comicId
                    ) ||
                    item.comicTitle
            );


        /*
        Count
        */

        historyCount.textContent =
            `${validHistory.length} riwayat`;


        /*
        Empty state
        */

        if (
            validHistory.length === 0
        ) {

            historyList.innerHTML =
                "";

            emptyState.classList.add(
                "is-visible"
            );

            return;
        }


        emptyState.classList.remove(
            "is-visible"
        );


        /*
        Render
        */

        historyList.innerHTML =
            validHistory
                .map(
                    (item) => {

                        const comic =
                            findComic(
                                item.comicId
                            );

                        return createHistoryItem(
                            item,
                            comic
                        );
                    }
                )
                .join("");
    }


    /*
    ========================================
    REMOVE HISTORY
    ========================================
    */

    function removeHistory(
        comicId
    ) {

        const history =
            getHistory();

        const filtered =
            history.filter(
                (item) =>
                    String(
                        item.comicId
                    ) !==
                    String(comicId)
            );

        saveHistory(
            filtered
        );

        renderHistory();

        if (
            window.Comicora &&
            typeof window.Comicora.showToast ===
                "function"
        ) {

            window.Comicora.showToast(
                "Riwayat bacaan dihapus."
            );
        }
    }


    /*
    ========================================
    EVENT DELEGATION
    ========================================
    */

    historyList.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    "[data-remove-history]"
                );

            if (!button) {
                return;
            }

            const comicId =
                button.dataset.removeHistory;

            removeHistory(
                comicId
            );
        }
    );


    /*
    ========================================
    STORAGE EVENT
    ========================================
    */

    window.addEventListener(
        "storage",
        (event) => {

            if (
                event.key ===
                HISTORY_KEY
            ) {
                renderHistory();
            }

        }
    );


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
    INITIALIZE
    ========================================
    */

    renderHistory();

});