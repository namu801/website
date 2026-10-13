(() => {
  const toggle = document.querySelector(".chat-toggle");
  const panel = document.getElementById("chat-panel");
  const closeBtn = document.querySelector(".chat-close");
  const messagesEl = document.getElementById("chat-messages");
  const chipsEl = document.getElementById("chat-chips");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const inputBeam = document.getElementById("chat-input-beam");

  if (!toggle || !panel) return;

  const history = [];
  const sendBtn = form.querySelector('button[type="submit"]');
  let busy = false;

  function setBusy(value) {
    busy = value;
    input.disabled = value;
    sendBtn.disabled = value;
  }

  const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
  }

  // Minimal markdown-lite for AI replies: **bold** and bare URLs become real
  // markup, everything else stays as plain escaped text (no full markdown
  // parser needed for 2-4 sentence answers).
  function renderInline(text) {
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noreferrer">$1</a>',
    );
    return html.replace(/\n/g, "<br>");
  }

  // Pulls every [[work:slug]] marker (see chat-rules.md §5-7) out of an AI
  // reply so none ever flashes on screen mid-typewriter; each surviving slug
  // drives a "자세히 보기" button appended once typing finishes. The model is
  // told to use at most one, but this strips all of them defensively rather
  // than leaving a stray un-stripped token visible if it doesn't. Only
  // horizontal whitespace around the token is consumed (not \n) so a token
  // sitting right before a paragraph break doesn't merge the two paragraphs.
  function extractWorkLinks(text) {
    const slugs = [];
    const cleaned = text.replace(/[ \t]*\[\[work:([a-z0-9-]+)\]\][ \t]*/g, (_, slug) => {
      slugs.push(slug);
      return "";
    });
    return { text: cleaned, slugs: [...new Set(slugs)] };
  }

  function appendWorkLinkButtons(bubble, slugs) {
    if (typeof WORKS === "undefined" || typeof window.openWorkBySlug !== "function") return;
    slugs.forEach((slug) => {
      const work = WORKS.find((w) => w.slug === slug);
      if (!work) return;
      const link = document.createElement("button");
      link.type = "button";
      link.className = "chat-work-link";
      link.textContent = `${work.t} 자세히 보기 →`;
      link.addEventListener("click", () => window.openWorkBySlug(slug));
      bubble.appendChild(link);
    });
  }

  function typeOut(el, text, speed = 16) {
    return new Promise((resolve) => {
      let i = 0;
      el.innerHTML = "";
      (function tick() {
        i += 1;
        el.innerHTML = renderInline(text.slice(0, i));
        messagesEl.scrollTop = messagesEl.scrollHeight;
        if (i < text.length) {
          setTimeout(tick, speed);
        } else {
          resolve();
        }
      })();
    });
  }

  // Tracks whether the *user* (not a viewport resize) closed the panel, so
  // resizing back up to desktop width doesn't fight an explicit close.
  let userClosed = false;

  // One sweep of light around the input when the panel actually opens — a
  // nudge to type, not a persistent loop. Re-triggerable: drop the class,
  // force reflow, re-add it, so reopening the panel plays it again.
  function playInputBeam() {
    if (!inputBeam) return;
    inputBeam.classList.remove("beam-intro");
    void inputBeam.offsetWidth;
    inputBeam.classList.add("beam-intro");
  }

  function openPanel({ auto = false, focusInput = true } = {}) {
    const wasHidden = panel.hidden;
    panel.hidden = false;
    document.documentElement.classList.remove("no-agent");
    toggle.setAttribute("aria-expanded", "true");
    if (!auto) userClosed = false;
    if (focusInput) input.focus();
    if (wasHidden) playInputBeam();
  }

  function closePanel({ auto = false } = {}) {
    panel.hidden = true;
    document.documentElement.classList.add("no-agent");
    toggle.setAttribute("aria-expanded", "false");
    if (!auto) userClosed = true;
  }

  toggle.addEventListener("click", () => {
    panel.hidden ? openPanel() : closePanel();
  });
  closeBtn.addEventListener("click", () => closePanel());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closePanel();
  });

  // Panel markup starts closed so narrow viewports (mobile browsers, app
  // webviews) show the homepage first instead of a full-screen Agent panel
  // (the chat-panel becomes a fixed full-screen overlay below 861px — see
  // the matching breakpoint in styles.css). On wider viewports it opens as
  // a docked sidebar by default, same as before. This also has to react to
  // *resizing* an already-open window, not just the state at load: shrinking
  // a desktop window below the breakpoint turned the still-open sidebar into
  // the same full-screen takeover, which is the bug this guards against.
  const desktopQuery = window.matchMedia("(min-width: 861px)");

  function syncPanelToViewport(isDesktop) {
    if (isDesktop) {
      if (!userClosed && panel.hidden) openPanel({ auto: true, focusInput: false });
    } else if (!panel.hidden) {
      closePanel({ auto: true });
    }
  }

  syncPanelToViewport(desktopQuery.matches);
  desktopQuery.addEventListener("change", (event) => syncPanelToViewport(event.matches));

  function addBubble(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble chat-bubble-${role}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  // AI answers aren't bubbles — a small thinking-orbs canvas (see
  // thinking-orb.js) leads every answer, full panel width. While "생각 중"
  // the icon and label sit side by side (chat-answer-pending); once the
  // real reply lands the block switches to icon-above-text and the orb is
  // paused (frozen on its last frame, not destroyed) so it stays visible
  // as a static icon instead of animating forever.
  function addAnswerBlock() {
    const block = document.createElement("div");
    block.className = "chat-answer chat-answer-pending";

    const canvas = document.createElement("canvas");
    canvas.className = "thinking-orb chat-answer-icon";
    block.appendChild(canvas);

    const text = document.createElement("div");
    text.className = "chat-answer-text chat-answer-thinking";
    text.textContent = "생각 중";
    block.appendChild(text);

    messagesEl.appendChild(block);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    const orb =
      window.ThinkingOrbs && typeof window.ThinkingOrbs.createThinkingOrb === "function"
        ? window.ThinkingOrbs.createThinkingOrb(canvas, { state: "composing", size: 64, theme: "dark", ariaLabel: "AI 에이전트" })
        : null;
    // Keep the 64px preset's dot density/speed tuning, just display it
    // smaller — same technique the upstream demo uses for its hero pill
    // (resolvePreset still sees size 64; only the CSS box shrinks).
    canvas.style.width = "42px";
    canvas.style.height = "42px";

    return {
      block,
      text,
      reveal: () => block.classList.remove("chat-answer-pending"),
      pause: () => orb?.setPaused(true),
    };
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    document.getElementById("chat-empty-state")?.remove();

    setBusy(true);
    addBubble("user", trimmed);
    history.push({ role: "user", content: trimmed });

    const { block, text: answerText, reveal, pause } = addAnswerBlock();

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

      answerText.classList.remove("chat-answer-thinking");
      reveal();
      const { text: displayText, slugs } = extractWorkLinks(data.reply);
      await typeOut(answerText, displayText);
      pause();
      appendWorkLinkButtons(block, slugs);
      history.push({ role: "assistant", content: data.reply });
    } catch (error) {
      answerText.classList.remove("chat-answer-thinking");
      reveal();
      answerText.textContent =
        "죄송해요, 문제가 발생했어요. 다시 시도해주시거나 zjavbxjlove@naver.com으로 직접 연락해주세요.";
      pause();
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

    window.gtag?.("event", "chat_chip_click", {
      chip_label: chip.textContent.trim(),
      chip_action: action,
    });

    if (action === "scroll") {
      // A case-study overlay sits opaque on top of the homepage, so a scroll
      // chip clicked while one is open would silently scroll content the
      // visitor can't see. Close it first so the scroll is actually visible.
      window.closeWorkOverlay?.();
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    } else if (action === "link") {
      window.open(target, "_blank", "noreferrer");
    } else if (action === "ask") {
      sendMessage(chip.dataset.question);
    }
  });
})();
