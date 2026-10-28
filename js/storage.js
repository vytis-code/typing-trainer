// Saves finished attempts in the browser's localStorage. It stays until the user clears site data.
// The data is versioned so the format can change later without breaking old saves.
const STORAGE_KEY = "typing-trainer";
const STORAGE_VERSION = 1;

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function loadData() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data?.version === STORAGE_VERSION && Array.isArray(data.attempts)) {
      // Drop broken entries (null, numbers, ...) so one bad attempt can't break the chart or averages.
      data.attempts = data.attempts.filter(isPlainObject);
      return data;
    }
  } catch {
    // Storage blocked (e.g. private mode) or broken data: start empty.
  }
  return { version: STORAGE_VERSION, attempts: [] };
}

function loadAttempts() {
  return loadData().attempts;
}

// Small view preferences, kept apart from the attempt history.
const SETTINGS_KEY = "typing-trainer-settings";

function loadSettings() {
  try {
    // Anything but an object (a number, text, null) counts as no settings.
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return isPlainObject(settings) ? settings : {};
  } catch {
    return {};
  }
}

function saveSetting(name, value) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...loadSettings(), [name]: value }));
  } catch {
    // Storage blocked: the setting just isn't remembered.
  }
}

// attempt: { date, charCount, wpm, accuracy, finalAccuracy, seconds }
function saveAttempt(attempt) {
  const data = loadData();
  data.attempts.push(attempt);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked: the attempt just isn't saved.
  }
}
