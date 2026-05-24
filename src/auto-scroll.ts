import { ACTION_SELECTORS, AUTO_SCROLL, UI_CLASSES } from './config';
import {
  attemptScrollDown,
  getScrollingElement,
  isVisible,
  wait,
} from './dom';

const autoScrollState = {
  running: false,
  stopRequested: false,
};

function setAutoScrollButtonState(
  button: HTMLButtonElement,
  state: keyof typeof AUTO_SCROLL.states,
  labelOverride?: string,
): void {
  button.dataset.state = AUTO_SCROLL.states[state];
  button.textContent = labelOverride || AUTO_SCROLL.labels[state] || '';
}

function finishAutoScroll(
  button: HTMLButtonElement,
  state: keyof typeof AUTO_SCROLL.states,
  labelOverride?: string,
): void {
  autoScrollState.running = false;
  autoScrollState.stopRequested = false;
  setAutoScrollButtonState(button, state, labelOverride);
}

function findMarkAllButton(): HTMLElement | null {
  for (const selector of ACTION_SELECTORS.markAllSelectors) {
    const found = document.querySelector(selector);
    if (found instanceof HTMLElement) return found;
  }

  const candidates = Array.from(document.querySelectorAll('button, [role="button"], a'));
  return (
    candidates.find((element) => {
      const text = element.textContent?.trim() || '';
      const ariaLabel = element.getAttribute('aria-label')?.trim() || '';
      return text === ACTION_SELECTORS.markAllText || ariaLabel === ACTION_SELECTORS.markAllText;
    }) as HTMLElement | undefined) || null;
}

async function runMarkAllSearch(button: HTMLButtonElement): Promise<void> {
  autoScrollState.running = true;
  autoScrollState.stopRequested = false;
  setAutoScrollButtonState(button, 'running');

  const scroller = getScrollingElement();
  let previousHeight = -1;
  let previousTop = -1;
  let stillTicks = 0;

  for (let tick = 1; tick <= AUTO_SCROLL.maxTicks; tick++) {
    if (autoScrollState.stopRequested) {
      finishAutoScroll(button, 'idle');
      return;
    }

    const markAllBtn = findMarkAllButton();
    if (isVisible(markAllBtn)) {
      markAllBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      finishAutoScroll(button, 'found');
      return;
    }

    const currentHeight = scroller.scrollHeight;
    const currentTop = scroller.scrollTop;
    if (currentHeight === previousHeight && currentTop === previousTop) {
      stillTicks += 1;
    } else {
      stillTicks = 0;
    }
    previousHeight = currentHeight;
    previousTop = currentTop;

    setAutoScrollButtonState(
      button,
      'running',
      `Searching... step ${tick}/${AUTO_SCROLL.maxTicks}`,
    );

    const step = Math.max(
      AUTO_SCROLL.minStepPx,
      Math.floor((window.innerHeight || 900) * AUTO_SCROLL.viewportStepRatio),
    );
    const moved = attemptScrollDown(step, scroller);
    await wait(AUTO_SCROLL.waitMs);

    if (!moved && stillTicks >= AUTO_SCROLL.stallTicks) break;
  }

  finishAutoScroll(button, 'error');
}

export function createAutoScrollButton(): void {
  if (document.querySelector(`.${UI_CLASSES.autoScrollButton}`)) return;
  if (!document.body) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = UI_CLASSES.autoScrollButton;
  setAutoScrollButtonState(button, 'idle');
  button.addEventListener('click', () => {
    if (autoScrollState.running) {
      autoScrollState.stopRequested = true;
      setAutoScrollButtonState(button, 'stopping');
      return;
    }

    void runMarkAllSearch(button);
  });

  document.body.appendChild(button);
}
