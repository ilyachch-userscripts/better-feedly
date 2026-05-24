import { STORAGE_KEYS } from './config';

let autoScrollEnabled = GM_getValue<boolean>(STORAGE_KEYS.autoScroll, true);

export function isAutoScrollEnabled(): boolean {
  return autoScrollEnabled;
}

export function setAutoScrollEnabled(nextValue: boolean): void {
  autoScrollEnabled = nextValue;
  GM_setValue(STORAGE_KEYS.autoScroll, nextValue);
}

export function toggleAutoScrollEnabled(): boolean {
  setAutoScrollEnabled(!autoScrollEnabled);
  return autoScrollEnabled;
}
