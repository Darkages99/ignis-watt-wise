// ---------------------------------------------------------------------------
// Builds the deck as a series of full-viewport scroll-snap slides.
// On-screen copy is intentionally sparse (visuals + big numbers); detail lives
// in the presenter notes returned to main.ts.
// ---------------------------------------------------------------------------
import {
  BRAND,
  HERO,
  TOC,
  PROBLEM,
  RESEARCH,
  SOLUTIONS,
  SPEEDBREAKER,
  GRID_FLOW,
  FOOTSTEP,
  ANALYSIS,
  CHALLENGES,
  CONCLUSION,
  BIBLIOGRAPHY,
  ACCENTS,
  type Step,
} from "../content";
import { glyph } from "./glyphs";
import { createWastage } from "../charts/wastage";

const el = (html: string): HTMLElement => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild as HTMLElement;
};

function stepsMarkup(steps: Step[], accent: string): string {
  return steps
    .map(
      (s) => `
      <div class="step" data-step>
        <div class="step__no" style="--a:${accent}">${s.no}</div>
        <div><div class="step__title">${s.title}</div><div class="step__body">${s.body}</div></div>
      </div>`
    )
    .join("");
}

export interface SlideMeta { id: string; name: string; notes: string[] }

export interface BuildResult {
  slides: SlideMeta[];
  chapters: { id: string; label: string; el: HTMLElement }[];
  stageEls: Record<string, HTMLElement>;
  stepEls: Record<string, HTMLElement[]>;
  wastage: ReturnType<typeof createWastage>;
  countTargets: { el: HTMLElement; to: number; decimals: number }[];
}

export function buildSections(app: HTMLElement): BuildResult {
  const a = ACCENTS;
  const countTargets: BuildResult["countTargets"] = [];

  // ---- HERO ----
  const hero = el(`
    <section class="slide" id="hero" data-slide data-name="Title">
      <div class="wrap">
        <div class="hero__brand" data-hero="brand"><img src="${BRAND.logo}" alt="${BRAND.org}"/><span>${BRAND.org}</span></div>
        <div class="hero__kicker" data-hero="kicker">${HERO.kicker}</div>
        <h1 class="hero__title">
          <span class="line"><span data-hero="l1">${HERO.title[0]}</span></span>
          <span class="line"><span class="grad" data-hero="l2">${HERO.title[1]}</span></span>
        </h1>
        <p class="hero__sub" data-hero="sub">${HERO.sub}</p>
        <div class="hero__cue" data-hero="cue"><span class="mouse"></span> ${HERO.scrollCue}</div>
      </div>
    </section>`);

  // ---- AGENDA ----
  const toc = el(`
    <section class="slide" id="toc" data-slide data-name="Agenda">
      <div class="wrap">
        <div class="toc__head">
          <span class="chapter-tag" data-reveal>Agenda</span>
          <span class="eyebrow" data-reveal>Six chapters</span>
        </div>
        <div class="toc__list">
          ${TOC.map(
            (t) => `
            <div class="toc__row" data-goto="${t.anchor}" data-reveal>
              <span class="toc__no">${t.no}</span>
              <span class="toc__title">${t.title}</span>
              <span class="toc__arrow">→</span>
            </div>`
          ).join("")}
        </div>
      </div>
    </section>`);

  // ---- PROBLEM ----
  const wastage = createWastage(PROBLEM.data);
  const problem = el(`
    <section class="slide" id="problem" data-slide data-name="The Problem">
      <div class="wrap">
        <span class="chapter-tag" data-reveal>Chapter ${PROBLEM.chapter} · ${PROBLEM.title}</span>
        <div class="problem__grid">
          <h2 class="problem__headline" data-reveal>${PROBLEM.headline}</h2>
          <div class="wastage-slot" data-reveal></div>
        </div>
      </div>
    </section>`);
  problem.querySelector(".wastage-slot")!.appendChild(wastage.el);

  // ---- RESEARCH ----
  const research = el(`
    <section class="slide" id="research" data-slide data-name="Research">
      <div class="wrap">
        <span class="chapter-tag" data-reveal>Chapter ${RESEARCH.chapter} · ${RESEARCH.title}</span>
        <div class="research__grid">
          <div class="card" data-reveal>
            <div class="stat-huge"><span data-count="${RESEARCH.stat.value}" data-dec="1">0</span>${RESEARCH.stat.unit}</div>
            <p class="stat-label">${RESEARCH.statLabel}</p>
            <span class="sample-pill">Sample size · <b>${RESEARCH.sampleSize}</b> respondents</span>
          </div>
          <div class="card barrier" data-reveal>
            <span class="card__k">The one barrier</span>
            <div class="barrier__word">${RESEARCH.barrier}</div>
            <p class="barrier__note">${RESEARCH.barrierNote}</p>
          </div>
        </div>
      </div>
    </section>`);

  // ---- SOLUTIONS ----
  const solutions = el(`
    <section class="slide" id="solutions" data-slide data-name="Solutions">
      <div class="wrap">
        <span class="chapter-tag" data-reveal>Chapter ${SOLUTIONS.chapter} · Our Solutions</span>
        <h2 class="h-section" data-reveal style="margin-top:14px">${SOLUTIONS.title}</h2>
        <div class="sol__grid">
          ${SOLUTIONS.systems
            .map(
              (s) => `
            <article class="sol-card" data-reveal style="--a:${a[s.accent]}">
              ${glyph(s.id)}
              <span class="num">SYSTEM ${s.no}</span>
              <h3>${s.name}</h3>
              <p class="mech">${s.mechanism}</p>
              <span class="out">${s.output}</span>
            </article>`
            )
            .join("")}
        </div>
      </div>
    </section>`);

  // ---- DEEP DIVE: SPEED BREAKER ----
  const sbStage = el(`
    <div class="deepdive__stage" data-stage="speedbreaker"></div>`);
  const speedbreaker = el(`
    <section class="slide" id="dd-speedbreaker" data-slide data-name="Speed Breaker">
      <div class="wrap">
        <div class="deepdive__grid">
          <div class="deepdive__stage-wrap"></div>
          <div>
            <div class="deepdive__head">
              <span class="eyebrow">${SPEEDBREAKER.eyebrow}</span>
              <h2>${SPEEDBREAKER.title}</h2>
            </div>
            <div class="steps">${stepsMarkup(SPEEDBREAKER.steps, a[SPEEDBREAKER.accent])}</div>
          </div>
        </div>
      </div>
    </section>`);
  speedbreaker.querySelector(".deepdive__stage-wrap")!.replaceWith(sbStage);
  const sbSteps = Array.from(speedbreaker.querySelectorAll<HTMLElement>("[data-step]"));

  // ---- ROAD ENERGY → POWER GRID (System 01 extension) ----
  const gridFlow = el(`
    <section class="slide" id="grid-flow" data-slide data-name="Road to Grid">
      <div class="wrap">
        <span class="chapter-tag" data-reveal>${GRID_FLOW.eyebrow}</span>
        <h2 class="h-section" data-reveal style="margin-top:14px">${GRID_FLOW.title}</h2>
        <div class="flow__grid" style="--a:${a[GRID_FLOW.accent]}">
          ${GRID_FLOW.steps
            .map(
              (s) => `
            <div class="flow-step" data-reveal>
              <div class="flow-step__no">${s.no}</div>
              <div>
                <div class="flow-step__title">${s.title}</div>
                <div class="flow-step__body">${s.body}</div>
              </div>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`);

  // ---- DEEP DIVE: FOOTSTEP ----
  const fsStage = el(`
    <div class="deepdive__stage" data-stage="footstep"></div>`);
  const footstep = el(`
    <section class="slide" id="dd-footstep" data-slide data-name="Footstep">
      <div class="wrap">
        <div class="deepdive__grid">
          <div>
            <div class="deepdive__head">
              <span class="eyebrow">${FOOTSTEP.eyebrow}</span>
              <h2>${FOOTSTEP.title}</h2>
            </div>
            <div class="steps">${stepsMarkup(FOOTSTEP.steps, a[FOOTSTEP.accent])}</div>
          </div>
          <div class="deepdive__stage-wrap"></div>
        </div>
      </div>
    </section>`);
  footstep.querySelector(".deepdive__stage-wrap")!.replaceWith(fsStage);
  const fsSteps = Array.from(footstep.querySelectorAll<HTMLElement>("[data-step]"));

  // ---- ANALYSIS (big numbers, per system) ----
  const byId = <T extends { id: string }>(arr: T[], id: string) => arr.find((x) => x.id === id)!;
  const analysis = el(`
    <section class="slide" id="analysis" data-slide data-name="Implementation">
      <div class="wrap">
        <span class="chapter-tag" data-reveal>Chapter ${ANALYSIS.chapter} · ${ANALYSIS.title}</span>
        <h2 class="h-section" data-reveal style="margin-top:14px">One tile. <span style="color:var(--green)">3.5&nbsp;kWh</span> a month.</h2>
        <div class="stat-cards">
          ${ANALYSIS.output.data
            .map((o) => {
              const cost = byId(ANALYSIS.cost, o.id);
              const maint = byId(ANALYSIS.maintenance, o.id);
              const hi = "highlight" in o && o.highlight;
              return `
            <div class="stat-card${hi ? " is-hi" : ""}" data-reveal style="--a:${a[o.accent]}">
              <span class="k">${o.label}</span>
              <div class="big"><span data-count="${o.value}" data-dec="1">0</span></div>
              <span class="unit">${ANALYSIS.output.unit}</span>
              <div class="sub">Cost · <b>${cost.range}</b> (${cost.level})</div>
              <div class="sub">Maintenance · ${maint.level} — ${maint.note}</div>
              ${hi ? `<span class="tagline">Highest output</span>` : ""}
            </div>`;
            })
            .join("")}
        </div>
      </div>
    </section>`);

  // ---- CHALLENGES ----
  const challenges = el(`
    <section class="slide" id="challenges" data-slide data-name="Challenges">
      <div class="wrap">
        <span class="chapter-tag" data-reveal>Chapter ${CHALLENGES.chapter} · ${CHALLENGES.title}</span>
        <div class="chal__grid">
          ${CHALLENGES.items
            .map(
              (c) => `
            <div class="chal-card" data-reveal style="--a:${a[c.accent]}">
              <div class="sys">${c.system}</div>
              <div class="chal-block is-problem">
                <span class="mark">✕</span>
                <div><span class="k">Challenge</span><p class="txt">${c.problem}</p></div>
              </div>
              <div class="chal-block is-fix">
                <span class="mark">✓</span>
                <div><span class="k">Fix</span><p class="txt">${c.fix}</p></div>
              </div>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`);

  // ---- CONCLUSION ----
  const conclusion = el(`
    <section class="slide" id="conclusion" data-slide data-name="Conclusion">
      <div class="wrap">
        <span class="chapter-tag" data-reveal>Chapter ${CONCLUSION.chapter}</span>
        <h2 class="concl__title" data-reveal>Waste Nothing. <span class="grad">Power Everything.</span></h2>
        <p class="concl__closer" data-reveal>${CONCLUSION.closer}</p>
        <div class="concl__grid">
          ${CONCLUSION.points
            .map(
              (p, i) => `
            <div class="concl-cell" data-reveal>
              <span class="idx">0${i + 1}</span><h3>${p.title}</h3><p>${p.body}</p>
            </div>`
            )
            .join("")}
        </div>
      </div>
    </section>`);

  // ---- BIBLIOGRAPHY ----
  const biblio = el(`
    <section class="slide" id="biblio" data-slide data-name="Bibliography">
      <div class="wrap">
        <div class="biblio__head">
          <h2 class="h-section" style="font-size:var(--step-2)" data-reveal>${BIBLIOGRAPHY.title}</h2>
          <span class="eyebrow" data-reveal>${BIBLIOGRAPHY.items.length} sources</span>
        </div>
        <div class="biblio__list">
          ${BIBLIOGRAPHY.items
            .map(
              (r, i) => `
            <div class="biblio__row" data-reveal>
              <span class="n">${String(i + 1).padStart(2, "0")}</span>
              <span class="t">${r.title}</span>
              <span class="k">${r.kind}</span>
            </div>`
            )
            .join("")}
        </div>
        <div class="colophon">
          <span class="mark">${BRAND.name} · ${BRAND.project.toUpperCase()}</span>
          <span>Energy from Everyday Activity — ${BRAND.org} · ${BRAND.year}</span>
        </div>
      </div>
    </section>`);

  app.append(hero, toc, problem, research, solutions, speedbreaker, gridFlow, footstep, analysis, challenges, conclusion, biblio);

  // wire count-up targets
  app.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
    countTargets.push({ el: n, to: parseFloat(n.dataset.count!), decimals: parseInt(n.dataset.dec || "0", 10) });
  });

  const slides: SlideMeta[] = [
    { id: "hero", name: "Title", notes: HERO.notes },
    { id: "toc", name: "Agenda", notes: ["Preview the six chapters — keep it to one line each.", "Tell them the whole talk is ~6 minutes and visual.", "Then move straight into the problem."] },
    { id: "problem", name: "The Problem", notes: PROBLEM.notes },
    { id: "research", name: "Research", notes: RESEARCH.notes },
    { id: "solutions", name: "Solutions", notes: SOLUTIONS.notes },
    { id: "dd-speedbreaker", name: "Speed Breaker", notes: SPEEDBREAKER.notes },
    { id: "grid-flow", name: "Road to Grid", notes: GRID_FLOW.notes },
    { id: "dd-footstep", name: "Footstep", notes: FOOTSTEP.notes },
    { id: "analysis", name: "Implementation", notes: ANALYSIS.notes },
    { id: "challenges", name: "Challenges", notes: CHALLENGES.notes },
    { id: "conclusion", name: "Conclusion", notes: CONCLUSION.notes },
    { id: "biblio", name: "Bibliography", notes: BIBLIOGRAPHY.notes },
  ];

  const chapters = [
    { id: "problem", label: "Problem", el: problem },
    { id: "research", label: "Research", el: research },
    { id: "solutions", label: "Solutions", el: solutions },
    { id: "analysis", label: "Implementation", el: analysis },
    { id: "challenges", label: "Challenges", el: challenges },
    { id: "conclusion", label: "Conclusion", el: conclusion },
  ];

  return {
    slides,
    chapters,
    stageEls: { speedbreaker: sbStage, footstep: fsStage },
    stepEls: { speedbreaker: sbSteps, footstep: fsSteps },
    wastage,
    countTargets,
  };
}
