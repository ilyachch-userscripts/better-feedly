import './style.css';

import { createAutoScrollButton } from './auto-scroll';
import { initDayActionsFeature } from './day-actions';
import { registerAutoScrollMenuCommand } from './menu';

function init(): void {
  registerAutoScrollMenuCommand();
  createAutoScrollButton();
  initDayActionsFeature();
}

window.setTimeout(init, 1000);
