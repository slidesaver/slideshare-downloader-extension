/* SlideShare Downloader – MV3 service worker / background script (Chrome, Edge, Firefox) */

const SLIDESAVER_HOME = "https://slidesharedownloadr.com/";
const SLIDESAVER_SCRIBD = "https://slidesharedownloadr.com/scribd-downloader/";
const MENU_LINK = "slidesaver-download-link";
const MENU_PAGE = "slidesaver-download-page";

function isSlideShareUrl(url) {
  try {
    const u = new URL(url);
    return /(^|\.)slideshare\.net$/i.test(u.hostname);
  } catch {
    return false;
  }
}

function isScribdUrl(url) {
  try {
    const u = new URL(url);
    return /(^|\.)scribd\.com$/i.test(u.hostname);
  } catch {
    return false;
  }
}

function targetPageFor(url) {
  if (url && isScribdUrl(url)) return SLIDESAVER_SCRIBD;
  return SLIDESAVER_HOME;
}

function openViaBridge(sourceUrl) {
  const dest = targetPageFor(sourceUrl || "");
  const bridge =
    chrome.runtime.getURL("bridge.html") +
    "?url=" +
    encodeURIComponent(sourceUrl || "") +
    "&dest=" +
    encodeURIComponent(dest);
  return chrome.tabs.create({ url: bridge, active: true });
}

function openSiteOnly(kind) {
  const url = kind === "scribd" ? SLIDESAVER_SCRIBD : SLIDESAVER_HOME;
  return chrome.tabs.create({ url, active: true });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_LINK,
      title: "Download with SlideShare Downloader",
      contexts: ["link"],
      targetUrlPatterns: [
        "*://*.slideshare.net/*",
        "*://slideshare.net/*",
        "*://*.scribd.com/*",
        "*://scribd.com/*"
      ]
    });
    chrome.contextMenus.create({
      id: MENU_PAGE,
      title: "Download with SlideShare Downloader",
      contexts: ["page"],
      documentUrlPatterns: [
        "*://*.slideshare.net/*",
        "*://slideshare.net/*",
        "*://*.scribd.com/*",
        "*://scribd.com/*"
      ]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === MENU_LINK) {
    const url = info.linkUrl || "";
    if (url && (isSlideShareUrl(url) || isScribdUrl(url))) openViaBridge(url);
    return;
  }
  if (info.menuItemId === MENU_PAGE) {
    const url = info.pageUrl || "";
    if (url && (isSlideShareUrl(url) || isScribdUrl(url))) openViaBridge(url);
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || !msg.type) return;
  if (msg.type === "open-with-clipboard") {
    Promise.resolve(openViaBridge(msg.url || ""))
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
  if (msg.type === "open-site") {
    Promise.resolve(openSiteOnly(msg.kind || "slideshare"))
      .then(() => sendResponse({ ok: true }))
      .catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
});
