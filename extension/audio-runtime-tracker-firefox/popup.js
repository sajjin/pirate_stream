function formatRuntime(seconds) {
  const total = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }

  return `${minutes}m ${secs}s`;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab || typeof tab.id !== 'number') {
    setText('status', 'No active tab');
    return;
  }

  chrome.runtime.sendMessage({ type: 'PS_TRACK_GET_FOR_TAB', tabId: tab.id }, (response) => {
    if (chrome.runtime.lastError || !response) {
      setText('status', 'Waiting for page');
      return;
    }

    setText('status', response.active ? 'Tracking' : 'Idle');
    setText('audible', response.audible ? 'Yes' : 'No');
    setText('seconds', formatRuntime(response.seconds));
  });
});