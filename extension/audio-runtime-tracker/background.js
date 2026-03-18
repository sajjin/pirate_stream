const tabState = {};

function stateKey(key) {
  return `ps_runtime_${key}`;
}

function persistRuntime(key, seconds) {
  if (!key) {
    return;
  }
  chrome.storage.local.set({ [stateKey(key)]: seconds });
}

function loadRuntime(key, fallbackSeconds, callback) {
  if (!key) {
    callback(fallbackSeconds);
    return;
  }

  chrome.storage.local.get([stateKey(key)], (result) => {
    const stored = Number(result[stateKey(key)] || 0);
    const normalized = Math.max(stored, Number(fallbackSeconds || 0));
    callback(normalized);
  });
}

function buildUpdate(current) {
  return {
    ok: true,
    type: 'PS_AUDIO_RUNTIME_UPDATE',
    key: current.key,
    seconds: current.seconds,
    audible: current.audible,
    active: current.active
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PS_TRACK_GET_FOR_TAB') {
    const requestedTabId = Number(message.tabId);
    if (!Number.isFinite(requestedTabId)) {
      sendResponse({ ok: false, reason: 'invalid_tab_id' });
      return;
    }

    const current = tabState[requestedTabId] || {
      active: false,
      key: '',
      seconds: 0,
      audible: false
    };

    sendResponse({
      ok: true,
      type: 'PS_AUDIO_RUNTIME_UPDATE',
      key: current.key,
      seconds: current.seconds,
      audible: current.audible,
      active: current.active
    });
    return;
  }

  const tabId = sender.tab && typeof sender.tab.id === 'number' ? sender.tab.id : null;

  if (!tabId) {
    sendResponse({ ok: false, reason: 'missing_tab_id' });
    return;
  }

  if (message.type === 'PS_TRACK_START') {
    const key = typeof message.key === 'string' ? message.key : '';
    const initialSeconds = Number(message.initialSeconds || 0);

    loadRuntime(key, initialSeconds, (seconds) => {
      tabState[tabId] = {
        active: true,
        key,
        seconds,
        audible: false,
        lastTickAt: Date.now()
      };

      sendResponse(buildUpdate(tabState[tabId]));
    });

    return true;
  }

  if (message.type === 'PS_AUDIO_POLL') {
    const current = tabState[tabId];
    if (!current || !current.active) {
      sendResponse({
        ok: true,
        type: 'PS_AUDIO_RUNTIME_UPDATE',
        key: '',
        seconds: 0,
        audible: false,
        active: false
      });
      return;
    }

    const keyFromPage = typeof message.key === 'string' ? message.key : '';
    if (keyFromPage && keyFromPage !== current.key) {
      sendResponse(buildUpdate(current));
      return;
    }

    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tabState[tabId]) {
        sendResponse(buildUpdate(current));
        return;
      }

      const live = tabState[tabId];
      const now = Date.now();
      const elapsedSeconds = Math.max(1, Math.floor((now - (live.lastTickAt || now)) / 1000));
      const audible = Boolean(tab && tab.audible);

      live.lastTickAt = now;
      live.audible = audible;

      if (audible) {
        live.seconds += elapsedSeconds;
        if (live.seconds % 5 === 0) {
          persistRuntime(live.key, live.seconds);
        }
      }

      sendResponse(buildUpdate(live));
    });

    return true;
  }

  if (message.type === 'PS_TRACK_STOP') {
    const current = tabState[tabId];
    if (current) {
      persistRuntime(current.key, current.seconds);
    }

    delete tabState[tabId];
    sendResponse({ ok: true, active: false });
    return;
  }

  if (message.type === 'PS_TRACK_GET') {
    const current = tabState[tabId] || {
      active: false,
      key: '',
      seconds: 0,
      audible: false
    };

    sendResponse({
      ok: true,
      type: 'PS_AUDIO_RUNTIME_UPDATE',
      key: current.key,
      seconds: current.seconds,
      audible: current.audible,
      active: current.active
    });
    return;
  }

  sendResponse({ ok: false, reason: 'unknown_message_type' });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  const current = tabState[tabId];
  if (current) {
    persistRuntime(current.key, current.seconds);
  }

  delete tabState[tabId];
});

chrome.runtime.onSuspend.addListener(() => {
  Object.values(tabState).forEach((current) => {
    if (current) {
      persistRuntime(current.key, current.seconds);
    }
  });
});