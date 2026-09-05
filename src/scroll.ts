// Minimal helpers. Scroll-snapping is handled by native CSS scroll-snap, so no
// smooth-scroll library is used (it would fight mandatory snap). GSAP is kept
// only for the preloader + hero intro.
import gsap from "gsap";

export const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function scrollToAnchor(anchor: string) {
  const el = document.getElementById(anchor);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
}

export { gsap };
