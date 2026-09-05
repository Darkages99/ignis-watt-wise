// Tiny number count-up used for the big stat figures. Non-dependency.
export function countUp(el: HTMLElement, to: number, decimals = 1, duration = 1100) {
  const start = performance.now();
  const from = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const e = 1 - Math.pow(1 - t, 3);
    el.textContent = (from + (to - from) * e).toFixed(decimals);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
