/**
 * Options page for IKEA RSD to BAM Converter
 * Handles user preferences for display mode
 */

// ============================================================================
// Constants
// ============================================================================

const STORAGE_CONFIG = Object.freeze({
  DEFAULT_DISPLAY_MODE: 'alongside',
  STATUS_TIMEOUT: 3000,
});

const DOM_IDS = Object.freeze({
  SAVE_BUTTON: 'save',
  STATUS: 'status',
});

const CSS_CLASSES = Object.freeze({
  STATUS_SUCCESS: 'status success',
});

// ============================================================================
// DOM Utilities
// ============================================================================

/**
 * Get element by ID with error handling
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} Element or null if not found
 */
const getElement = (id) => {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element with ID "${id}" not found`);
  }
  return element;
};

/**
 * Show status message to user
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
const showStatus = (message, duration = STORAGE_CONFIG.STATUS_TIMEOUT) => {
  const statusElement = getElement(DOM_IDS.STATUS);
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.className = CSS_CLASSES.STATUS_SUCCESS;
  statusElement.style.display = 'block';

  setTimeout(() => {
    statusElement.style.display = 'none';
  }, duration);
};

// ============================================================================
// Storage Operations
// ============================================================================

/**
 * Load settings from Chrome storage and update UI
 * @returns {Promise<void>}
 */
const loadSettings = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(
      { displayMode: STORAGE_CONFIG.DEFAULT_DISPLAY_MODE },
      (items) => {
        if (chrome.runtime.lastError) {
          console.error('Error loading settings:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }

        const radioElement = getElement(items.displayMode);
        if (radioElement) {
          radioElement.checked = true;
        }

        resolve();
      }
    );
  });
};

/**
 * Save settings to Chrome storage
 * @returns {Promise<void>}
 */
const saveSettings = () => {
  return new Promise((resolve, reject) => {
    const selectedRadio = document.querySelector('input[name="displayMode"]:checked');

    if (!selectedRadio) {
      console.error('No display mode selected');
      reject(new Error('No display mode selected'));
      return;
    }

    const displayMode = selectedRadio.value;

    chrome.storage.sync.set({ displayMode }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving settings:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }

      showStatus('Settings saved successfully!');
      resolve();
    });
  });
};

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle save button click
 */
const handleSaveClick = async () => {
  try {
    await saveSettings();
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus('Failed to save settings. Please try again.');
  }
};

/**
 * Initialize options page
 */
const initializeOptionsPage = async () => {
  try {
    await loadSettings();

    const saveButton = getElement(DOM_IDS.SAVE_BUTTON);
    if (saveButton) {
      saveButton.addEventListener('click', handleSaveClick);
    }
  } catch (error) {
    console.error('Failed to initialize options page:', error);
  }
};

// ============================================================================
// Entry Point
// ============================================================================

document.addEventListener('DOMContentLoaded', initializeOptionsPage);
