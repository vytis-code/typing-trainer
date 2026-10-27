// Saves finished attempts in the browser's localStorage. It stays until the user clears site data.
// The data is versioned so the format can change later without breaking old saves.
const STORAGE_KEY = "typing-trainer";
const STORAGE_VERSION = 1;

function loadData() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data?.version === STORAGE_VERSION && Array.isArray(data.attempts)) return data;
  } catch {
    // Storage blocked (e.g. private mode) or broken data: start empty.
  }
  return { version: STORAGE_VERSION, attempts: [] };
}

function loadAttempts() {
  return loadData().attempts;
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
