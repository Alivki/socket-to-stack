const API = `${document.documentElement.dataset.api ?? ''}/api/v1`;

const TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 300;

class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status; 
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function send(path, method, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res;
    try {
        res = await fetch(API + path, {
            method,
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
    } catch (err) {
        if (err.name === 'AbortError') throw new ApiError(0, 'Request timed out');
        throw new ApiError(0, 'Network error, is the server running?');
    } finally {
        clearTimeout(timer);
    }

    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(res.status, data?.error ?? `HTTP ${res.status}`);
    return data;
}

function isRetryable(err) {
    return err.status === 0 || err.status === 429 || err.status >= 500;
}

async function request(path, { method = 'GET', body } = {}) {
    const retries = method === 'POST' ? 0 : MAX_RETRIES;

    for (let attempt = 0; ; attempt++) {
        try {
            return await send(path, method, body);
        } catch (err) {
            if (attempt >= retries || !isRetryable(err)) throw err;
            const delay = Math.random() * BASE_DELAY_MS * 2 ** attempt;
            console.warn(`${method} ${path} failed (${err.message}), retry ${attempt + 1} in ${Math.round(delay)}ms`);
            await sleep(delay);
        }
    }
}

export const api = {
    listLinks: () => request('/links'),
    addLink: (url, note) => request('/links', { method: 'POST', body: { url, note } }),
    deleteLink: (id) => request(`/links/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};