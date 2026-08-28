(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initInvertToggle() {
    const html = document.documentElement;
    const toggle = document.querySelector("[data-invert-toggle]");
    const label = document.querySelector("[data-invert-label]");
    if (!toggle) return;

    let saved = null;
    try {
      saved = localStorage.getItem("yn-v2-invert");
    } catch (e) {}
    if (saved === "1") html.setAttribute("data-invert", "1");

    function sync() {
      const inverted = html.getAttribute("data-invert") === "1";
      if (label) label.textContent = inverted ? "Light" : "Invert";
    }
    sync();

    toggle.addEventListener("click", () => {
      const next = html.getAttribute("data-invert") === "1" ? "0" : "1";
      if (next === "1") {
        html.setAttribute("data-invert", "1");
      } else {
        html.removeAttribute("data-invert");
      }
      try {
        localStorage.setItem("yn-v2-invert", next);
      } catch (e) {}
      sync();
    });
  }

  function initScrollProgress() {
    const bar = document.querySelector("[data-progress]");
    if (!bar) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight || 1;
      bar.style.width = Math.min(100, Math.max(0, (window.scrollY / max) * 100)) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initKpis() {
    const items = document.querySelectorAll("[data-kpi]");
    if (!items.length) return;

    items.forEach((el) => {
      const target = parseFloat(el.dataset.kpi);
      const dec = parseInt(el.dataset.dec || "0", 10);
      el.textContent = (0).toFixed(dec);

      const run = () => {
        if (reduceMotion || !window.gsap) {
          el.textContent = target.toFixed(dec);
          return;
        }
        const o = { v: 0 };
        window.gsap.to(o, {
          v: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = o.v.toFixed(dec);
          },
        });
      };

      if (!("IntersectionObserver" in window)) {
        run();
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              run();
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 },
      );
      io.observe(el);
    });
  }

  function initReveals() {
    if (reduceMotion || !window.gsap) return;
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    const heroLines = document.querySelectorAll('[data-anim="line"] > span > span');
    gsap.set(heroLines, { clipPath: "inset(0 0 100% 0)" });
    gsap.to(heroLines, { clipPath: "inset(0 0 0% 0)", duration: 1.1, stagger: 0.16, ease: "power4.out", delay: 0.1 });

    gsap.from(document.querySelectorAll('[data-anim="fade"]'), {
      y: 18,
      opacity: 0,
      duration: 0.8,
      delay: 0.4,
      stagger: 0.08,
      ease: "power3.out",
    });

    gsap.from(document.querySelectorAll('[data-dither="hero"]'), {
      opacity: 0,
      scale: 1.04,
      duration: 1.6,
      delay: 0.5,
      ease: "power2.out",
    });

    document.querySelectorAll('[data-anim="head"]').forEach((el) => {
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 1.0,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    document.querySelectorAll(".approach-card").forEach((card, i, all) => {
      const parent = card.parentElement;
      if (i === 0) {
        gsap.from(Array.from(all).filter((c) => c.parentElement === parent), {
          y: 28,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: parent, start: "top 85%" },
        });
      }
    });

    document.querySelectorAll(".work-grid").forEach((grid) => {
      gsap.from(grid.querySelectorAll(".work-card"), {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: grid, start: "top 85%" },
      });
    });

    const expList = document.querySelector(".exp-list");
    if (expList) {
      gsap.from(expList.querySelectorAll(".exp-row"), {
        y: 20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: expList, start: "top 85%" },
      });
    }

    document.querySelectorAll('[data-dither="card"], [data-dither="sm"], [data-dither="foot"]').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 92%" } },
      );
    });
  }

  function boot() {
    initInvertToggle();
    initScrollProgress();
    initKpis();
    if (window.gsap) {
      initReveals();
    } else {
      // GSAP loads from cdnjs before this file (see index.html) but guard
      // against slow/blocked network by falling back to visible content.
      document.querySelectorAll("[data-anim]").forEach((el) => (el.style.opacity = 1));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
