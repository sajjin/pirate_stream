# Pirate Stream Audio Runtime Tracker Extension

This Chrome extension tracks audible runtime for the active tab and relays updates to the Pirate Stream app.

## Install (Developer Mode)

1. Open Chrome and go to chrome://extensions.
2. Turn on Developer mode.
3. Click Load unpacked.
4. Select this folder:
   - extension/audio-runtime-tracker

## How it works

1. The app posts tracking start/stop messages in the page.
2. The content script forwards those to the extension background worker.
3. The content script polls background every second while tracking is active.
4. The background worker reads live tab audible state on each poll.
4. Runtime updates are sent back to the page and used by the app timer.

## Notes

- Audible tracking follows actual tab audio output, so paused or silent playback does not accrue time.
- Runtime is persisted in extension local storage per video key.
- Keep the extension enabled while watching.

## Allowed websites

This extension is currently locked to:

- http://localhost:3000/*

To add your production website, update both arrays in manifest.json:

- host_permissions
- content_scripts[0].matches
