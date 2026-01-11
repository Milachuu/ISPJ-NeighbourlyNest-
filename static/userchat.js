const threadButtons = document.querySelectorAll('.userchat-thread-card');
const panels = document.querySelectorAll('.userchat-panel');
const conversationRoot = document.querySelector('.userchat-conversations');

const socket = window.io ? window.io() : null;
const userEmail = conversationRoot?.dataset.userEmail || '';
const userName = conversationRoot?.dataset.userName || 'You';

const setActiveChat = (chatId) => {
  threadButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.chatId === chatId);
    if (button.dataset.chatId === chatId) {
      const unread = button.querySelector('.userchat-thread-unread');
      if (unread) {
        unread.remove();
      }
    }
  });

  panels.forEach((panel) => {
    panel.classList.toggle('is-hidden', panel.dataset.chatId !== chatId);
  });

  if (socket && chatId) {
    socket.emit('join_chat', { booking_id: chatId, user_email: userEmail });
  }
};

threadButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveChat(button.dataset.chatId);
  });
});

const updatePreview = (chatId, message, time) => {
  const button = document.querySelector(`.userchat-thread-card[data-chat-id="${chatId}"]`);
  if (!button) {
    return;
  }

  const preview = button.querySelector('.userchat-thread-preview');
  const timeNode = button.querySelector('.userchat-thread-time');
  if (preview) {
    preview.textContent = message;
  }
  if (timeNode) {
    timeNode.textContent = time;
  }
};

const addUnreadBadge = (chatId) => {
  const button = document.querySelector(`.userchat-thread-card[data-chat-id="${chatId}"]`);
  if (!button || button.classList.contains('is-active')) {
    return;
  }

  const existing = button.querySelector('.userchat-thread-unread');
  if (existing) {
    const count = parseInt(existing.textContent, 10) || 0;
    existing.textContent = `${count + 1}`;
    return;
  }

  const badge = document.createElement('span');
  badge.className = 'userchat-thread-unread';
  badge.textContent = '1';
  button.appendChild(badge);
};

const clearEmptyState = (thread) => {
  const empty = thread.querySelector('.userchat-thread-empty');
  if (empty) {
    empty.remove();
  }
};

const appendMessage = (panel, message, direction) => {
  const thread = panel?.querySelector('.userchat-thread');
  if (!thread) {
    return;
  }

  clearEmptyState(thread);
  const messageWrapper = document.createElement('div');
  messageWrapper.className = `userchat-message userchat-message-${direction}`;

  const meta = document.createElement('div');
  meta.className = 'userchat-message-meta';

  const sender = document.createElement('span');
  sender.className = 'userchat-message-sender';
  sender.textContent = direction === 'outgoing' ? 'You' : message.senderName;

  const time = document.createElement('span');
  time.className = 'userchat-message-time';
  time.textContent = message.time;

  const content = document.createElement('p');
  content.textContent = message.text;

  meta.append(sender, time);
  messageWrapper.append(meta, content);
  thread.appendChild(messageWrapper);
  thread.scrollTop = thread.scrollHeight;
};

const forms = document.querySelectorAll('.userchat-input-bar');
forms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('.userchat-input');
    if (!input) {
      return;
    }

    const text = input.value.trim();
    if (!text || !socket) {
      return;
    }

    const chatId = form.dataset.chatId;
    socket.emit('send_message', {
      booking_id: chatId,
      sender_email: userEmail,
      sender_name: userName,
      message: text,
    });
    input.value = '';
  });
});

if (socket) {
  socket.on('new_message', (payload) => {
    const chatId = String(payload.booking_id);
    const panel = document.querySelector(`.userchat-panel[data-chat-id="${chatId}"]`);
    const direction = payload.sender_email === userEmail ? 'outgoing' : 'incoming';
    appendMessage(panel, {
      senderName: payload.sender_name,
      text: payload.message,
      time: payload.time,
    }, direction);
    updatePreview(chatId, payload.message, payload.time);
    if (direction === 'incoming') {
      addUnreadBadge(chatId);
    }
  });
}

const firstChat = threadButtons[0]?.dataset.chatId;
if (firstChat) {
  setActiveChat(firstChat);
}
