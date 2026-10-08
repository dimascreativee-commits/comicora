/*
 * Comicora API
 * Source: DeiManga Indonesian Manga API
 */

const COMICORA_API_BASE =
    "https://deimanga-rest-api.vercel.app/api/komiku";


async function comicoraFetch(endpoint) {
    const cleanEndpoint = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;

    const url = `${COMICORA_API_BASE}${cleanEndpoint}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `API Error: ${response.status} ${response.statusText}`
            );
        }

        const result = await response.json();

        if (!result) {
            return [];
        }

        return result;

    } catch (error) {
        console.error("Comicora API Error:", {
            url,
            message: error?.message || error
        });

        throw error;
    }
}


/*
 * Search
 * Response:
 * {
 *   status: "success",
 *   items: [...]
 * }
 */
async function searchComics(query) {
    const value = String(query || "").trim();

    if (!value) {
        return [];
    }

    const result = await comicoraFetch(
        `/search?q=${encodeURIComponent(value)}`
    );

    if (!Array.isArray(result?.items)) {
        return [];
    }

    return result.items;
}


/*
 * Detail manga
 */
async function getComicDetail(endpoint) {
    const slug = String(endpoint || "")
        .replace(/^https?:\/\/[^/]+/i, "")
        .replace(/^\/+/, "")
        .replace(/^manga\//i, "")
        .replace(/\/+$/, "");

    if (!slug) {
        throw new Error("Endpoint manga kosong.");
    }

    const result = await comicoraFetch(
        `/manga/${encodeURIComponent(slug)}`
    );

    return result?.data || result;
}


/*
 * Daftar chapter manga
 */
async function getChapters(endpoint) {
    const slug = String(endpoint || "")
        .replace(/^https?:\/\/[^/]+/i, "")
        .replace(/^\/+/, "")
        .replace(/^manga\//i, "")
        .replace(/\/+$/, "");

    if (!slug) {
        throw new Error("Slug manga kosong.");
    }

    const result = await comicoraFetch(
        `/chapters/${encodeURIComponent(slug)}`
    );

    return result;
}


/*
 * Isi chapter
 */
async function getChapter(endpoint) {
    const slug = String(endpoint || "")
        .replace(/^https?:\/\/[^/]+/i, "")
        .replace(/^\/+/, "")
        .replace(/^ch\//i, "")
        .replace(/\/+$/, "");

    if (!slug) {
        throw new Error("Endpoint chapter kosong.");
    }

    const result = await comicoraFetch(
        `/chapter/${encodeURIComponent(slug)}`
    );

    return result;
}


/*
 * Normalisasi item manga dari DeiManga.
 *
 * API:
 * {
 *   id,
 *   title,
 *   coverArtUrl,
 *   type,
 *   latestChapter
 * }
 */
function normalizeComic(comic = {}) {
    return {
        title: comic.title || "Tanpa Judul",

        cover:
            comic.coverArtUrl ||
            comic.cover ||
            comic.thumb ||
            comic.image ||
            comic.thumbnail ||
            "",

        description:
            comic.description ||
            comic.desc ||
            comic.synopsis ||
            "",

        type: comic.type || "Comic",

        endpoint:
            comic.id ||
            comic.slug ||
            comic.endpoint ||
            "",

        updatedOn:
            comic.updated_on ||
            comic.updatedAt ||
            comic.update ||
            "",

        chapter:
            comic.latestChapter ||
            comic.chapter ||
            ""
    };
}


/*
 * Normalisasi detail manga.
 */
function normalizeComicDetail(comic = {}) {
    return {
        title: comic.title || "Tanpa Judul",

        cover:
            comic.coverArtUrl ||
            comic.cover ||
            comic.thumb ||
            comic.thumbnail ||
            comic.image ||
            "",

        type: comic.type || "Comic",

        author: comic.author || "Tidak diketahui",

        status: comic.status || "Unknown",

        rating: comic.rating || "",

        genre: Array.isArray(comic.genres)
            ? comic.genres
            : Array.isArray(comic.genre)
                ? comic.genre
                : [],

        description:
            comic.description ||
            comic.desc ||
            comic.synopsis ||
            "",

        chapters: []
    };
}


async function getPopularComics(page = 1) {
    return searchComics("naruto");
}

async function getRecommendedComics(page = 1) {
    return searchComics("naruto");
}

async function getNewestComics(page = 1) {
    return searchComics("naruto");
}


window.ComicoraAPI = {
    comicoraFetch,
    getPopularComics,
    getRecommendedComics,
    getNewestComics,
    searchComics,
    getComicDetail,
    getChapters,
    getChapter,
    normalizeComic,
    normalizeComicDetail
};