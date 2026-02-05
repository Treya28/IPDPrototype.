
// Background service worker for handling messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyseTask") {
    
    // Forward to Python backend
    fetch('http://localhost:7700/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: request.task })
    })
    .then(response => response.json())
    .then(data => sendResponse(data))
    .catch(error => sendResponse({ error: error.message }));
    
    return true; // Keep message open for async response
  }
});

// Keep backend connection alive
chrome.alarms.create('pingBackend', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pingBackend') {
    fetch('http://localhost:7700/health')
      .catch(error => console.log('Backend not responding:', error));
  }
});