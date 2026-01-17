/* ===============================
   IDENTIDADE DO CLIENTE
================================ */

// ID único por navegador (NUNCA muda)
const clientId = localStorage.getItem('clientId') || crypto.randomUUID();
localStorage.setItem('clientId', clientId);

// Nome exibido no chat
const username = localStorage.getItem('username')
    || `Usuário-${Math.floor(Math.random() * 10000)}`;
localStorage.setItem('username', username);

/* ===============================
   WEBSOCKET
================================ */

const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(`${protocol}://${location.host}/ws`);

ws.onopen = () => console.log('✅ WebSocket conectado');
ws.onerror = err => console.error('❌ Erro WebSocket', err);
ws.onclose = () => console.warn('⚠️ WebSocket desconectado');

/* ===============================
   NOTIFICAÇÕES
================================ */

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/* ===============================
   HISTÓRICO
================================ */

async function loadHistory() {
    const chat = document.getElementById('chat');
    chat.innerHTML = '';

    try {
        const response = await fetch('/history');
        const history = await response.json();

        history.forEach(msg => {
            const isMe = msg.clientId === clientId;

            chat.innerHTML += `
                <div class="msg ${isMe ? 'me' : 'other'}">
                    <strong>${isMe ? 'Você' : msg.user}:</strong>
                    ${msg.message}
                </div>
            `;
        });

        chat.scrollTop = chat.scrollHeight;
    } catch (e) {
        chat.innerHTML = '<div style="color:red">Erro ao carregar histórico</div>';
        console.error(e);
    }
}

/* ===============================
   RECEBER MENSAGEM
================================ */

ws.onmessage = event => {
    const chat = document.getElementById('chat');

    document.querySelector('.typing')?.remove();

    const data = JSON.parse(event.data);
    const isMe = data.clientId === clientId;

    chat.innerHTML += `
        <div class="msg ${isMe ? 'me' : 'other'}">
            <strong>${isMe ? 'Você' : data.user}:</strong>
            ${data.message}
        </div>
    `;

    chat.scrollTop = chat.scrollHeight;

    // 🔔 NOTIFICAÇÃO (somente mensagens de OUTROS usuários)
    if (
        !isMe &&
        document.hidden &&
        'Notification' in window &&
        Notification.permission === 'granted'
    ) {
        new Notification('Nova mensagem no Chat Interno', {
            body: `${data.user}: ${data.message}`,
            icon: '/static/sobre.png'
        });
    }
};

/* ===============================
   ENVIAR MENSAGEM
================================ */

function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input.value.trim()) return;

    ws.send(JSON.stringify({
        clientId,
        user: username,
        message: input.value
    }));

    input.value = '';
    removeTyping();
}

/* ===============================
   DIGITANDO...
================================ */

let typingTimeout;
let isTyping = false;

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
    document.querySelector('.typing')?.remove();
    isTyping = false;
}

/* ===============================
   INIT
================================ */

window.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('messageInput');

    // Permissão de notificação APÓS interação
    input.addEventListener('focus', requestNotificationPermission);

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            sendMessage();
        } else {
            showTyping();
        }
    });

    input.addEventListener('input', showTyping);

    loadHistory();
});
