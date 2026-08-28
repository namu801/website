(() => {
  const selector =
    ".section-split, .work-category .category-title, .project-card, .resume-list article, .contact, .overview-list, .case-section";
  const targets = document.querySelectorAll(selector);
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  targets.forEach((el) => io.observe(el));
})();
