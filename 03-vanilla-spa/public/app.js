import { api } from './api.js';
import { render, showMessage } from './view.js';

const state = {
    status: 'loading', // 'loading' | 'ready' | 'error'
    links: [],
    error: '',
};

const form = document.querySelector('#add-form');

const handlers = { onDelete: removeLink, onRetry: loadLinks };
const update = () => render(state, handlers);

async function loadLinks() {
    state.status = 'loading';
    update();

    try {
        state.links = await api.listLinks();
        state.status = 'ready';
    } catch (err) {
        state.status = 'error';
        state.error = err.message;
    }
    update();
}

async function removeLink(id, button) {
    button.disabled = true;
    showMessage('');

    try {
        await api.deleteLink(id);
    } catch (err) {
        if (err.status !== 404) {
            button.disabled = false;
            showMessage(`Could not delete: ${err.message}`);
            return;
        }
    }

    state.links = state.links.filter((link) => link.id !== id);
    update();
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    const data = new FormData(form);

    button.disabled = true;
    showMessage('');

    try {
        const link = await api.addLink(data.get('url'), data.get('note'));
        state.links.push(link);
        state.status = 'ready';
        form.reset();
        update();
    } catch (err) {
        showMessage(`Could not save: ${err.message}`);
    } finally {
        button.disabled = false;
    }
});

loadLinks();