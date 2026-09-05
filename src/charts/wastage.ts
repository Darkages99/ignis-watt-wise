// Log-scaled horizontal bar chart for the "energy wastage" problem slide.
// Data comes from content.ts (PROBLEM.data). Bars are sized by log10 so the
// enormous range (10^7 .. 10^13) is readable; play(0..1) draws them in.
import { ACCENTS, PROBLEM } from "../content";

type Row = (typeof PROBLEM.data)[number];

const ease = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

export function createWastage(data: readonly Row[]) {
  const logs = data.map((d) => Math.log10(d.value));
  const min = Math.min(...logs) - 1.5;
  const max = Math.max(...logs);
  const frac = (v: number) => (Math.log10(v) - min) / (max - min);

  const el = document.createElement("div");
  el.className = "wastage";

  const rows = data.map((d) => {
    const row = document.createElement("div");
    row.className = "wastage__row" + (d.highlight ? " is-hi" : "");
    row.innerHTML = `
      <div class="wastage__name">${d.label}</div>
      <div class="wastage__bar-wrap">
        <div class="wastage__bar">
          <div class="wastage__fill" style="--a:${ACCENTS[d.accent]}"></div>
          <div class="wastage__val">${d.display}</div>
        </div>
      </div>`;
    el.appendChild(row);
    return { fill: row.querySelector(".wastage__fill") as HTMLElement, target: frac(d.value) };
  });

  const axis = document.createElement("div");
  axis.className = "wastage__axis";
  axis.textContent = `${PROBLEM.unit} · log scale`;
  el.appendChild(axis);

  const play = (t: number) => {
    const e = ease(t);
    rows.forEach((r) => (r.fill.style.width = `${Math.max(3, r.target * 100 * e)}%`));
  };

  return { el, play };
}
