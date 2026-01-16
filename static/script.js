const ws = new WebSocket('wss://chatinterno.onrender.com/ws');

let typingTimeout;
let isTyping = false;

// Função para carregar histórico do servidor
async function loadHistory() {
    const chat = document.getElementById('chat');
    chat.innerHTML = '';

    try {
        const baseUrl = window.location.hostname === 'localhost'
            ? '/history'
            : 'https://chatinterno.onrender.com/history';

        const response = await fetch(baseUrl);
        const history = await response.json();

        history.forEach(msg => {
            chat.innerHTML += `
                <div class="msg">
                    <strong>${msg.user ?? 'Usuário'}:</strong> ${msg.message ?? msg}
                </div>
            `;
        });

        chat.scrollTop = chat.scrollHeight;
    } catch (e) {
        chat.innerHTML = '<div style="color:#f00">Erro ao carregar histórico</div>';
        console.error(e);
    }
}

// Mensagens recebidas via WebSocket (PADRONIZADO)
ws.onmessage = function(event) {
    const chat = document.getElementById('chat');

    const typingDiv = document.querySelector('.typing');
    if (typingDiv) typingDiv.remove();

    let data;
    try {
        data = JSON.parse(event.data);
    } catch {
        data = { user: 'Usuário', message: event.data };
    }

    chat.innerHTML += `
        <div class="msg">
            <strong>${data.user}:</strong> ${data.message}
        </div>
    `;

    chat.scrollTop = chat.scrollHeight;

    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Nova mensagem no chat', { body: data.message });
    }
};

function sendMessage() {
    const input = document.getElementById('messageInput');
    if (input.value.trim()) {
        ws.send(JSON.stringify({
            user: 'Você',
            message: input.value
        }));
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

// DOM totalmente carregado
window.addEventListener('DOMContentLoaded', () => {
    const inputEl = document.getElementById('messageInput');

    inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            sendMessage();
        } else {
            showTyping();
        }
    });

    inputEl.addEventListener('input', showTyping);

    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    loadHistory();
});
