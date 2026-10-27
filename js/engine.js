// Pure typing logic: no DOM access, so it can be tested on its own.
function createSession(target) {
  return {
    target,
    typed: "",
    keystrokes: 0, // every character typed, including ones later deleted
    errors: 0,     // every wrong character typed, even if corrected afterwards
    startTime: null,
    endTime: null,
  };
}

function typeChar(session, char, now) {
  if (isFinished(session)) return;
  if (session.startTime === null) session.startTime = now;

  const expected = session.target[session.typed.length];
  session.keystrokes++;
  if (char !== expected) session.errors++;
  session.typed += char;

  if (isFinished(session)) session.endTime = now;
}

function backspace(session) {
  if (isFinished(session)) return;
  session.typed = session.typed.slice(0, -1);
}

function isFinished(session) {
  return session.typed.length >= session.target.length;
}

// Returns "correct", "incorrect", or "pending" for each character in the target.
function charStates(session) {
  return [...session.target].map((ch, i) => {
    if (i >= session.typed.length) return "pending";
    return session.typed[i] === ch ? "correct" : "incorrect";
  });
}

function getStats(session, now) {
  if (session.startTime === null) {
    return { wpm: 0, accuracy: 100, seconds: 0 };
  }
  const end = session.endTime ?? now;
  const minutes = (end - session.startTime) / 60000;

  let correct = 0;
  for (let i = 0; i < session.typed.length; i++) {
    if (session.typed[i] === session.target[i]) correct++;
  }

  // Standard definition: one "word" = 5 correct characters.
  const wpm = minutes > 0 ? Math.round(correct / 5 / minutes) : 0;
  const accuracy = session.keystrokes > 0
    ? Math.round(((session.keystrokes - session.errors) / session.keystrokes) * 100)
    : 100;

  return { wpm, accuracy, seconds: Math.floor((end - session.startTime) / 1000) };
}
