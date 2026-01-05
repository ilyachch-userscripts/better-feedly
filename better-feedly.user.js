// ==UserScript==
// @name         better-feedly
// @namespace    https://github.com/ilyachch-userscripts/
// @version      1.0
// @description  Custom Script - better-feedly
// @author       ilyachch
// @homepageURL  https://github.com/ilyachch-userscripts/better-feedly
// @source       https://github.com/ilyachch-userscripts/better-feedly/better-feedly.user.js
// @supportURL   https://github.com/ilyachch-userscripts/better-feedly/issues
// @updateURL    https://raw.githubusercontent.com/ilyachch-userscripts/better-feedly/main/better-feedly.user.js
// @downloadURL  https://raw.githubusercontent.com/ilyachch-userscripts/better-feedly/main/better-feedly.user.js
// @license      MIT
// @run-at       document-idle
// @match        https://feedly.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=feedly.com
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  "use strict";

  let isAutoScrollEnabled = GM_getValue("autoScroll", true);

  function updateMenu() {}

  GM_registerMenuCommand(
    `Toggle Auto-Scroll (Current: ${isAutoScrollEnabled ? "ON" : "OFF"})`,
    () => {
      isAutoScrollEnabled = !isAutoScrollEnabled;
      GM_setValue("autoScroll", isAutoScrollEnabled);
      alert(
        `Auto-Scroll is now ${
          isAutoScrollEnabled ? "ON" : "OFF"
        }.\nReload page to update menu label.`
      );
    }
  );

  const CONFIG = {
    selectorRead: '[aria-label="Mark as Read"]',
    selectorHide: '[aria-label="Mark as Read and Hide"]',
    endText: "End of feed",
    ignoreText: ["You might also like", "Sponsored"],
    btnClass: "tm-feedly-action-btn",
    containerClass: "tm-feedly-actions-container",
  };

  const ICONS = {
    read: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style="pointer-events: none;">
    <path fill-rule="nonzero" d="M16.786 4.65a.5.5 0 0 1 .77.63l-.056.07-9.822 10a.5.5 0 0 1-.644.06l-.07-.06L2.5 10.805a.5.5 0 0 1 .645-.76l.069.06 4.107 4.181z"></path>
    </svg>`,
    hide: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style="pointer-events: none;">
        <g fill-rule="nonzero">
            <path d="M3.932 3.932a.5.5 0 0 1 .638-.058l.07.058 11.428 11.429a.5.5 0 0 1-.638.765l-.07-.058L3.933 4.639a.5.5 0 0 1 0-.707"></path>
            <path d="M15.36 3.932a.5.5 0 0 1 .766.638l-.058.07L4.639 16.067a.5.5 0 0 1-.765-.638l.058-.07z"></path>
        </g>
    </svg>`,
  };

  GM_addStyle(`
h2:has(span.${CONFIG.containerClass}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.${CONFIG.containerClass} {
    display: inline-flex;
    align-items: center;
    margin-left: 1rem;
    opacity: 0.6;
    transition: opacity 0.2s;
}
.${CONFIG.containerClass}:hover {
    opacity: 1;
}
.${CONFIG.btnClass} {
    display: inline-flex;
    align-items: center;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: .8125rem;
    color: inherit;
    padding: 4px 8px;
    margin-left: 4px;
    border-radius: 4px;
    transition: background 0.1s, color 0.1s;
    font-family: inherit;
}
.${CONFIG.btnClass}:hover {
    background-color: rgba(0,0,0,0.05);
    color: #2bb24c;
}
.${CONFIG.btnClass} svg {
    margin-right: 4px;
    opacity: 0.8;
}
    `);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const triggerMouseEvent = (node, type) =>
    node.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true })
    );

  function createActionButton(iconHtml, label, onClick) {
    const btn = document.createElement("button");
    btn.className = CONFIG.btnClass;
    btn.innerHTML = `${iconHtml}<span>${label}</span>`;
    btn.title = label;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(btn);
    };
    return btn;
  }

  async function processDay(btnElement, targetSelector) {
    const containerSpan = btnElement.parentElement;
    const headerH2 = containerSpan.closest("h2") || containerSpan.parentElement;
    const articlesDiv = headerH2.nextElementSibling;

    if (!articlesDiv || articlesDiv.tagName !== "DIV") {
      console.warn("Feedly structure mismatch");
      return;
    }

    const labelSpan = btnElement.querySelector("span");
    const originalText = labelSpan ? labelSpan.innerText : "";
    if (labelSpan) labelSpan.innerText = "Loading...";
    btnElement.style.cursor = "wait";

    let scrolled = false;

    if (isAutoScrollEnabled) {
      let nextSibling = articlesDiv.nextElementSibling;
      let retries = 0;
      const maxRetries = 60;

      while (retries < maxRetries) {
        if (nextSibling && nextSibling.tagName === "H2") break;

        const endMarker = Array.from(document.querySelectorAll("h2")).find(
          (h) => h.innerText.includes(CONFIG.endText)
        );
        if (
          endMarker &&
          endMarker.compareDocumentPosition(articlesDiv) &
            Node.DOCUMENT_POSITION_PRECEDING
        )
          break;

        window.scrollTo(0, document.body.scrollHeight);
        scrolled = true;
        await wait(400);
        nextSibling = articlesDiv.nextElementSibling;
        retries++;
      }
    }

    if (scrolled) {
      headerH2.scrollIntoView({ behavior: "auto", block: "center" });
      await wait(300);
    }

    if (labelSpan) labelSpan.innerText = "Processing...";

    const articles = Array.from(articlesDiv.children).filter(
      (el) =>
        el.id || el.tagName === "ARTICLE" || el.classList.contains("entry")
    );
    let count = 0;

    for (const article of articles) {
      triggerMouseEvent(article, "mouseover");
      await wait(20);

      const actionBtn = article.querySelector(targetSelector);
      if (actionBtn) {
        actionBtn.click();
        count++;
      }
      triggerMouseEvent(article, "mouseout");
    }

    if (labelSpan) labelSpan.innerText = `Done (${count})`;

    setTimeout(() => {
      if (labelSpan) labelSpan.innerText = originalText;
      btnElement.style.cursor = "pointer";
    }, 3000);
  }

  function scanAndInject() {
    document.querySelectorAll("h2").forEach((h2) => {
      if (h2.querySelector("." + CONFIG.containerClass)) return;

      const text = h2.innerText;
      if (text.includes(CONFIG.endText)) return;
      if (CONFIG.ignoreText.some((ignore) => text.includes(ignore))) return;
      if (h2.closest(".Sidebar, .fx-sidebar")) return;
      if (!h2.nextElementSibling || h2.nextElementSibling.tagName !== "DIV")
        return;

      const container = document.createElement("span");
      container.className = CONFIG.containerClass;

      const btnRead = createActionButton(ICONS.read, "Mark as Read", (btn) =>
        processDay(btn, CONFIG.selectorRead)
      );
      const btnHide = createActionButton(ICONS.hide, "Read & Hide", (btn) =>
        processDay(btn, CONFIG.selectorHide)
      );

      container.appendChild(btnRead);
      container.appendChild(btnHide);
      h2.appendChild(container);
    });
  }

  function init() {
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length)) scanAndInject();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    scanAndInject();
  }

  setTimeout(init, 1000);
})();
