# IGNIS · Watt-Wise — Interactive 3D Presenter Guide

A premium, animated **presenter guide** built from the *IGNIS Watt-Wise 2026*
deck. It is a scroll-snapping slide deck (not a standalone read): on-screen copy
is deliberately minimal — big visuals, big numbers, real prototype photos and
live 3D — while the detail lives in a per-slide **presenter talk-track panel**.

Bright/light theme for visibility when projected in a dimly lit room.
Thermoelectric-generator (TEG) content has been removed from scope.

## Key interactions
- **Scroll-snap** slides (also `↑`/`↓` or `PageUp`/`PageDown`).
- **Presenter panel** (bottom-left): talking points per slide. `N` toggles it —
  hide it before projecting to an audience.
- Auto-playing 3D device scenes (speed breaker, footstep) loop while you narrate.
- Slide counter, chapter dots, and a top progress rail.

## Two systems (TEG removed)
1. Piezoelectric Speed Breaker  2. Footstep Energy Harvester

## Stack
- **Vite** + vanilla **TypeScript**
- **GSAP** + **ScrollTrigger** (pinning, scrubbed timelines)
- **Lenis** (smooth inertia scrolling)
- **Three.js** (ambient particle backdrop + two procedural device scenes)
- Native SVG/DOM charts (no chart library)

## Run
```bash
cd site
npm install      # already done
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

## Structure
```
src/
  main.ts              app bootstrap + all scroll wiring
  content.ts           single source of truth (copy + data from the deck)
  scroll.ts            Lenis + GSAP/ScrollTrigger setup
  style.css            design system (dark, energy palette)
  three/
    background.ts      fixed WebGL particle field (tints by chapter)
    stage.ts           reusable per-stage renderer (renders only when visible)
    speedbreaker.ts    procedural 5-step speed-breaker scene
    footstep.ts        procedural 4-step footstep-harvester scene
  charts/
    donut.ts           survey headline donut
    analysis.ts        output bars / cost levels / maintenance gauges
  sections/
    index.ts           builds all section DOM from content
    glyphs.ts          animated SVG icons for the solution cards
```

## Sections (deck → web)
1. Hero — "Energy from Everyday Activity"
2. Table of Contents
3. Ch.1 The Problem
4. Ch.2 Primary Research (survey donut + barrier)
5. Ch.3 Our Solutions (overview + two pinned 3D deep-dives)
6. Ch.4 Implementation Analysis (output / cost / maintenance charts)
7. Ch.5 Challenges & Solutions (flip cards)
8. Ch.6 Conclusion
9. Bibliography

## Notes
- `prefers-reduced-motion` is respected: smoothing, pinning and scrubbing are
  disabled and 3D scenes render a static final frame.
- The survey "biggest challenge" view is qualitative (Cost) because the deck
  published only the 66.6% headline figure and n=60 — no granular per-option
  percentages, so none were invented.
- The cost chart bars encode the deck's stated **cost level** (Medium / High /
  Medium–High); exact ₹ ranges are shown as text alongside.
```
