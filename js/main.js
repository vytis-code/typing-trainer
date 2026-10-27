const textEl = document.getElementById("text");
const hintEl = document.getElementById("hint");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timeEl = document.getElementById("time");

let textIndex = 0;
let session;
let charEls = [];
let timerId = null;

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

  hintEl.textContent = "Start typing to begin. Backspace fixes mistakes.";
  hintEl.classList.remove("done");
  // WPM and accuracy stay blank until the exercise is finished.
  wpmEl.textContent = "–";
  accuracyEl.textContent = "–";
  render();
  textEl.focus();
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

function renderTime() {
  timeEl.textContent = getStats(session, performance.now()).seconds;
}

function renderFinalStats() {
  const stats = getStats(session, performance.now());
  wpmEl.textContent = stats.wpm;
  accuracyEl.textContent = `${stats.accuracy}%`;
  timeEl.textContent = stats.seconds;
}

document.addEventListener("keydown", (e) => {
  // Leave browser shortcuts (Ctrl+R, Ctrl+L, ...) and focused buttons alone.
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target instanceof HTMLButtonElement && (e.key === "Enter" || e.key === " ")) return;
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
    hintEl.textContent = "Done! Press Restart or New text.";
    hintEl.classList.add("done");
  }
});

document.getElementById("restart").addEventListener("click", () => start(textIndex));
document.getElementById("next").addEventListener("click", () => start(randomOtherIndex(textIndex)));

// Random index into TEXTS, never the current one (unless there is only one text).
function randomOtherIndex(current) {
  if (TEXTS.length < 2) return current;
  // Pick from the other length - 1 slots, then skip over the current one.
  const i = Math.floor(Math.random() * (TEXTS.length - 1));
  return i >= current ? i + 1 : i;
}

start(0);
