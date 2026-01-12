// Determine API URL: prefer build-time `PUBLIC_API_URL`, then runtime host fallback.
// This ensures production builds use the configured API endpoint (e.g. via env in Portainer).
const getApiUrl = () => {
    // 1) Build-time env injected by Vite/Astro (import.meta.env)
    try {
        const meta = typeof import !== 'undefined' ? import.meta : undefined;
        const publicUrl = meta && meta.env && meta.env.PUBLIC_API_URL;
        if (publicUrl) return publicUrl;
    } catch (e) {
        // ignore
    }

    // 2) Server-side fallback
    if (typeof window === 'undefined') return 'http://localhost:5000/api';

    // 3) Runtime fallback: derive from current hostname (keeps previous behavior)
    return `http://${window.location.hostname}:5000/api`;
};

const API_URL = getApiUrl();

// Helper to get token from cookie - actually we are using httpOnly cookies, so we don't need to send it manually.
// The browser handles it. We just need to ensure credentials: 'include'.

async function parseResponse(res) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return res.json();
    }
    return res.text();
}

export const api = {
    async get(endpoint) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!res.ok) {
            const errorBody = await (async () => {
                try { return await parseResponse(res); } catch (e) { return res.statusText || 'Unknown error'; }
            })();
            // If errorBody is a JSON object, try to extract a .msg
            const msg = (typeof errorBody === 'object' && errorBody !== null) ? (errorBody.msg || JSON.stringify(errorBody)) : String(errorBody);
            throw new Error(msg || 'Something went wrong');
        }
        return parseResponse(res);
    },

    async post(endpoint, body) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            credentials: 'include'
        });
        if (!res.ok) {
            const errorBody = await (async () => {
                try { return await parseResponse(res); } catch (e) { return res.statusText || 'Unknown error'; }
            })();
            const msg = (typeof errorBody === 'object' && errorBody !== null) ? (errorBody.msg || JSON.stringify(errorBody)) : String(errorBody);
            throw new Error(msg || 'Something went wrong');
        }
        return parseResponse(res);
    },

    async put(endpoint, body) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            credentials: 'include'
        });
        if (!res.ok) {
            const errorBody = await (async () => {
                try { return await parseResponse(res); } catch (e) { return res.statusText || 'Unknown error'; }
            })();
            const msg = (typeof errorBody === 'object' && errorBody !== null) ? (errorBody.msg || JSON.stringify(errorBody)) : String(errorBody);
            throw new Error(msg || 'Something went wrong');
        }
        return parseResponse(res);
    },

    async delete(endpoint) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!res.ok) {
            const errorBody = await (async () => {
                try { return await parseResponse(res); } catch (e) { return res.statusText || 'Unknown error'; }
            })();
            const msg = (typeof errorBody === 'object' && errorBody !== null) ? (errorBody.msg || JSON.stringify(errorBody)) : String(errorBody);
            throw new Error(msg || 'Something went wrong');
        }
        return parseResponse(res);
    }
};
