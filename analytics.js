(() => {
  if (!window.gtag) return;

  document.querySelector(".resume-download")?.addEventListener("click", () => {
    window.gtag("event", "resume_download");
  });
})();
