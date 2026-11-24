// Vanilla-JS port of OriginKit's "Wave Arcs" React component, used as the
// hero background. Usage: WaveArcs.mount(containerEl, { ...options }) ->
// { destroy() }.
(() => {
  const TWO_PI = 2 * Math.PI;
  const map = (v, a, b, c, d) => ((v - a) / (b - a)) * (d - c) + c;

  function parseRGB(str) {
    if (!str) return { r: 255, g: 255, b: 255 };
    const m = str.match(/rgba?\(([^)]+)\)/i);
    if (m) {
      const [r, g, b] = m[1].split(",").map((n) => parseInt(n.trim(), 10));
      return { r, g, b };
    }
    let hex = str.replace(/^#/, "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    return { r: 255, g: 255, b: 255 };
  }

  function mount(container, options = {}) {
    const {
      backgroundColor = "#0A0A0A",
      lineColor = "rgb(255, 255, 255)",
      lineWidth = 1.5,
      lineCount = 76,
      speed = 6,
      glow = 10,
      interactive = true,
    } = options;

    if (!container.style.position) container.style.position = "relative";
    container.style.overflow = "hidden";
    // Paint the backdrop once on the DOM, not per-frame on canvas: a solid
    // fillRect() here can render a hair off from the page's own background
    // (canvas color management vs. CSS), showing as a seam at the box edge.
    // A transparent canvas over a CSS-colored parent always matches exactly.
    container.style.background = backgroundColor;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    // Soft top fade: the lines are otherwise hard-cropped by the
    // container's own edge (overflow: hidden), which reads as a visible
    // rectangle no matter how well the background color matches.
    canvas.style.maskImage = "linear-gradient(to bottom, transparent, black 22%)";
    canvas.style.webkitMaskImage = "linear-gradient(to bottom, transparent, black 22%)";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });

    const state = {
      width: 0,
      height: 0,
      dpr: 1,
      isVisible: true,
      isPageVisible: true,
      animationId: 0,
      frameCount: 0,
    };

    const mouse = { y: 0, targetY: 0 };
    let rect = container.getBoundingClientRect();

    function setup() {
      const dpr = window.devicePixelRatio || 1;
      rect = container.getBoundingClientRect();
      state.width = rect.width;
      state.height = rect.height;
      state.dpr = dpr;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mouse.targetY = state.height / 2;
      mouse.y = state.height / 2;
    }

    function draw() {
      state.frameCount += 1;
      const r = state.width;
      const i = state.height;
      const fc = state.frameCount;

      mouse.y = mouse.y + (mouse.targetY - mouse.y) * 0.1;

      ctx.clearRect(0, 0, r, i);

      const isMobile = r < 768;
      const u = 55000 / glow;
      const { r: cr, g: cg, b: cb } = parseRGB(lineColor);

      ctx.save();
      ctx.lineWidth = lineWidth;
      ctx.translate(r / 2, i + (isMobile ? 60 : 40));

      const f = interactive ? map(mouse.y, 0, i, 1.2, -1.2) : 0;
      const m = Math.max(320, Math.min(1440, r));
      const rate = map(m, 320, 1440, 0.002, 5e-4) * (speed / 5);
      const p = fc * rate;
      const h = r / 2;
      const x = isMobile ? Math.round(lineCount * 0.6) : lineCount;

      for (let k = 0; k < x; k++) {
        let ang = map(k, 0, x, 0, Math.PI) + p;
        ang %= Math.PI;
        const l = (Math.tan(ang) - f) * i;
        const a = Math.abs(l) / 2;
        const yCenter = -i / 2 + l / 2;
        const bright = Math.max(0, Math.min(255, map(Math.abs(l), 0, u, -20, 255))) / 255;
        if (bright <= 0) continue;

        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${bright})`;

        if (a > 499999.5) {
          ctx.beginPath();
          ctx.moveTo(-h, -i / 2);
          ctx.lineTo(h, -i / 2);
          ctx.stroke();
          continue;
        }

        const c2 = Math.acos(Math.min(1, (h + 50) / a));
        const segTotal = Math.max(Math.ceil(a / 120), 200);
        const spans = [
          [c2, Math.PI - c2],
          [Math.PI + c2, TWO_PI - c2],
        ];
        for (const [start, end] of spans) {
          const span = end - start;
          const n3 = Math.max(Math.ceil((span / TWO_PI) * segTotal), 60);
          const step = span / n3;
          ctx.beginPath();
          for (let s = 0; s <= n3; s++) {
            const aa = start + step * s;
            const xx = Math.cos(aa) * a;
            const yy = yCenter + Math.sin(aa) * a;
            s === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
          }
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    function loop() {
      draw();
      state.animationId = requestAnimationFrame(loop);
    }
    function start() {
      if (state.animationId || !state.isVisible || !state.isPageVisible) return;
      state.animationId = requestAnimationFrame(loop);
    }
    function stop() {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
        state.animationId = 0;
      }
    }

    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 100);
    }
    function onPageVis() {
      state.isPageVisible = document.visibilityState === "visible";
      state.isVisible && state.isPageVisible ? start() : stop();
    }
    const io = new IntersectionObserver(
      (entries) => {
        state.isVisible = entries[0]?.isIntersecting ?? true;
        state.isVisible && state.isPageVisible ? start() : stop();
      },
      { threshold: 0 },
    );

    let scrollRaf = 0;
    function onMove(ev) {
      if (state.isVisible) mouse.targetY = ev.clientY - rect.top;
    }
    function onScroll() {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        rect = container.getBoundingClientRect();
        scrollRaf = 0;
      });
    }

    setup();
    io.observe(container);
    start();
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onPageVis);
    if (interactive) {
      document.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return {
      destroy() {
        stop();
        clearTimeout(resizeTimer);
        io.disconnect();
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onPageVis);
        document.removeEventListener("mousemove", onMove);
        window.removeEventListener("scroll", onScroll);
        if (scrollRaf) cancelAnimationFrame(scrollRaf);
        canvas.remove();
      },
    };
  }

  window.WaveArcs = { mount };

  function init() {
    const el = document.querySelector("[data-wave-arcs]");
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    mount(el, {
      backgroundColor: "#0A0A0A",
      lineColor: "rgb(255, 255, 255)",
      lineCount: 76,
      speed: 6,
      glow: 10,
      interactive: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
