const threadButtons = document.querySelectorAll('.userchat-thread-card');
const panels = document.querySelectorAll('.userchat-panel');

const formatTime = (date = new Date()) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

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

const appendMessage = (panel, message) => {
  const thread = panel.querySelector('.userchat-thread');
  if (!thread) {
    return;
  }

  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'userchat-message userchat-message-outgoing';

  const meta = document.createElement('div');
  meta.className = 'userchat-message-meta';

  const sender = document.createElement('span');
  sender.className = 'userchat-message-sender';
  sender.textContent = 'You';

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
    if (!text) {
      return;
    }

    const time = formatTime();
    const chatId = form.dataset.chatId;
    const panel = document.querySelector(`.userchat-panel[data-chat-id="${chatId}"]`);
    appendMessage(panel, { text, time });
    updatePreview(chatId, text, time);
    input.value = '';
  });
});
