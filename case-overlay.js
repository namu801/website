(() => {
  const CATS = ["Digital Product", "Experience Design", "Side Projects"];

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
          <div class="work-card-image" data-dither="card"></div>
          <div class="work-card-meta">
            <h4>${w.t}</h4>
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
  let activeSecIndex = 0;
  let scrollObserver = null;

  function buildOverlaySkeleton() {
    root.innerHTML = `
      <div class="overlay" role="dialog" aria-modal="true" hidden>
        <div class="overlay-topbar">
          <div class="wrap">
            <button type="button" class="overlay-back" data-close><span>←</span> Back</button>
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
        <div class="overlay-image-band"><div data-dither="card"></div></div>
        <div class="overlay-facts-band">
          <div class="overlay-facts-grid" data-quickfacts></div>
        </div>
        <div class="overlay-body-band">
          <div class="overlay-body-label">
            <div class="section-index">Overview</div>
          </div>
          <div class="overlay-body-content">
            <div data-facts></div>
            <div class="overlay-metrics" data-metrics></div>
          </div>
        </div>
        <div class="overlay-detail-band">
          <nav class="overlay-detail-nav" data-secnav></nav>
          <div class="overlay-sections" data-sections></div>
        </div>
        <div class="overlay-more-band">
          <div class="inner">
            <div class="overlay-more-label">More case studies</div>
            <div class="overlay-more-grid" data-more></div>
          </div>
          <div class="back-row">
            <button type="button" data-close>← Back to all works</button>
          </div>
        </div>
      </div>
    `;
  }

  function render(i) {
    const w = WORKS[i];
    const panel = root.querySelector(".overlay");

    panel.querySelector("[data-count]").textContent = `Project ${String(i + 1).padStart(2, "0")} / ${String(WORKS.length).padStart(2, "0")}`;
    panel.querySelector("[data-cat]").textContent = w.cat;
    panel.querySelector("[data-title]").textContent = w.t;
    panel.querySelector("[data-summary]").textContent = w.sum;

    panel.querySelector("[data-tags]").innerHTML =
      `<span class="year">${w.y}</span>` + w.tags.map((t) => `<span class="tag">${t}</span>`).join("");

    panel.querySelector("[data-quickfacts]").innerHTML = `
      <div><div class="k">Year</div><div class="v">${w.y}</div></div>
      <div><div class="k">Company</div><div class="v">${w.co}</div></div>
      <div><div class="k">Role</div><div class="v">${w.role}</div></div>
      <div><div class="k">Type</div><div class="v">${w.ty}</div></div>
    `;

    panel.querySelector("[data-facts]").innerHTML = w.facts
      .map((f) => `<div class="overlay-fact-row"><div class="k">${f.k}</div><div class="v">${f.v}</div></div>`)
      .join("");

    panel.querySelector("[data-metrics]").innerHTML = w.metrics
      .map((m) => `<div><div class="n">${m.n}</div><div class="c">${m.c}</div></div>`)
      .join("");

    panel.querySelector("[data-secnav]").innerHTML = w.secs
      .map((s, k) => `<button type="button" data-sec-index="${k}">${s.l}</button>`)
      .join("");

    panel.querySelector("[data-sections]").innerHTML = w.secs
      .map(
        (s) => `
      <div class="overlay-sec" data-sec>
        <div class="label">${s.l}</div>
        <h3>${s.h}</h3>
        <p>${s.b}</p>
        <p>${s.b2}</p>
        <div class="sec-image" data-dither="card"></div>
      </div>
    `,
      )
      .join("");

    const more = [1, 2].map((o) => WORKS[(i + o) % WORKS.length]);
    panel.querySelector("[data-more]").innerHTML = more
      .map(
        (m, k) => `
      <button type="button" class="overlay-more-card" data-more-index="${(i + k + 1) % WORKS.length}">
        <div class="thumb" data-dither="card"></div>
        <div class="body">
          <div class="cat">${m.cat} &nbsp;·&nbsp; ${m.y}</div>
          <h3>${m.t}</h3>
          <p>${m.sum}</p>
        </div>
      </button>
    `,
      )
      .join("");

    activeSecIndex = 0;
    updateSecNav();
    setupScrollSpy(panel);
  }

  function updateSecNav() {
    root.querySelectorAll("[data-sec-index]").forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.secIndex) === activeSecIndex);
    });
  }

  function setupScrollSpy(panel) {
    if (scrollObserver) scrollObserver.disconnect();
    const secs = Array.from(panel.querySelectorAll("[data-sec]"));
    if (!secs.length || !("IntersectionObserver" in window)) return;
    scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = secs.indexOf(entry.target);
            if (idx !== -1 && idx !== activeSecIndex) {
              activeSecIndex = idx;
              updateSecNav();
            }
          }
        });
      },
      { root: panel, rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );
    secs.forEach((el) => scrollObserver.observe(el));
  }

  function open(i) {
    activeIndex = i;
    render(i);
    const panel = root.querySelector(".overlay");
    panel.hidden = false;
    panel.scrollTop = 0;
    document.body.style.overflow = "hidden";
  }

  function close() {
    const panel = root.querySelector(".overlay");
    panel.hidden = true;
    activeIndex = null;
    document.body.style.overflow = "";
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
      const secBtn = event.target.closest("[data-sec-index]");
      if (secBtn) {
        const idx = Number(secBtn.dataset.secIndex);
        const target = root.querySelectorAll("[data-sec]")[idx];
        const panel = root.querySelector(".overlay");
        if (target && panel) {
          panel.scrollTo({
            top: panel.scrollTop + target.getBoundingClientRect().top - panel.getBoundingClientRect().top - 74,
            behavior: "smooth",
          });
        }
        return;
      }
      if (event.target.closest("[data-close]")) {
        close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeIndex !== null) close();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
