const SLIDESAVER_HOME = "https://slidesharedownloadr.com/";
const SLIDESAVER_SCRIBD = "https://slidesharedownloadr.com/scribd-downloader/";

const input = document.getElementById("url");
const hint = document.getElementById("hint");
const btnGo = document.getElementById("btn-go");
const btnSs = document.getElementById("btn-ss");
const btnSc = document.getElementById("btn-sc");

function isSlideShareUrl(url) {
  try {
    return /(^|\.)slideshare\.net$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

function isScribdUrl(url) {
  try {
    return /(^|\.)scribd\.com$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

function showHint(text) {
  if (!text) {
    hint.hidden = true;
    hint.textContent = "";
    return;
  }
  hint.hidden = false;
  hint.textContent = text;
}

async function copyUrl(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    try {
      input.focus();
      input.select();
      return document.execCommand("copy");
    } catch {
      return false;
    }
  }
}

async function openDownloader(sourceUrl) {
  const url = (sourceUrl || "").trim();
  let dest = SLIDESAVER_HOME;
  if (url && isScribdUrl(url)) dest = SLIDESAVER_SCRIBD;
  else if (url && isSlideShareUrl(url)) dest = SLIDESAVER_HOME;
  else if (url) {
    showHint("Use a slideshare.net or scribd.com link.");
    return;
  }

  let copied = false;
  if (url) copied = await copyUrl(url);

  await chrome.tabs.create({ url: dest, active: true });

  if (url && copied) {
    showHint("Link copied. On the site, click the paste button, then Download.");
  } else if (url) {
    showHint("Opened SlideShare Downloader — paste the link yourself if needed.");
  }
  window.close();
}

function syncGo() {
  btnGo.disabled = !(input.value || "").trim();
}

input.addEventListener("input", syncGo);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    openDownloader(input.value);
  }
});

btnGo.addEventListener("click", () => openDownloader(input.value));
btnSs.addEventListener("click", () => {
  chrome.tabs.create({ url: SLIDESAVER_HOME, active: true });
  window.close();
});
btnSc.addEventListener("click", () => {
  chrome.tabs.create({ url: SLIDESAVER_SCRIBD, active: true });
  window.close();
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs && tabs[0];
  const u = tab && tab.url ? tab.url : "";
  if (u && (isSlideShareUrl(u) || isScribdUrl(u))) {
    input.value = u;
    showHint(
      isScribdUrl(u)
        ? "Detected Scribd page — ready to open the Scribd tool."
        : "Detected SlideShare page — ready to open SlideShare Downloader."
    );
  }
  syncGo();
  input.focus();
  if (input.value) input.select();
});
