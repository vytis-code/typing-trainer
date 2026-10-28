// Line chart of one stat over the latest attempts, drawn as SVG.
const SVG_NS = "http://www.w3.org/2000/svg";
const CHART_HEIGHT = 200;
const MARGIN = { top: 16, right: 52, bottom: 28, left: 40 };

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  return el;
}

// Rounds a raw tick step up to 1, 2 or 5 times a power of ten (never below 1).
function niceStep(raw) {
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
  return Math.max(1, step);
}

// Fits the y range to the values shown, with some air above and below, so the line
// follows the user's current level instead of being squashed between 0 and a fixed top.
// minSpan stops small wobbles from looking like huge swings.
function yDomain(values, { minSpan, min = 0, max = Infinity }) {
  const dataLo = Math.min(...values);
  const dataHi = Math.max(...values);
  const mid = (dataLo + dataHi) / 2;
  const half = (Math.max(dataHi - dataLo, minSpan) / 2) * 1.3;
  let lo = mid - half;
  let hi = mid + half;

  // Hitting a limit (0, or 100%) shifts the range instead of cutting it.
  if (lo < min) { hi += min - lo; lo = min; }
  if (hi > max) { lo = Math.max(min, lo - (hi - max)); hi = max; }

  const step = niceStep((hi - lo) / 3);
  return {
    lo: Math.max(min, Math.floor(lo / step) * step),
    hi: Math.min(max, Math.ceil(hi / step) * step),
    step,
  };
}

function formatValue(value, metric) {
  return `${Math.round(value)}${metric.unit}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// points: [{ value, number, date }], oldest first. metric: { label, unit, minSpan, max? }
function renderChart(container, points, metric) {
  container.innerHTML = "";

  if (points.length === 0) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.textContent = "Finish an exercise to see your progress here.";
    container.append(empty);
    return;
  }

  const width = container.clientWidth;
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const { lo, hi, step } = yDomain(points.map((p) => p.value), metric);
  const n = points.length;
  const x = (i) => MARGIN.left + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const y = (v) => MARGIN.top + plotH - ((v - lo) / (hi - lo)) * plotH;
  const last = points[n - 1];

  const svg = svgEl("svg", {
    width, height: CHART_HEIGHT, viewBox: `0 0 ${width} ${CHART_HEIGHT}`,
    tabindex: 0, role: "img",
    "aria-label": `${metric.label} over the last ${n} attempts. Latest ${formatValue(last.value, metric)}. Use arrow keys to step through attempts.`,
  });

  // Gridlines and y ticks.
  for (let v = lo; v <= hi + 1e-9; v += step) {
    svg.append(svgEl("line", { class: "gridline", x1: MARGIN.left, x2: MARGIN.left + plotW, y1: y(v), y2: y(v) }));
    const tick = svgEl("text", { x: MARGIN.left - 8, y: y(v) + 4, "text-anchor": "end" });
    tick.textContent = Math.round(v);
    svg.append(tick);
  }

  // Attempt numbers at both ends of the x axis.
  const xLabels = n === 1 ? [0] : [0, n - 1];
  for (const i of xLabels) {
    const anchor = n === 1 ? "middle" : i === 0 ? "start" : "end";
    const label = svgEl("text", { x: x(i), y: CHART_HEIGHT - 8, "text-anchor": anchor });
    label.textContent = `#${points[i].number}`;
    svg.append(label);
  }

  // The line, with a dot and the value at its end.
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  svg.append(svgEl("path", { class: "line", d }));
  svg.append(svgEl("circle", { class: "dot", cx: x(n - 1), cy: y(last.value), r: 4 }));
  const endLabel = svgEl("text", { class: "end-label", x: x(n - 1) + 9, y: y(last.value) + 4 });
  endLabel.textContent = formatValue(last.value, metric);
  svg.append(endLabel);

  // Hover layer: a crosshair that snaps to the nearest attempt, plus a tooltip.
  const crosshair = svgEl("line", { class: "crosshair", y1: MARGIN.top, y2: MARGIN.top + plotH, visibility: "hidden" });
  const hoverDot = svgEl("circle", { class: "dot", r: 5, visibility: "hidden" });
  svg.append(crosshair, hoverDot);

  const tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip";
  tooltip.hidden = true;
  const tipValue = document.createElement("strong");
  const tipMeta = document.createElement("span");
  tooltip.append(tipValue, tipMeta);

  container.append(svg, tooltip);

  let active = -1;

  function show(i) {
    active = i;
    const px = x(i);
    const py = y(points[i].value);
    for (const attr of ["x1", "x2"]) crosshair.setAttribute(attr, px);
    crosshair.setAttribute("visibility", "visible");
    hoverDot.setAttribute("cx", px);
    hoverDot.setAttribute("cy", py);
    hoverDot.setAttribute("visibility", "visible");

    tipValue.textContent = formatValue(points[i].value, metric);
    tipMeta.textContent = `Attempt #${points[i].number} · ${formatDate(points[i].date)}`;
    tooltip.hidden = false;
    // Keep the tooltip inside the chart; put it below the point if there's no room above.
    const left = Math.min(Math.max(px - tooltip.offsetWidth / 2, 4), width - tooltip.offsetWidth - 4);
    const above = py - tooltip.offsetHeight - 12;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${above >= 0 ? above : py + 12}px`;
  }

  function hide() {
    active = -1;
    crosshair.setAttribute("visibility", "hidden");
    hoverDot.setAttribute("visibility", "hidden");
    tooltip.hidden = true;
  }

  svg.addEventListener("pointermove", (e) => {
    const mx = e.clientX - svg.getBoundingClientRect().left;
    const i = n === 1 ? 0 : Math.round(((mx - MARGIN.left) / plotW) * (n - 1));
    show(Math.min(n - 1, Math.max(0, i)));
  });
  svg.addEventListener("pointerleave", hide);

  // Same readout from the keyboard: focus shows the latest attempt, arrows move along.
  svg.addEventListener("focus", () => show(n - 1));
  svg.addEventListener("blur", hide);
  svg.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const from = active < 0 ? n - 1 : active;
    show(Math.min(n - 1, Math.max(0, from + (e.key === "ArrowRight" ? 1 : -1))));
  });
}
