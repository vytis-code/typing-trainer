const textEl = document.getElementById("text");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timeEl = document.getElementById("time");

let textIndex = 0;
let session;
let charEls = [];
let timerId = null;
let lastResult = null; // stats of the last finished exercise, shown until a new one finishes

function start(index) {
  textIndex = index;
  session = createSession(TEXTS[textIndex]);
  clearInterval(timerId);
  timerId = null;

  textEl.innerHTML = "";
  charEls = [...session.target].map((ch) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch;
    textEl.appendChild(span);
    return span;
  });

  renderLastResult();
  render();
  textEl.focus();
}

// Shows the last finished exercise, or dashes if there isn't one yet.
function renderLastResult() {
  wpmEl.textContent = lastResult ? lastResult.wpm : "–";
  accuracyEl.textContent = lastResult ? `${lastResult.accuracy}%` : "–";
  timeEl.textContent = lastResult ? lastResult.seconds : "–";
}

function render() {
  const states = charStates(session);
  charEls.forEach((el, i) => {
    el.classList.toggle("correct", states[i] === "correct");
    el.classList.toggle("incorrect", states[i] === "incorrect");
    el.classList.toggle("current", i === session.typed.length);
  });
  renderTime();
}

// The time counts live once typing starts; before that it keeps showing the last result.
function renderTime() {
  if (session.startTime === null) return;
  timeEl.textContent = getStats(session, performance.now()).seconds;
}

function renderFinalStats() {
  lastResult = getStats(session, performance.now());
  renderLastResult();
}

// Keys only count while the text box has focus.
textEl.addEventListener("keydown", (e) => {
  // Leave browser shortcuts (Ctrl+R, Ctrl+L, ...) alone.
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (isFinished(session)) return;

  if (e.key === "Backspace") {
    e.preventDefault();
    backspace(session);
  } else if (e.key.length === 1) {
    // Printable character (Shift is already applied to e.key).
    e.preventDefault(); // stops Space from scrolling the page
    const wasStarted = session.startTime !== null;
    typeChar(session, e.key, performance.now());
    if (!wasStarted) timerId = setInterval(renderTime, 250);
  } else {
    return;
  }

  render();

  if (isFinished(session)) {
    clearInterval(timerId);
    renderFinalStats();
  }
});

// Leaving the text box pauses the clock; the overlay and blur come from CSS.
textEl.addEventListener("blur", () => clearInterval(timerId));

// Coming back to a text that was already started restarts it from zero.
// A fresh session (nothing typed yet) is left as it is, so start() focusing it doesn't loop.
textEl.addEventListener("focus", () => {
  if (session.typed.length > 0) start(textIndex);
});

document.getElementById("restart").addEventListener("click", () => start(textIndex));
document.getElementById("next").addEventListener("click", () => start(randomOtherIndex(textIndex)));

// Keep focus on the text box when a button is clicked, so the overlay doesn't flash.
document.querySelectorAll(".controls button").forEach((btn) => {
  btn.addEventListener("mousedown", (e) => e.preventDefault());
});

// Random index into TEXTS, never the current one (unless there is only one text).
function randomOtherIndex(current) {
  if (TEXTS.length < 2) return current;
  // Pick from the other length - 1 slots, then skip over the current one.
  const i = Math.floor(Math.random() * (TEXTS.length - 1));
  return i >= current ? i + 1 : i;
}

start(0);
