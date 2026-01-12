const api = {
    async get(url) {
        const res = await fetch(`/api${url}`);
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || data.msg || 'Error fetching data');
        }
        return res.json();
    },
    async post(url, body) {
        const res = await fetch(`/api${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || data.msg || 'Error posting data');
        }
        return res.json();
    },
    async put(url, body) {
        const res = await fetch(`/api${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || data.msg || 'Error updating data');
        }
        return res.json();
    },
    async delete(url) {
        const res = await fetch(`/api${url}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || data.msg || 'Error deleting data');
        }
        return res.json();
    }
};

window.api = api;
