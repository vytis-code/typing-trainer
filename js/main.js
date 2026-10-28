const textEl = document.getElementById("text");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const finalAccuracyEl = document.getElementById("final-accuracy");

let textIndex = 0;
let session;
let charEls = [];
// Stats of the last finished exercise, shown until a new one finishes. Survives a page reload.
let lastResult = loadAttempts().at(-1) ?? null;

function start(index) {
  textIndex = index;
  session = createSession(TEXTS[textIndex]);

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
  setStat(wpmEl, lastResult?.wpm);
  setStat(accuracyEl, lastResult?.accuracy);
  setStat(finalAccuracyEl, lastResult?.finalAccuracy);
}

// Writes a number, or "–" when there is none. The unit right after it (%) is hidden with the dash.
function setStat(el, value) {
  const missing = value === undefined;
  el.textContent = missing ? "–" : value;
  const unit = el.nextElementSibling;
  if (unit?.classList.contains("unit")) unit.hidden = missing;
}

function render() {
  const states = charStates(session);
  charEls.forEach((el, i) => {
    el.classList.toggle("correct", states[i] === "correct");
    el.classList.toggle("incorrect", states[i] === "incorrect");
    el.classList.toggle("current", i === session.typed.length);
  });
  // With a wrong last letter the cursor waits after it, until Backspace is pressed.
  const waitingAtEnd = session.typed.length === charEls.length && !isFinished(session);
  charEls.at(-1).classList.toggle("current-end", waitingAtEnd);
}

function renderFinalStats() {
  lastResult = getStats(session, performance.now());
  saveAttempt({ date: new Date().toISOString(), charCount: session.target.length, ...lastResult });
  renderLastResult();
  renderProgress();
}

// Progress chart: one view, a tab per stat.
const chartEl = document.getElementById("chart");
const tabEls = document.querySelectorAll(".tabs [role=tab]");
const CHART_ATTEMPTS = 20;
// minSpan: the smallest y range shown, so tiny differences don't look like big swings.
const METRICS = {
  wpm: { label: "WPM", unit: "", minSpan: 10 },
  accuracy: { label: "Accuracy", unit: "%", minSpan: 5, max: 100 },
  finalAccuracy: { label: "Final accuracy", unit: "%", minSpan: 5, max: 100 },
  seconds: { label: "Time", unit: "s", minSpan: 5 },
  charCount: { label: "Symbols", unit: "", minSpan: 10 },
};
let chartMetric = "wpm";

function renderProgress() {
  const attempts = loadAttempts();
  const first = Math.max(0, attempts.length - CHART_ATTEMPTS);
  const recent = attempts.slice(first);
  const points = recent
    .map((a, i) => ({ value: a[chartMetric], number: first + i + 1, date: a.date }))
    .filter((p) => typeof p.value === "number");
  renderChart(chartEl, points, METRICS[chartMetric]);
  renderAverages(recent);
}

const avgWpmEl = document.getElementById("avg-wpm");
const avgAccuracyEl = document.getElementById("avg-accuracy");
const avgFinalAccuracyEl = document.getElementById("avg-final-accuracy");

// Plain mean of the attempts that have the stat, rounded; undefined when there are none.
function average(attempts, key) {
  const values = attempts.map((a) => a[key]).filter((v) => typeof v === "number");
  if (values.length === 0) return undefined;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function renderAverages(attempts) {
  setStat(avgWpmEl, average(attempts, "wpm"));
  setStat(avgAccuracyEl, average(attempts, "accuracy"));
  setStat(avgFinalAccuracyEl, average(attempts, "finalAccuracy"));
}

tabEls.forEach((tab) => {
  tab.addEventListener("click", () => {
    chartMetric = tab.dataset.metric;
    tabEls.forEach((t) => t.setAttribute("aria-selected", t === tab));
    renderProgress();
  });
});

// Show/hide the whole progress section. The choice is remembered between visits.
const progressEl = document.getElementById("progress");
const toggleChartEl = document.getElementById("toggle-chart");

function setChartVisible(visible) {
  progressEl.hidden = !visible;
  toggleChartEl.textContent = visible ? "Hide statistics" : "Show statistics";
  toggleChartEl.setAttribute("aria-expanded", visible);
  // While hidden the chart has no width to draw to, so draw it fresh when it appears.
  if (visible) renderProgress();
}

toggleChartEl.addEventListener("click", () => {
  const visible = progressEl.hidden;
  setChartVisible(visible);
  saveSetting("chartVisible", visible);
});

setChartVisible(loadSettings().chartVisible ?? true);

// The chart is drawn to the container's width, so redraw when that changes.
let chartWidth = 0;
new ResizeObserver(() => {
  if (chartEl.clientWidth === chartWidth) return;
  chartWidth = chartEl.clientWidth;
  renderProgress();
}).observe(chartEl);

// Keys only count while the text box has focus.
textEl.addEventListener("keydown", (e) => {
  // Leave browser shortcuts (Ctrl+R, Ctrl+L, ...) alone.
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // Shortcuts. Enter only works before typing or after finishing, so a stray Enter can't throw away progress.
  if (e.key === "Escape") {
    e.preventDefault();
    start(textIndex);
    return;
  }
  if (e.key === "Enter" && (session.typed.length === 0 || isFinished(session))) {
    e.preventDefault();
    start(randomOtherIndex(textIndex));
    return;
  }

  if (isFinished(session)) return;

  if (e.key === "Backspace") {
    e.preventDefault();
    backspace(session);
  } else if (e.key.length === 1) {
    // Printable character (Shift is already applied to e.key).
    e.preventDefault(); // stops Space from scrolling the page
    typeChar(session, e.key, performance.now());
  } else {
    return;
  }

  render();

  if (isFinished(session)) renderFinalStats();
});

// Leaving the text box shows the overlay and blur (pure CSS).
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
