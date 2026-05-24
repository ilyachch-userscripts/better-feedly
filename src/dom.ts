import { UI_CLASSES } from './config';

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function triggerMouseEvent(node: Element, type: 'mouseover' | 'mouseout'): void {
  node.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
    }),
  );
}

export function createActionButton(
  iconHtml: string,
  label: string,
  onClick: (button: HTMLButtonElement) => void,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = UI_CLASSES.actionButton;
  button.innerHTML = `${iconHtml}<span>${label}</span>`;
  button.title = label;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick(button);
  });
  return button;
}

export function isVisible(node: Element | null): node is Element {
  if (!node || !node.isConnected) return false;

  const style = window.getComputedStyle(node);
  if (style.display === 'none' || style.visibility === 'hidden') return false;

  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function getPageScrollTop(): number {
  return Math.max(
    window.scrollY || 0,
    window.pageYOffset || 0,
    document.documentElement.scrollTop || 0,
    document.body.scrollTop || 0,
  );
}

export function getScrollingElement(): HTMLElement {
  if (document.scrollingElement instanceof HTMLElement) {
    return document.scrollingElement;
  }

  return document.documentElement;
}

export function isScrollableElement(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el === document.body || el === document.documentElement) return false;

  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY || '';
  const canScrollY =
    overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';

  return canScrollY && el.scrollHeight > el.clientHeight + 1;
}

export function findScrollableAncestor(start: Element | null): HTMLElement | null {
  let node = start;

  while (node && node !== document.body && node !== document.documentElement) {
    if (isScrollableElement(node)) return node;
    node = node.parentElement;
  }

  return null;
}

export function dispatchWheel(target: EventTarget | null, step: number): void {
  if (!target) return;

  try {
    target.dispatchEvent(
      new WheelEvent('wheel', {
        deltaY: step,
        bubbles: true,
        cancelable: true,
      }),
    );
  } catch {
    // Ignore environments where WheelEvent cannot be constructed.
  }
}

export function attemptScrollDown(step: number, scroller: HTMLElement): boolean {
  const beforeTop = getPageScrollTop();
  const beforeScrollerTop = scroller.scrollTop;

  window.scrollBy(0, step);
  if (getPageScrollTop() > beforeTop) return true;

  document.documentElement.scrollTop += step;
  if (getPageScrollTop() > beforeTop) return true;

  document.body.scrollTop += step;
  if (getPageScrollTop() > beforeTop) return true;

  scroller.scrollTop += step;
  if (scroller.scrollTop > beforeScrollerTop) return true;

  const centerEl = document.elementFromPoint(
    Math.floor((window.innerWidth || 0) / 2),
    Math.floor((window.innerHeight || 0) / 2),
  );
  const scrollParent = findScrollableAncestor(centerEl);
  if (scrollParent) {
    const beforeParentTop = scrollParent.scrollTop;
    scrollParent.scrollTop += step;
    if (scrollParent.scrollTop > beforeParentTop) return true;

    dispatchWheel(scrollParent, step);
    if (scrollParent.scrollTop > beforeParentTop) return true;
  }

  dispatchWheel(centerEl, step);
  dispatchWheel(document, step);
  dispatchWheel(window, step);

  const feedItems = document.querySelectorAll(
    'article, .entry, [data-test-id*="entry"], [data-test*="entry"]',
  );
  if (feedItems.length > 0) {
    const lastItem = feedItems.item(feedItems.length - 1);
    const beforeIntoViewTop = getPageScrollTop();
    lastItem.scrollIntoView({ behavior: 'auto', block: 'end' });
    if (getPageScrollTop() > beforeIntoViewTop) return true;
  }

  return getPageScrollTop() > beforeTop;
}
