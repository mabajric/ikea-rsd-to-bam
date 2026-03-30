// Load saved settings
function loadSettings() {
  chrome.storage.sync.get({
    displayMode: 'alongside' // default value
  }, function(items) {
    document.getElementById(items.displayMode).checked = true;
  });
}

// Save settings
function saveSettings() {
  const displayMode = document.querySelector('input[name="displayMode"]:checked').value;

  chrome.storage.sync.set({
    displayMode: displayMode
  }, function() {
    // Update status to let user know settings were saved
    const status = document.getElementById('status');
    status.textContent = 'Settings saved successfully!';
    status.className = 'status success';
    status.style.display = 'block';

    setTimeout(function() {
      status.style.display = 'none';
    }, 3000);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('save').addEventListener('click', saveSettings);
