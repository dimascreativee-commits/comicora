/* =========================================
   COMICORA - PWA
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    initPWA();
});


/* =========================================
   PWA STATE
   ========================================= */

let deferredInstallPrompt = null;


/* =========================================
   INITIALIZE PWA
   ========================================= */

function initPWA() {
    registerServiceWorker();
    listenForInstallPrompt();
    initInstallButtons();
    detectStandaloneMode();
}


/* =========================================
   SERVICE WORKER
   ========================================= */

function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        console.log(
            "Browser tidak mendukung Service Worker."
        );

        return;
    }

    window.addEventListener(
        "load",
        async () => {
            try {
                const registration =
                    await navigator.serviceWorker.register(
                        "/sw.js"
                    );

                console.log(
                    "Comicora Service Worker aktif:",
                    registration.scope
                );

            } catch (error) {
                console.error(
                    "Gagal mendaftarkan Service Worker:",
                    error
                );
            }
        }
    );
}


/* =========================================
   INSTALL PROMPT
   ========================================= */

function listenForInstallPrompt() {
    window.addEventListener(
        "beforeinstallprompt",
        (event) => {
            event.preventDefault();

            deferredInstallPrompt = event;

            document.body.classList.add(
                "pwa-install-available"
            );

            showInstallElements();
        }
    );


    window.addEventListener(
        "appinstalled",
        () => {
            deferredInstallPrompt = null;

            document.body.classList.remove(
                "pwa-install-available"
            );

            hideInstallElements();

            if (window.Comicora) {
                window.Comicora.showToast(
                    "Comicora berhasil di-install"
                );
            }

            console.log(
                "Comicora berhasil di-install sebagai PWA."
            );
        }
    );
}


/* =========================================
   INSTALL BUTTONS
   ========================================= */

function initInstallButtons() {
    const installButtons =
        document.querySelectorAll(
            "[data-install-pwa]"
        );

    installButtons.forEach((button) => {
        button.addEventListener(
            "click",
            handleInstallClick
        );
    });
}


/* =========================================
   INSTALL ACTION
   ========================================= */

async function handleInstallClick(event) {
    event.preventDefault();

    if (!deferredInstallPrompt) {
        showInstallInstructions();

        return;
    }

    deferredInstallPrompt.prompt();

    const result =
        await deferredInstallPrompt.userChoice;

    console.log(
        "PWA install result:",
        result.outcome
    );

    deferredInstallPrompt = null;

    document.body.classList.remove(
        "pwa-install-available"
    );
}


/* =========================================
   SHOW INSTALL ELEMENTS
   ========================================= */

function showInstallElements() {
    const elements =
        document.querySelectorAll(
            "[data-pwa-install]"
        );

    elements.forEach((element) => {
        element.hidden = false;
    });
}


/* =========================================
   HIDE INSTALL ELEMENTS
   ========================================= */

function hideInstallElements() {
    const elements =
        document.querySelectorAll(
            "[data-pwa-install]"
        );

    elements.forEach((element) => {
        element.hidden = true;
    });
}


/* =========================================
   INSTALL INSTRUCTIONS
   ========================================= */

function showInstallInstructions() {
    if (window.Comicora) {
        window.Comicora.showToast(
            "Gunakan menu browser lalu pilih Tambahkan ke layar utama."
        );
    }
}


/* =========================================
   STANDALONE MODE
   ========================================= */

function detectStandaloneMode() {
    const isStandalone =
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches ||
        window.navigator.standalone === true;

    if (isStandalone) {
        document.body.classList.add(
            "pwa-standalone"
        );

        console.log(
            "Comicora sedang berjalan sebagai PWA."
        );
    }
}


/* =========================================
   GLOBAL PWA OBJECT
   ========================================= */

window.ComicoraPWA = {
    install: handleInstallClick
};