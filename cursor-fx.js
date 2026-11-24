(() => {
  const fine = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduceMotion) return;

  function boot() {
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
