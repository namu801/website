(() => {
  const CATS = ["Digital Product", "Experience Design", "Side Projects"];

  // Renders an <img> into `cls` when the work has a real cover image, else keeps
  // the CSS dither placeholder so projects without photos yet still look done.
  function coverHtml(w, cls) {
    if (w.images && w.images.length) {
      return `<img class="${cls}" src="${w.images[0]}" alt="${w.t}" loading="lazy">`;
    }
    return `<div class="${cls}" data-dither="card"></div>`;
  }

  // Renders the ordered image list (minus the cover, already shown above it)
  // as a stacked gallery inside the case-study detail page.
  function galleryHtml(w) {
    const rest = (w.images || []).slice(1);
    if (!rest.length) return "";
    return `
      <div class="overlay-gallery-band">
        ${rest.map((src) => `<img src="${src}" alt="${w.t}" loading="lazy">`).join("")}
      </div>
    `;
  }

  // ---- Render work-card grids from WORKS (work-data.js) ----
  function renderGrids() {
    CATS.forEach((cat) => {
      const grid = document.querySelector(`[data-work-category="${cat}"]`);
      if (!grid) return;
      WORKS.forEach((w, i) => {
        if (w.cat !== cat) return;
        const card = document.createElement("button");
        card.type = "button";
        card.className = "work-card";
        card.dataset.workIndex = String(i);
        card.innerHTML = `
          ${coverHtml(w, "work-card-image")}
          <div class="work-card-meta">
            <h4 title="${w.t}">${w.t}</h4>
            <span class="work-card-year">${w.y}</span>
          </div>
          <p class="work-card-tags">${w.tags.join(", ")}</p>
        `;
        grid.appendChild(card);
      });
    });
  }

  // ---- Overlay ----
  const root = document.getElementById("case-overlay");
  let activeIndex = null;
  let factTriggers = [];

  // Mirrors the Career section's highlight-underline reveal (motion.js,
  // .exp-row .hl) for the Overview facts, which are injected fresh every
  // time a case study opens — so this runs per-render instead of once at
  // page load, and scrolls against the overlay panel itself (it has its
  // own overflow-y:auto), not the window.
  function animateFactHighlights(panel) {
    factTriggers.forEach((t) => t.kill());
    factTriggers = [];
    const gsap = window.gsap;
    if (!gsap || !window.ScrollTrigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    panel.querySelectorAll(".overlay-fact-row").forEach((row) => {
      const hl = row.querySelectorAll(".hl");
      if (!hl.length) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: row, scroller: panel, start: "top 76%", end: "bottom 62%", scrub: 0.5 },
      });
      hl.forEach((el, k) => {
        tl.fromTo(el, { backgroundSize: "0% 1px" }, { backgroundSize: "100% 1px", duration: 1, ease: "none" }, k * 1.4);
      });
      factTriggers.push(tl.scrollTrigger);
    });
  }

  function buildOverlaySkeleton() {
    root.innerHTML = `
      <div class="overlay" role="dialog" aria-modal="true" hidden>
        <div class="overlay-topbar">
          <div class="wrap">
            <button type="button" class="overlay-back" data-close><span>←</span> 뒤로</button>
            <span class="overlay-brand">YOONJI NAM</span>
            <span class="overlay-count" data-count></span>
          </div>
        </div>
        <div class="overlay-hero">
          <div class="section-index">Case study &nbsp;·&nbsp; <span data-cat></span></div>
          <h1 data-title></h1>
          <p class="overlay-summary" data-summary></p>
          <div class="overlay-tags" data-tags></div>
        </div>
        <div class="overlay-image-band" data-image-band></div>
        <div class="overlay-facts-band">
          <div class="overlay-facts-grid" data-quickfacts></div>
        </div>
        <div class="overlay-body-band">
          <div class="overlay-body-label">
            <div class="section-index">개요</div>
          </div>
          <div class="overlay-body-content">
            <div data-facts></div>
            <div class="overlay-metrics" data-metrics></div>
          </div>
        </div>
        <div data-gallery></div>
        <div class="overlay-more-band">
          <div class="inner">
            <div class="overlay-more-label">다른 작업물</div>
            <div class="overlay-more-grid" data-more></div>
          </div>
          <div class="back-row">
            <button type="button" data-close>← 전체 작업물로</button>
          </div>
        </div>
      </div>
    `;
  }

  function render(i) {
    const w = WORKS[i];
    const panel = root.querySelector(".overlay");

    panel.querySelector("[data-count]").textContent = `프로젝트 ${String(i + 1).padStart(2, "0")} / ${String(WORKS.length).padStart(2, "0")}`;
    panel.querySelector("[data-cat]").textContent = w.cat;
    panel.querySelector("[data-title]").textContent = w.t;
    panel.querySelector("[data-summary]").textContent = w.sum;

    panel.querySelector("[data-image-band]").innerHTML = coverHtml(w, "overlay-cover");
    panel.querySelector("[data-gallery]").innerHTML = galleryHtml(w);

    panel.querySelector("[data-tags]").innerHTML =
      `<span class="year">${w.y}</span>` + w.tags.map((t) => `<span class="tag">${t}</span>`).join("");

    panel.querySelector("[data-quickfacts]").innerHTML = `
      <div><div class="k">연도</div><div class="v">${w.y}</div></div>
      <div><div class="k">회사</div><div class="v">${w.co}</div></div>
      <div><div class="k">역할</div><div class="v">${w.role}</div></div>
      <div><div class="k">유형</div><div class="v">${w.ty}</div></div>
    `;

    panel.querySelector("[data-facts]").innerHTML = w.facts
      .map((f) => `<div class="overlay-fact-row"><div class="k">${f.k}</div><div class="v">${f.v}</div></div>`)
      .join("");
    animateFactHighlights(panel);

    panel.querySelector("[data-metrics]").innerHTML = w.metrics
      .map((m) => `<div><div class="n">${m.n}</div><div class="c">${m.c}</div></div>`)
      .join("");

    const more = [1, 2].map((o) => WORKS[(i + o) % WORKS.length]);
    panel.querySelector("[data-more]").innerHTML = more
      .map(
        (m, k) => `
      <button type="button" class="overlay-more-card" data-more-index="${(i + k + 1) % WORKS.length}">
        ${coverHtml(m, "thumb")}
        <div class="body">
          <div class="cat">${m.cat} &nbsp;·&nbsp; ${m.y}</div>
          <h3>${m.t}</h3>
          <p>${m.sum}</p>
        </div>
      </button>
    `,
      )
      .join("");
  }

  // Case studies are a real navigation state, not just a DOM toggle: opening
  // one pushes a #work/<slug> history entry so the browser's own back button
  // (and deep links / refresh) work, instead of leaving the user stuck with
  // a disabled back button inside a full-screen overlay.
  function open(i, { pushHistory = true } = {}) {
    activeIndex = i;
    render(i);
    const panel = root.querySelector(".overlay");
    panel.hidden = false;
    panel.scrollTop = 0;
    document.body.style.overflow = "hidden";
    if (pushHistory) {
      const hash = `#work/${WORKS[i].slug}`;
      if (location.hash !== hash) {
        history.pushState({ work: i }, "", hash);
      }
    }
  }

  function close({ fromHistory = false } = {}) {
    const panel = root.querySelector(".overlay");
    panel.hidden = true;
    activeIndex = null;
    document.body.style.overflow = "";
    if (!fromHistory && location.hash.startsWith("#work/")) {
      history.replaceState({ work: null }, "", location.pathname + location.search);
    }
  }

  function openFromHash() {
    const match = location.hash.match(/^#work\/(.+)$/);
    if (!match) return false;
    const idx = WORKS.findIndex((w) => w.slug === match[1]);
    if (idx === -1) return false;
    open(idx, { pushHistory: false });
    return true;
  }

  function init() {
    renderGrids();
    buildOverlaySkeleton();

    document.addEventListener("click", (event) => {
      const card = event.target.closest("[data-work-index]");
      if (card) {
        open(Number(card.dataset.workIndex));
        return;
      }
      const moreCard = event.target.closest("[data-more-index]");
      if (moreCard) {
        open(Number(moreCard.dataset.moreIndex));
        return;
      }
      if (event.target.closest("[data-close]")) {
        close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeIndex !== null) close();
    });

    window.addEventListener("popstate", () => {
      if (!openFromHash() && activeIndex !== null) {
        close({ fromHistory: true });
      }
    });

    openFromHash();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
