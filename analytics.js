(() => {
  if (!window.gtag) return;

  document.querySelector(".resume-download")?.addEventListener("click", () => {
    window.gtag("event", "resume_download");
  });

  // Which sections visitors actually scroll to (About/Career/Work/How I
  // Work/Impact/Contact) — fires once per section per page load, at 40%
  // visible, so a quick scroll-past still counts but "flashed by at the
  // very edge" doesn't.
  const sections = document.querySelectorAll(
    "#about, #experience, #work, #approach, #impact, #contact",
  );
  if (sections.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          window.gtag("event", "section_view", { section_name: entry.target.id });
          io.unobserve(entry.target);
        });
      },
      // A low threshold on purpose: "Work" is much taller than any
      // viewport, so a ratio like 0.4 (40% of the *section's own* height
      // visible at once) is literally unreachable for it and it would
      // never fire. 0.1 still fires reliably for every section regardless
      // of height.
      { threshold: 0.1 },
    );
    sections.forEach((el) => io.observe(el));
  }
})();
