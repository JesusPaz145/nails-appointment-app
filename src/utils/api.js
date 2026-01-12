// Dynamically determine API URL based on current host
// This allows the app to work on localhost OR a server IP (like 192.168.x.x) automatically
const getApiUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:5000/api'; // Server-side fallback
    return `http://${window.location.hostname}:5000/api`;
};

const API_URL = getApiUrl();

// Helper to get token from cookie - actually we are using httpOnly cookies, so we don't need to send it manually.
// The browser handles it. We just need to ensure credentials: 'include'.

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
            const error = await res.json();
            throw new Error(error.msg || 'Something went wrong');
        }
        return res.json();
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
            const error = await res.json();
            throw new Error(error.msg || 'Something went wrong');
        }
        return res.json();
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
            const error = await res.json();
            throw new Error(error.msg || 'Something went wrong');
        }
        return res.json();
    },

    async delete(endpoint) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.msg || 'Something went wrong');
        }
        return res.json();
    }
};
