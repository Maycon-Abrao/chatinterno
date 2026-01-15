const ws = new WebSocket('wss://chatinterno.onrender.com/ws');

let typingTimeout;
let isTyping = false;

// Função para carregar histórico do servidor
async function loadHistory() {
    const chat = document.getElementById('chat');
    chat.innerHTML = '';
    try {
        // Detecta se está rodando local ou em produção
        const baseUrl = window.location.hostname === 'localhost'
            ? '/history'
            : 'https://chatinterno.onrender.com/history';
        const response = await fetch(baseUrl);
        const history = await response.json();
        history.forEach(msg => {
            chat.innerHTML += `<div>${msg}</div>`;
        });
        chat.scrollTop = chat.scrollHeight;
    } catch (e) {
        chat.innerHTML = '<div style="color:#f00">Erro ao carregar histórico</div>';
    }
}

// Solicitar permissão de notificação ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    loadHistory();
});

ws.onmessage = function(event) {
    const chat = document.getElementById('chat');
    // Remove "digitando..." se existir
    const typingDiv = document.querySelector('.typing');
    if (typingDiv) typingDiv.remove();
    chat.innerHTML += `<div>${event.data}</div>`;
    chat.scrollTop = chat.scrollHeight;

    // Notificação do navegador
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Nova mensagem no chat', { body: event.data });
    }
};

function sendMessage() {
    const input = document.getElementById('messageInput');
    if (input.value.trim() !== '') {
        ws.send(input.value);
        input.value = '';
        removeTyping();
    }
}

function showTyping() {
    if (!isTyping) {
        const chat = document.getElementById('chat');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing';
        typingDiv.innerText = 'Digitando...';
        chat.appendChild(typingDiv);
        chat.scrollTop = chat.scrollHeight;
        isTyping = true;
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(removeTyping, 1500);
}

function removeTyping() {
    const typingDiv = document.querySelector('.typing');
    if (typingDiv) typingDiv.remove();
    isTyping = false;
}

const inputEl = document.getElementById('messageInput');
inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    } else {
        showTyping();
    }
});
inputEl.addEventListener('input', showTyping);