const message = document.querySelector('#message');
const statusEl = document.querySelector('#status');
const list = document.querySelector('#links');

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text; 
    return node;
}

function linkItem(link, onDelete) {
    const li = el('li');

    const a = el('a', '', link.url);
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    li.append(a);

    if (link.note) li.append(el('p', '', link.note));

    const del = el('button', 'delete', 'Delete');
    del.type = 'button';
    del.addEventListener('click', () => onDelete(link.id, del));
    li.append(del);

    return li;
}

export function render(state, { onDelete, onRetry }) {
    list.replaceChildren(...state.links.map((link) => linkItem(link, onDelete)));
    statusEl.replaceChildren();
    statusEl.hidden = false;

    if (state.status === 'loading') {
        statusEl.append(el('span', 'spinner'), 'Loading…');
    } else if (state.status === 'error') {
        const retry = el('button', '', 'Try again');
        retry.type = 'button';
        retry.addEventListener('click', onRetry);
        statusEl.append(el('span', 'error', state.error), retry);
    } else if (state.links.length === 0) {
        statusEl.append(el('span', 'empty', 'Nothing stashed yet.'));
    } else {
        statusEl.hidden = true;
    }
}

export function showMessage(text) {
    message.textContent = text;
    message.hidden = !text;
}