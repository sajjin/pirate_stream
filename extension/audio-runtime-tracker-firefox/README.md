# Pirate Stream Audio Runtime Tracker (Firefox)

Firefox-compatible version of the Chrome extension that tracks audible playback runtime for the active tab and relays updates to the Pirate Stream app.

## Install (Firefox)

### Temporary (For Development/Testing)

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select any file from this folder (e.g., `manifest.json`).
4. The extension will load and remain active until Firefox closes.

### Permanent (Publishing to Add-ons Store)

To publish on Mozilla Add-ons:

1. Package the extension: Zip all files (excluding .git, node_modules, etc.)
2. Create a developer account at https://addons.mozilla.org
3. Submit for review with description and screenshots

## Allowed Sites

This extension currently works on:

- http://localhost:3000/*
- https://pirata-amnis.com/*

## How it works

1. The app posts tracking start/stop messages in the page.
2. The content script forwards those to the extension background worker.
3. The content script polls background every second while tracking is active.
4. The background worker reads live tab audible state on each poll.
5. Runtime updates are sent back to the page and used by the app timer.

## Browser Compatibility

- Firefox 109+ (for MV3 support)
- Chromium-based (Chrome, Edge, Brave, etc.) - use the Chrome version

## Notes

- Audible tracking follows actual tab audio output, so paused or silent playback does not accrue time.
- Runtime is persisted in extension local storage per video key.
- Keep the extension enabled while watching.
- Firefox may require security exceptions for localhost if testing locally.
