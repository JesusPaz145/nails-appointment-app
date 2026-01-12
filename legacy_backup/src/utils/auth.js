import { api } from './api';

export async function checkAuth() {
    try {
        const user = await api.get('/auth/me');
        return user;
    } catch (err) {
        return null;
    }
}
