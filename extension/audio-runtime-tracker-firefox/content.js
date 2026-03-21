function getRuntimeSafe() {
  try {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
      return null;
    }
    return chrome.runtime;
  } catch {
    return null;
  }
}

function sendToBackground(payload) {
  const runtime = getRuntimeSafe();
  if (!runtime) {
    stopPolling();
    return;
  }

  try {
    runtime.sendMessage(payload, (response) => {
      try {
        if (chrome.runtime.lastError) {
          stopPolling();
          return;
        }
      } catch {
        stopPolling();
        return;
      }

      if (!response) {
        return;
      }

      if (response.type === 'PS_AUDIO_RUNTIME_UPDATE') {
        window.postMessage(
          {
            type: 'PS_EXTENSION_AUDIO_RUNTIME_UPDATE',
            key: response.key,
            seconds: response.seconds,
            tempSeconds: response.tempSeconds,
            usesTempTimer: response.usesTempTimer,
            audible: response.audible,
            active: response.active
          },
          '*'
        );
      }
    });
  } catch {
    // Extension was likely reloaded; suppress noisy errors in existing page contexts.
    stopPolling();
  }
}

let activeTrackingKey = '';
let pollIntervalId = null;

function stopPolling() {
  if (pollIntervalId !== null) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
}

function pollAudioRuntime() {
  if (!activeTrackingKey) {
    return;
  }

  sendToBackground({
    type: 'PS_AUDIO_POLL',
    key: activeTrackingKey
  });
}

function startPolling(key) {
  activeTrackingKey = key;
  stopPolling();
  pollAudioRuntime();
  pollIntervalId = setInterval(pollAudioRuntime, 1000);
}

function postSeekResult(key, success, seconds) {
  if (window.top === window) {
    return;
  }

  window.top.postMessage(
    {
      type: 'PS_IFRAME_SEEK_RESULT',
      key,
      success,
      seconds
    },
    '*'
  );
}

function attemptDirectSeek(seconds) {
  const normalizedSeconds = Math.max(0, Number(seconds || 0));
  const videos = Array.from(document.querySelectorAll('video'));
  let sought = false;

  videos.forEach((video) => {
    try {
      video.currentTime = normalizedSeconds;
      sought = true;
    } catch {
      // Ignore provider-specific seek failures.
    }
  });

  if (sought) {
    return true;
  }

  try {
    if (typeof window.jwplayer === 'function') {
      const player = window.jwplayer();
      if (player && typeof player.seek === 'function') {
        player.seek(normalizedSeconds);
        return true;
      }
    }
  } catch {
    // Ignore missing/unsupported API.
  }

  return false;
}

window.addEventListener('message', (event) => {
  if (event.source !== window) {
    return;
  }

  const data = event.data;
  if (!data || typeof data !== 'object') {
    return;
  }

  if (data.type === 'PS_TRACK_START') {
    const key = typeof data.key === 'string' ? data.key : '';
    startPolling(key);

    sendToBackground({
      type: 'PS_TRACK_START',
      key,
      initialSeconds: data.initialSeconds
    });
    return;
  }

  if (data.type === 'PS_TRACK_STOP') {
    stopPolling();
    activeTrackingKey = '';
    sendToBackground({ type: 'PS_TRACK_STOP', key: data.key });
    return;
  }

  if (data.type === 'PS_TRACK_GET') {
    sendToBackground({ type: 'PS_TRACK_GET' });
    return;
  }

  if (data.type === 'PS_IFRAME_SEEK_REQUEST') {
    const key = typeof data.key === 'string' ? data.key : '';
    const seconds = Number(data.seconds || 0);
    const didSeek = attemptDirectSeek(seconds);
    postSeekResult(key, didSeek, seconds);
  }
});

const runtime = getRuntimeSafe();
if (runtime) {
  try {
    runtime.onMessage.addListener((message) => {
      if (message && message.type === 'PS_TRACK_GET') {
        if (activeTrackingKey) {
          pollAudioRuntime();
        } else {
          sendToBackground({ type: 'PS_TRACK_GET' });
        }
        return;
      }

      if (!message || message.type !== 'PS_AUDIO_RUNTIME_UPDATE') {
        return;
      }

      window.postMessage(
        {
          type: 'PS_EXTENSION_AUDIO_RUNTIME_UPDATE',
          key: message.key,
          seconds: message.seconds,
          tempSeconds: message.tempSeconds,
          usesTempTimer: message.usesTempTimer,
          audible: message.audible,
          active: message.active
        },
        '*'
      );
    });
  } catch {
    stopPolling();
  }
}

window.addEventListener('pagehide', stopPolling);
window.addEventListener('beforeunload', stopPolling);

sendToBackground({ type: 'PS_TRACK_GET' });