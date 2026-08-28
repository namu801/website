(() => {
  const toggle = document.querySelector(".chat-toggle");
  const panel = document.getElementById("chat-panel");
  const closeBtn = document.querySelector(".chat-close");
  const messagesEl = document.getElementById("chat-messages");
  const chipsEl = document.getElementById("chat-chips");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");

  if (!toggle || !panel) return;

  const history = [];
  const sendBtn = form.querySelector('button[type="submit"]');
  let busy = false;

  function setBusy(value) {
    busy = value;
    input.disabled = value;
    sendBtn.disabled = value;
  }

  function typeOut(el, text, speed = 16) {
    return new Promise((resolve) => {
      let i = 0;
      el.textContent = "";
      (function tick() {
        i += 1;
        el.textContent = text.slice(0, i);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        if (i < text.length) {
          setTimeout(tick, speed);
        } else {
          resolve();
        }
      })();
    });
  }

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    panel.hidden ? openPanel() : closePanel();
  });
  closeBtn.addEventListener("click", closePanel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closePanel();
  });

  function addBubble(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble chat-bubble-${role}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    addBubble("user", trimmed);
    history.push({ role: "user", content: trimmed });

    const pending = addBubble("assistant", "생각 중...");
    pending.classList.add("chat-bubble-thinking");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: history.slice(0, -1),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      pending.classList.remove("chat-bubble-thinking");
      await typeOut(pending, data.reply);
      history.push({ role: "assistant", content: data.reply });
    } catch (error) {
      pending.classList.remove("chat-bubble-thinking");
      pending.textContent =
        "죄송해요, 문제가 발생했어요. 다시 시도해주시거나 zjavbxjlove@naver.com으로 직접 연락해주세요.";
    }

    setBusy(false);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    sendMessage(value);
  });

  chipsEl.addEventListener("click", (event) => {
    const chip = event.target.closest(".chat-chip");
    if (!chip) return;

    const action = chip.dataset.action;
    const target = chip.dataset.target;

    if (action === "scroll") {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    } else if (action === "link") {
      window.open(target, "_blank", "noreferrer");
    } else if (action === "ask") {
      sendMessage(chip.dataset.question);
    }
  });
})();
