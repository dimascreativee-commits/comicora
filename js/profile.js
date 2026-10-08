document.addEventListener("DOMContentLoaded", () => {

    /*
    ========================================
    ELEMENTS
    ========================================
    */

    const profileAvatar =
        document.getElementById(
            "profile-avatar"
        );

    const profileName =
        document.getElementById(
            "profile-name"
        );

    const profileEmail =
        document.getElementById(
            "profile-email"
        );

    const loginStatus =
        document.getElementById(
            "profile-login-status"
        );

    const loginCard =
        document.getElementById(
            "login-card"
        );

    const googleLoginButton =
        document.getElementById(
            "google-login-button"
        );

    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    /*
    ========================================
    DEMO AUTH STORAGE
    ========================================
    */

    const AUTH_KEY =
        "comicora_user";


    /*
    ========================================
    GET USER
    ========================================
    */

    function getUser() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    AUTH_KEY
                )
            );

        } catch (error) {

            return null;
        }
    }


    /*
    ========================================
    SAVE USER
    ========================================
    */

    function saveUser(user) {

        localStorage.setItem(
            AUTH_KEY,
            JSON.stringify(user)
        );
    }


    /*
    ========================================
    CLEAR USER
    ========================================
    */

    function clearUser() {

        localStorage.removeItem(
            AUTH_KEY
        );
    }


    /*
    ========================================
    UPDATE PROFILE UI
    ========================================
    */

    function updateProfile() {

        const user =
            getUser();


        if (!user) {

            profileAvatar.textContent =
                "C";

            profileName.textContent =
                "Guest Reader";

            profileEmail.textContent =
                "Belum login";

            loginStatus.textContent =
                "Belum login";

            loginStatus.classList.remove(
                "is-logged-in"
            );

            loginCard.hidden =
                false;

            logoutButton.hidden =
                true;

            return;
        }


        /*
        User logged in
        */

        profileName.textContent =
            user.name ||
            "Comicora Reader";

        profileEmail.textContent =
            user.email ||
            "Google Account";


        if (user.avatar) {

            profileAvatar.innerHTML = `
                <img
                    src="${escapeHTML(
                        user.avatar
                    )}"
                    alt="${escapeHTML(
                        user.name ||
                        "Profile"
                    )}"
                >
            `;

        } else {

            profileAvatar.textContent =
                getInitial(
                    user.name
                );
        }


        loginStatus.textContent =
            "Login dengan Google";

        loginStatus.classList.add(
            "is-logged-in"
        );


        loginCard.hidden =
            true;

        logoutButton.hidden =
            false;
    }


    /*
    ========================================
    INITIAL LETTER
    ========================================
    */

    function getInitial(name) {

        if (
            !name ||
            typeof name !== "string"
        ) {
            return "C";
        }

        return name
            .trim()
            .charAt(0)
            .toUpperCase();
    }


    /*
    ========================================
    GOOGLE LOGIN PLACEHOLDER
    ========================================

    Untuk sekarang belum melakukan OAuth
    sungguhan.

    Backend + Google OAuth akan menggantikan
    bagian ini.
    ========================================
    */

    googleLoginButton.addEventListener(
        "click",
        () => {

            if (
                window.Comicora &&
                typeof window.Comicora.showToast ===
                    "function"
            ) {

                window.Comicora.showToast(
                    "Google Login akan diaktifkan setelah backend OAuth terpasang."
                );

            } else {

                alert(
                    "Google Login akan diaktifkan setelah backend OAuth terpasang."
                );
            }

        }
    );


    /*
    ========================================
    LOGOUT
    ========================================
    */

    logoutButton.addEventListener(
        "click",
        () => {

            clearUser();

            updateProfile();


            if (
                window.Comicora &&
                typeof window.Comicora.showToast ===
                    "function"
            ) {

                window.Comicora.showToast(
                    "Kamu telah keluar dari akun."
                );
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
            typeof value !== "string"
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

    updateProfile();

});