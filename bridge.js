(async function () {
  const params = new URLSearchParams(location.search);
  const sourceUrl = params.get("url") || "";
  const dest =
    params.get("dest") ||
    ( /scribd\.com/i.test(sourceUrl)
      ? "https://slidesharedownloadr.com/scribd-downloader/"
      : "https://slidesharedownloadr.com/" );

  const msg = document.getElementById("msg");
  let copied = false;

  if (sourceUrl) {
    try {
      await navigator.clipboard.writeText(sourceUrl);
      copied = true;
    } catch (_) {
      try {
        const ta = document.createElement("textarea");
        ta.value = sourceUrl;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand("copy");
        ta.remove();
      } catch (_) {
        copied = false;
      }
    }
  }

  if (msg) {
    msg.textContent = copied
      ? "Link copied. On SlideShare Downloader, click the paste button, then Download."
      : "Could not copy automatically — paste the link yourself on SlideShare Downloader.";
  }

  // Open destination, then close this helper tab.
  try {
    await chrome.tabs.create({ url: dest, active: true });
  } catch (_) {
    location.href = dest;
    return;
  }
  setTimeout(() => {
    chrome.tabs.getCurrent((tab) => {
      if (tab && tab.id) chrome.tabs.remove(tab.id);
    });
  }, 250);
})();
