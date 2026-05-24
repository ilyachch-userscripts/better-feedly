import { ACTION_SELECTORS, FEED_TEXT, ICONS, UI_CLASSES } from './config';
import { createActionButton, triggerMouseEvent, wait } from './dom';
import { isAutoScrollEnabled } from './storage';

function isAfterEndMarker(node: Element): boolean {
  const endMarker = Array.from(document.querySelectorAll('h2')).find((h2) =>
    h2.innerText.includes(FEED_TEXT.endText),
  );
  if (!endMarker) return false;

  return Boolean(
    endMarker.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING,
  );
}

async function processDay(
  btnElement: HTMLButtonElement,
  targetSelector: string,
): Promise<void> {
  const containerSpan = btnElement.parentElement;
  if (!containerSpan) return;

  const headerH2 = containerSpan.closest('h2') || containerSpan.parentElement;
  if (!headerH2) return;

  const articlesDiv = headerH2.nextElementSibling;
  if (!articlesDiv || articlesDiv.tagName !== 'DIV') {
    console.warn('Feedly structure mismatch');
    return;
  }

  const labelSpan = btnElement.querySelector('span');
  const originalText = labelSpan?.innerText || '';
  if (labelSpan) labelSpan.innerText = 'Loading...';
  btnElement.style.cursor = 'wait';

  let scrolled = false;

  if (isAutoScrollEnabled()) {
    let nextSibling = articlesDiv.nextElementSibling;
    let retries = 0;
    const maxRetries = 60;

    while (retries < maxRetries) {
      if (nextSibling && nextSibling.tagName === 'H2') break;
      if (isAfterEndMarker(articlesDiv)) break;

      window.scrollTo(0, document.body.scrollHeight);
      scrolled = true;
      await wait(400);
      nextSibling = articlesDiv.nextElementSibling;
      retries += 1;
    }
  }

  if (scrolled) {
    headerH2.scrollIntoView({ behavior: 'auto', block: 'center' });
    await wait(300);
  }

  if (labelSpan) labelSpan.innerText = 'Processing...';

  const articles = Array.from(articlesDiv.children).filter(
    (element) =>
      element.id || element.tagName === 'ARTICLE' || element.classList.contains('entry'),
  );
  let count = 0;

  for (const article of articles) {
    triggerMouseEvent(article, 'mouseover');
    await wait(20);

    const actionBtn = article.querySelector(targetSelector);
    if (actionBtn) {
      actionBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      count += 1;
    }
    triggerMouseEvent(article, 'mouseout');
  }

  if (labelSpan) labelSpan.innerText = `Done (${count})`;

  window.setTimeout(() => {
    if (labelSpan) labelSpan.innerText = originalText;
    btnElement.style.cursor = 'pointer';
  }, 3000);
}

export function scanAndInject(): void {
  document.querySelectorAll('h2').forEach((h2) => {
    if (h2.querySelector(`.${UI_CLASSES.actionContainer}`)) return;

    const text = h2.innerText;
    if (text.includes(FEED_TEXT.endText)) return;
    if (FEED_TEXT.ignoreText.some((ignore) => text.includes(ignore))) return;
    if (h2.closest('.Sidebar, .fx-sidebar')) return;
    if (h2.nextElementSibling?.tagName !== 'DIV') return;

    const container = document.createElement('span');
    container.className = UI_CLASSES.actionContainer;

    const btnRead = createActionButton(ICONS.read, 'Mark as Read', (button) => {
      void processDay(button, ACTION_SELECTORS.read);
    });
    const btnHide = createActionButton(ICONS.hide, 'Read & Hide', (button) => {
      void processDay(button, ACTION_SELECTORS.hide);
    });

    container.appendChild(btnRead);
    container.appendChild(btnHide);
    h2.appendChild(container);
  });
}

export function initDayActionsFeature(): void {
  if (!document.body) return;

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
      scanAndInject();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  scanAndInject();
}
