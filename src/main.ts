// ---------------------------------------------------------------------------
// IGNIS · Watt-Wise — presenter-guide app bootstrap.
// Scroll-snapping slide deck with a light theme, auto-playing 3D device scenes,
// big-number reveals, and a live presenter talk-track panel.
// ---------------------------------------------------------------------------
import "./style.css";
import { gsap, scrollToAnchor, prefersReducedMotion } from "./scroll";
import { buildSections, type SlideMeta } from "./sections";
import { Background } from "./three/background";
import { Stage } from "./three/stage";
import { SpeedBreaker } from "./three/speedbreaker";
import { Footstep } from "./three/footstep";
import { countUp } from "./charts/countup";

const app = document.getElementById("app") as HTMLElement;
const built = buildSections(app);
const slideEls = Array.from(app.querySelectorAll<HTMLElement>(".slide"));

// ---- Preloader ----
function runPreloader(onDone: () => void) {
  const pre = document.getElementById("preloader")!;
  const bar = pre.querySelector(".preloader__bar span") as HTMLElement;
  const pct = pre.querySelector(".preloader__pct") as HTMLElement;
  const state = { v: 0 };
  gsap.to(state, {
    v: 100,
    duration: prefersReducedMotion ? 0.2 : 1.2,
    ease: "power2.inOut",
    onUpdate() {
      bar.style.width = `${state.v}%`;
      pct.textContent = String(Math.round(state.v));
    },
    onComplete() {
      pre.classList.add("is-done");
      onDone();
    },
  });
}

// ---- WebGL backdrop ----
const bg = new Background(document.getElementById("bg-canvas") as HTMLCanvasElement, prefersReducedMotion);

// ---- Device stages (auto-play + step sync) ----
function makeStepSync(steps: HTMLElement[]) {
  let last = -1;
  return (p: number) => {
    const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
    if (idx === last) return;
    last = idx;
    steps.forEach((s, i) => s.classList.toggle("is-active", i === idx));
  };
}
new Stage(built.stageEls.speedbreaker, new SpeedBreaker(), {
  camZ: 7.5,
  reduced: prefersReducedMotion,
  onProgress: makeStepSync(built.stepEls.speedbreaker),
});
new Stage(built.stageEls.footstep, new Footstep(), {
  camZ: 8,
  reduced: prefersReducedMotion,
  onProgress: makeStepSync(built.stepEls.footstep),
});

// ---- Hero intro ----
function heroIntro() {
  bg.setIntro(1);
  if (prefersReducedMotion) return;
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from('[data-hero="brand"]', { y: 16, opacity: 0, duration: 0.6 })
    .from('[data-hero="kicker"]', { y: 18, opacity: 0, duration: 0.6 }, "-=0.3")
    .from('[data-hero="l1"]', { yPercent: 110, duration: 0.85 }, "-=0.25")
    .from('[data-hero="l2"]', { yPercent: 110, duration: 0.85 }, "-=0.65")
    .from('[data-hero="sub"]', { y: 20, opacity: 0, duration: 0.7 }, "-=0.45")
    .from('[data-hero="cue"]', { opacity: 0, duration: 0.7 }, "-=0.4");
}

// ---- Reveal on scroll ----
function initReveals() {
  if (prefersReducedMotion) {
    document.querySelectorAll("[data-reveal]").forEach((n) => n.classList.add("is-in"));
    runOneShots(document);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          runOneShots(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
  );
  document
    .querySelectorAll<HTMLElement>(".sol-card[data-reveal], .concl-cell[data-reveal], .toc__row[data-reveal], .stat-card[data-reveal], .chal-card[data-reveal], .biblio__row[data-reveal]")
    .forEach((n, i) => (n.style.transitionDelay = `${(i % 6) * 0.055}s`));
  document.querySelectorAll("[data-reveal]").forEach((n) => io.observe(n));
}

// count-ups + wastage chart fire once when their host reveals
let wastagePlayed = false;
function runOneShots(scope: Document | Element) {
  scope.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
    if (n.dataset.done) return;
    n.dataset.done = "1";
    const t = built.countTargets.find((c) => c.el === n);
    if (t) countUp(n, t.to, t.decimals);
  });
  if (!wastagePlayed) {
    const host =
      scope instanceof Element ? scope.querySelector(".wastage") : document.querySelector(".wastage");
    // only fire when the chart's own container has revealed (or reduced-motion full doc pass)
    if (host && (scope === document || (scope instanceof Element && scope.contains(host)))) {
      wastagePlayed = true;
      animateWastage();
    }
  }
}
function animateWastage() {
  const obj = { t: 0 };
  if (prefersReducedMotion) return built.wastage.play(1);
  gsap.to(obj, { t: 1, duration: 1.3, ease: "power3.out", onUpdate: () => built.wastage.play(obj.t) });
}

// ---- Presenter panel ----
function initPresenter(slides: SlideMeta[]) {
  const panel = document.getElementById("presenter")!;
  const toggle = document.getElementById("presenter-toggle")!;
  const list = panel.querySelector(".presenter__notes") as HTMLElement;
  const nameEl = panel.querySelector(".presenter__slidename") as HTMLElement;
  const byId = new Map(slides.map((s) => [s.id, s]));

  const render = (id: string) => {
    const s = byId.get(id);
    if (!s) return;
    nameEl.textContent = s.name;
    list.innerHTML = s.notes.map((n) => `<li>${n}</li>`).join("");
  };
  render(slides[0].id);

  let hidden = false;
  const setHidden = (v: boolean) => {
    hidden = v;
    panel.classList.toggle("is-hidden", hidden);
    toggle.classList.toggle("is-visible", hidden);
  };
  toggle.addEventListener("click", () => setHidden(false));
  window.addEventListener("keydown", (e) => {
    if (e.key === "n" || e.key === "N") setHidden(!hidden);
  });

  return render;
}

// ---- Active-slide tracking: counter, nav, presenter, backdrop tint ----
function initTracking(renderPresenter: (id: string) => void) {
  const counter = document.getElementById("slide-counter") as HTMLElement;
  const fill = document.getElementById("progress-fill") as HTMLElement;
  const total = slideEls.length;
  const navButtons = new Map<string, HTMLButtonElement>();

  // chapter nav
  const nav = document.getElementById("chapter-nav")!;
  built.chapters.forEach((c) => {
    const btn = document.createElement("button");
    btn.innerHTML = `<span class="label">${c.label}</span><span class="dot"></span>`;
    btn.addEventListener("click", () => scrollToAnchor(c.id));
    nav.appendChild(btn);
    navButtons.set(c.id, btn);
  });

  let activeIdx = 0;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const idxAttr = slideEls.indexOf(e.target as HTMLElement);
        if (idxAttr < 0) return;
        activeIdx = idxAttr;
        const id = (e.target as HTMLElement).id;
        counter.innerHTML = `<b>${String(idxAttr + 1).padStart(2, "0")}</b> / ${String(total).padStart(2, "0")}`;
        renderPresenter(id);
        navButtons.forEach((b, cid) => b.classList.toggle("is-active", cid === id));
        // set accent + backdrop tint from progress
        const prog = idxAttr / (total - 1);
        bg.setProgress(prog);
      });
    },
    { threshold: 0.55 }
  );
  slideEls.forEach((s) => io.observe(s));

  // progress bar (scroll-based, smooth)
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    fill.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // keyboard slide nav
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      slideEls[Math.min(total - 1, activeIdx + 1)]?.scrollIntoView({ behavior: "smooth" });
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      slideEls[Math.max(0, activeIdx - 1)]?.scrollIntoView({ behavior: "smooth" });
    }
  });
}

// ---- TOC links ----
function initTocLinks() {
  document.querySelectorAll<HTMLElement>("[data-goto]").forEach((row) => {
    row.addEventListener("click", () => scrollToAnchor(row.dataset.goto!));
  });
}

// ---- Boot ----
function boot() {
  const renderPresenter = initPresenter(built.slides);
  initReveals();
  initTocLinks();
  initTracking(renderPresenter);
}

runPreloader(() => {
  boot();
  heroIntro();
});
