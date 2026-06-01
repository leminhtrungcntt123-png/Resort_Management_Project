const BASE_URL = 'http://localhost:8080';

async function apiClient(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    // Token hết hạn → về login
    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
    }

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message || 'Có lỗi xảy ra');
    }

    return data;
}

export const api = {
    get:    (url: string) =>
        apiClient(url),
    post:   (url: string, body: unknown) =>
        apiClient(url, { method: 'POST',   body: JSON.stringify(body) }),
    put:    (url: string, body: unknown) =>
        apiClient(url, { method: 'PUT',    body: JSON.stringify(body) }),
    patch:  (url: string) =>
        apiClient(url, { method: 'PATCH' }),
    delete: (url: string) =>
        apiClient(url, { method: 'DELETE' }),
};