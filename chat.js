(() => {
  const toggle = document.querySelector(".chat-toggle");
  const panel = document.getElementById("chat-panel");
  const backdrop = document.getElementById("chat-backdrop");
  const closeBtn = document.querySelector(".chat-close");
  const messagesEl = document.getElementById("chat-messages");
  const chipsEl = document.getElementById("chat-chips");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");

  if (!toggle || !panel) return;

  const history = [];

  function openPanel() {
    panel.hidden = false;
    backdrop.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    backdrop.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    panel.hidden ? openPanel() : closePanel();
  });
  closeBtn.addEventListener("click", closePanel);
  backdrop.addEventListener("click", closePanel);
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
    if (!trimmed) return;

    addBubble("user", trimmed);
    history.push({ role: "user", content: trimmed });

    const pending = addBubble("assistant", "…");

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

      pending.textContent = data.reply;
      history.push({ role: "assistant", content: data.reply });
    } catch (error) {
      pending.textContent =
        "Sorry, something went wrong. Please try again or reach Yoonji directly at zjavbxjlove@naver.com.";
    }

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
      closePanel();
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    } else if (action === "link") {
      window.open(target, "_blank", "noreferrer");
    } else if (action === "ask") {
      sendMessage(chip.dataset.question);
    }
  });
})();
