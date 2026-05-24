export const UI_CLASSES = {
  actionButton: 'tm-feedly-action-btn',
  actionContainer: 'tm-feedly-actions-container',
  autoScrollButton: 'tm-feedly-autoscroll-btn',
} as const;

export const ACTION_SELECTORS = {
  read: '[aria-label="Mark as Read"]',
  hide: '[aria-label="Mark as Read and Hide"]',
  markAllText: 'Mark All as Read',
  markAllSelectors: [
    '[aria-label="Mark All as Read"]',
    'button[title="Mark All as Read"]',
  ],
} as const;

export const FEED_TEXT = {
  endText: 'End of feed',
  ignoreText: ['You might also like', 'Sponsored'],
} as const;

export const AUTO_SCROLL_STATES = {
  idle: 'idle',
  running: 'running',
  stopping: 'stopping',
  found: 'found',
  error: 'error',
} as const;

export type AutoScrollState =
  (typeof AUTO_SCROLL_STATES)[keyof typeof AUTO_SCROLL_STATES];

export const AUTO_SCROLL = {
  maxTicks: 240,
  waitMs: 650,
  stallTicks: 16,
  minStepPx: 400,
  viewportStepRatio: 0.9,
  states: AUTO_SCROLL_STATES,
  labels: {
    idle: 'Start Search: Mark All as Read',
    running: 'Searching Mark All as Read...',
    stopping: 'Stopping...',
    found: 'Found: Mark All as Read',
    error: 'Mark All as Read not found',
  } as const satisfies Record<AutoScrollState, string>,
} as const;

export const STORAGE_KEYS = {
  autoScroll: 'autoScroll',
} as const;

export const ICONS = {
  read: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style="pointer-events: none;">
    <path fill-rule="nonzero" d="M16.786 4.65a.5.5 0 0 1 .77.63l-.056.07-9.822 10a.5.5 0 0 1-.644.06l-.07-.06L2.5 10.805a.5.5 0 0 1 .645-.76l.069.06 4.107 4.181z"></path>
    </svg>`,
  hide: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style="pointer-events: none;">
        <g fill-rule="nonzero">
            <path d="M3.932 3.932a.5.5 0 0 1 .638-.058l.07.058 11.428 11.429a.5.5 0 0 1-.638.765l-.07-.058L3.933 4.639a.5.5 0 0 1 0-.707"></path>
            <path d="M15.36 3.932a.5.5 0 0 1 .766.638l-.058.07L4.639 16.067a.5.5 0 0 1-.765-.638l.058-.07z"></path>
        </g>
    </svg>`,
} as const;
