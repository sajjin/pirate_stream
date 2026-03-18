function sendToBackground(payload) {
  chrome.runtime.sendMessage(payload, (response) => {
    if (!response) {
      return;
    }

    if (response.type === 'PS_AUDIO_RUNTIME_UPDATE') {
      window.postMessage(
        {
          type: 'PS_EXTENSION_AUDIO_RUNTIME_UPDATE',
          key: response.key,
          seconds: response.seconds,
          audible: response.audible,
          active: response.active
        },
        '*'
      );
    }
  });
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
  }
});

chrome.runtime.onMessage.addListener((message) => {
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
      audible: message.audible,
      active: message.active
    },
    '*'
  );
});

sendToBackground({ type: 'PS_TRACK_GET' });