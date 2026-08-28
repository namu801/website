(() => {
  const fine = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduceMotion) return;

  function boot() {
    const dot = document.querySelector("[data-cursor-dot]");
    const ring = document.querySelector("[data-cursor-ring]");
    if (!dot || !ring) return;

    const mouse = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let hovering = false;

    document.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    dot.style.transition = "opacity 0.4s ease 0.3s";
    ring.style.transition = "opacity 0.4s ease 0.3s";
    requestAnimationFrame(() => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    });

    function tick() {
      ringPos.x += (mouse.x - ringPos.x) * 0.08;
      ringPos.y += (mouse.y - ringPos.y) * 0.08;
      dot.style.transform = `translate3d(${mouse.x}px,${mouse.y}px,0)`;
      ring.style.transform = `translate3d(${ringPos.x}px,${ringPos.y}px,0) scale(${hovering ? 1.5 : 1})`;
      requestAnimationFrame(tick);
    }
    tick();

    document.querySelectorAll("a, button, [data-work-card], .work-card").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        hovering = true;
        ring.style.background = "#ffffff";
      });
      el.addEventListener("mouseleave", () => {
        hovering = false;
        ring.style.background = "transparent";
      });
    });

    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.style.willChange = "transform";
      el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 10;
        const y = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 10;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0, 0)";
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
