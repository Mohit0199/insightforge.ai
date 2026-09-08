/**
 * Safely resolves an image or asset URL.
 * If the URL is already an absolute CDN URL (e.g. from ImageKit), returns it directly.
 * Otherwise, prepends the backend VITE_API_URL for local/relative assets.
 */
export function getImageUrl(url, fallback = '/placeholder.jpg') {
    if (!url) return fallback;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//') || url.startsWith('data:')) {
        return url;
    }
    const apiUrl = import.meta.env.VITE_API_URL || '';
    // Ensure clean slash handling
    if (apiUrl.endsWith('/') && url.startsWith('/')) {
        return `${apiUrl.slice(0, -1)}${url}`;
    }
    return `${apiUrl}${url}`;
}

export default getImageUrl;
