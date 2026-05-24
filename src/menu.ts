import { isAutoScrollEnabled, toggleAutoScrollEnabled } from './storage';

export function registerAutoScrollMenuCommand(): void {
  GM_registerMenuCommand(
    `Toggle Auto-Scroll (Current: ${isAutoScrollEnabled() ? 'ON' : 'OFF'})`,
    () => {
      const enabled = toggleAutoScrollEnabled();
      alert(
        `Auto-Scroll is now ${enabled ? 'ON' : 'OFF'}.\nReload page to update menu label.`,
      );
    },
  );
}
