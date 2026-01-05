# Better Feedly

Enhances [Feedly](https://feedly.com/) with bulk actions for managing articles by day.

## Features

### Bulk Mark as Read / Hide
- Adds action buttons next to each day header in your feed
- **Mark as Read** — marks all articles for that day as read
- **Read & Hide** — marks all articles as read and hides them from the feed

### Auto-Scroll
- Automatically scrolls to load all articles for the selected day before processing
- Can be toggled on/off via userscript menu command
- Enabled by default

### Visual Feedback
- Shows processing status ("Loading...", "Processing...", "Done (count)")
- Buttons smoothly appear on hover with subtle animations

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Click [here](https://raw.githubusercontent.com/ilyachch-userscripts/better-feedly/main/better-feedly.user.js) to install the script.

## Usage

1. Navigate to [feedly.com](https://feedly.com/) and open your feed
2. Hover over any day header (e.g., "Today", "Yesterday", or specific dates)
3. Click one of the action buttons:
   - ✓ **Mark as Read** — marks all articles for that day as read
   - ✕ **Read & Hide** — marks articles as read and removes them from view

### Configuration

To toggle auto-scroll:

1. Click on your userscript manager icon in the browser toolbar
2. Select "Toggle Auto-Scroll" from the menu
3. Reload the page to apply changes

## License

MIT
