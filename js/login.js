document.addEventListener("DOMContentLoaded", () => {
    const googleLoginButton = document.getElementById(
        "google-login-button"
    );

    const existingUser = localStorage.getItem(
        "comicora_user"
    );

    if (existingUser) {
        showLoggedInState();
    }

    if (!googleLoginButton) {
        return;
    }

    googleLoginButton.addEventListener("click", () => {
        startGoogleLogin();
    });
});


function startGoogleLogin() {
    /*
    ========================================
    GOOGLE OAUTH PLACEHOLDER
    ========================================

    V1 akan menggunakan Google OAuth sungguhan
    setelah backend authentication terpasang.

    Untuk sekarang tombol hanya memberikan
    informasi bahwa OAuth belum dikonfigurasi.
    */

    if (window.Comicora) {
        window.Comicora.showToast(
            "Google Login akan diaktifkan setelah backend OAuth terpasang."
        );
    } else {
        alert(
            "Google Login akan diaktifkan setelah backend OAuth terpasang."
        );
    }
}


function showLoggedInState() {
    const googleLoginButton = document.getElementById(
        "google-login-button"
    );

    if (!googleLoginButton) {
        return;
    }

    googleLoginButton.innerHTML = `
        <span>
            Kamu sudah login
        </span>
    `;

    googleLoginButton.addEventListener("click", () => {
        window.location.href = "profile.html";
    });
}