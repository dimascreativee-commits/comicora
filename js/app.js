/* =========================================
   COMICORA - GLOBAL APPLICATION
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initHeaderScroll();
    initGlobalButtons();
    initCurrentYear();
});


/* =========================================
   MOBILE MENU
   ========================================= */

function initMobileMenu() {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");

    if (!menuButton || !mobileMenu) {
        return;
    }

    menuButton.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("is-open");

        menuButton.classList.toggle("is-active", isOpen);

        menuButton.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

        mobileMenu.setAttribute(
            "aria-hidden",
            isOpen ? "false" : "true"
        );
    });

    const mobileLinks = mobileMenu.querySelectorAll("a");

    mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
            mobileMenu.classList.remove("is-open");
            menuButton.classList.remove("is-active");

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

            mobileMenu.setAttribute(
                "aria-hidden",
                "true"
            );
        });
    });
}


/* =========================================
   HEADER SCROLL
   ========================================= */

function initHeaderScroll() {
    const header = document.querySelector(".site-header");

    if (!header) {
        return;
    }

    const updateHeader = () => {
        if (window.scrollY > 20) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    };

    updateHeader();

    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );
}


/* =========================================
   GLOBAL BUTTONS
   ========================================= */

function initGlobalButtons() {
    const bookmarkButtons = document.querySelectorAll(
        "[data-bookmark]"
    );

    bookmarkButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            toggleBookmark(button);
        });
    });
}


/* =========================================
   BOOKMARK
   ========================================= */

function toggleBookmark(button) {
    const comicId = button.dataset.bookmark;

    if (!comicId) {
        return;
    }

    const bookmarks = getBookmarks();

    const index = bookmarks.indexOf(comicId);

    if (index === -1) {
        bookmarks.push(comicId);

        button.classList.add("is-bookmarked");
        button.setAttribute(
            "aria-label",
            "Hapus dari bookmark"
        );

        showToast("Ditambahkan ke bookmark");
    } else {
        bookmarks.splice(index, 1);

        button.classList.remove("is-bookmarked");
        button.setAttribute(
            "aria-label",
            "Tambahkan ke bookmark"
        );

        showToast("Dihapus dari bookmark");
    }

    saveBookmarks(bookmarks);

    updateBookmarkIcon(button);
}


/* =========================================
   BOOKMARK STORAGE
   ========================================= */

function getBookmarks() {
    try {
        const savedBookmarks = localStorage.getItem(
            "comicora_bookmarks"
        );

        if (!savedBookmarks) {
            return [];
        }

        const parsedBookmarks = JSON.parse(
            savedBookmarks
        );

        if (!Array.isArray(parsedBookmarks)) {
            return [];
        }

        return parsedBookmarks;
    } catch (error) {
        console.error(
            "Gagal membaca bookmark:",
            error
        );

        return [];
    }
}


function saveBookmarks(bookmarks) {
    try {
        localStorage.setItem(
            "comicora_bookmarks",
            JSON.stringify(bookmarks)
        );
    } catch (error) {
        console.error(
            "Gagal menyimpan bookmark:",
            error
        );
    }
}


/* =========================================
   UPDATE BOOKMARK ICON
   ========================================= */

function updateBookmarkIcon(button) {
    const isBookmarked = button.classList.contains(
        "is-bookmarked"
    );

    const icon = button.querySelector("svg");

    if (!icon) {
        return;
    }

    if (isBookmarked) {
        icon.setAttribute(
            "fill",
            "currentColor"
        );
    } else {
        icon.setAttribute(
            "fill",
            "none"
        );
    }
}


/* =========================================
   CHECK BOOKMARK STATE
   ========================================= */

function updateAllBookmarkButtons() {
    const bookmarks = getBookmarks();

    const bookmarkButtons = document.querySelectorAll(
        "[data-bookmark]"
    );

    bookmarkButtons.forEach((button) => {
        const comicId = button.dataset.bookmark;

        if (bookmarks.includes(comicId)) {
            button.classList.add("is-bookmarked");

            button.setAttribute(
                "aria-label",
                "Hapus dari bookmark"
            );
        } else {
            button.classList.remove(
                "is-bookmarked"
            );

            button.setAttribute(
                "aria-label",
                "Tambahkan ke bookmark"
            );
        }

        updateBookmarkIcon(button);
    });
}


/* =========================================
   TOAST NOTIFICATION
   ========================================= */

function showToast(message) {
    let toast = document.querySelector(
        ".comicora-toast"
    );

    if (!toast) {
        toast = document.createElement("div");

        toast.className = "comicora-toast";

        document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.classList.add("is-visible");

    clearTimeout(
        toast.hideTimeout
    );

    toast.hideTimeout = setTimeout(() => {
        toast.classList.remove(
            "is-visible"
        );
    }, 2200);
}


/* =========================================
   CURRENT YEAR
   ========================================= */

function initCurrentYear() {
    const yearElements = document.querySelectorAll(
        "[data-current-year]"
    );

    const currentYear = new Date().getFullYear();

    yearElements.forEach((element) => {
        element.textContent = currentYear;
    });
}


/* =========================================
   UTILITY
   ========================================= */

function escapeHTML(value) {
    const element = document.createElement(
        "div"
    );

    element.textContent = value;

    return element.innerHTML;
}


/* =========================================
   GLOBAL EXPORT
   ========================================= */

window.Comicora = {
    getBookmarks,
    saveBookmarks,
    toggleBookmark,
    updateAllBookmarkButtons,
    showToast,
    escapeHTML
};