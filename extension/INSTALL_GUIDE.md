# Pirate Stream Audio Runtime Tracker Extensions

This folder contains both Chrome and Firefox versions of the audio runtime tracking extension.

## Directory Structure

```
extension/
├── audio-runtime-tracker/           # Chrome version (Manifest V3)
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   └── README.md
│
└── audio-runtime-tracker-firefox/   # Firefox version (Manifest V3)
    ├── manifest.json
    ├── background.js
    ├── content.js
    ├── popup.html
    ├── popup.js
    └── README.md
```

## Quick Start

### Chrome / Chromium

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select `extension/audio-runtime-tracker`

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select any file from `extension/audio-runtime-tracker-firefox`

## Key Differences

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Manifest | `service_worker` in background | `scripts` array in background |
| Browser ID | Chrome extension ID (auto) | `browser_specific_settings.gecko.id` |
| Min Version | Unspecified | Firefox 109+ |
| Status | Production ready | Production ready (requires Firefox 109+) |
| API Compatibility | All used APIs supported | All used APIs supported |

## Shared Code

Both versions share 100% of the JS logic:
- `background.js` - Handles tab audio polling and storage
- `content.js` - Bridges page messages to background
- `popup.html/popup.js` - Displays tracking status

The only difference is the manifest format, which Firefox MV3 handles slightly differently.

## Allowed Sites

Both extensions currently work on:
- `http://localhost:3000/*` (development)
- `https://pirata-amnis.com/*` (production)

## Troubleshooting

### Chrome: Extension not loading?
- Verify you selected the correct folder
- Check Developer mode is enabled
- Reload the extension if you made changes

### Firefox: Extension not activating?
- Firefox MV3 support requires Firefox 109+
- For older Firefox, use Manifest V2 version (not included)
- Check `about:debugging` for any error messages
- Try loading as temporary add-on instead of permanent install

## Publishing

### Chrome Web Store
1. Create Developer account ($5 one-time fee)
2. Upload zip of `audio-runtime-tracker/` folder
3. Wait for review

### Firefox Add-ons Store
1. Create Developer account on addons.mozilla.org
2. Upload zip of `audio-runtime-tracker-firefox/` folder
3. Wait for review (typically 2-7 days)
