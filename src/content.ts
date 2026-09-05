// ---------------------------------------------------------------------------
// IGNIS · Watt-Wise — content model (single source of truth)
// This site is a PRESENTER GUIDE, not a standalone deck: on-screen copy is kept
// minimal (big visuals + numbers) and the detail lives in `presenterNotes`
// talk-tracks for whoever is presenting.
// Thermoelectric-generator (TEG) content has been removed per scope.
// All figures are taken from the source deck "IGNIS WATT WISE PPT 2026.pptx".
// ---------------------------------------------------------------------------

export const BRAND = {
  name: "IGNIS",
  project: "Watt-Wise",
  year: "2026",
  org: "Manthan Vidyashram",
  logo: "/img/logo.png",
};

export const HERO = {
  kicker: "IGNIS · Watt-Wise 2026",
  title: ["Energy from", "Everyday Activity"],
  sub: "Catching the power we throw away — on the road and underfoot.",
  scrollCue: "Scroll",
  notes: [
    "Open with the hook: every day we waste enormous amounts of energy just by moving around.",
    "This project captures two of the biggest everyday sources — vehicles on the road, and footsteps.",
    "Keep it short; the visuals carry the story from here.",
  ],
};

export type TocItem = { no: string; title: string; anchor: string };

export const TOC: TocItem[] = [
  { no: "01", title: "The Problem", anchor: "problem" },
  { no: "02", title: "Primary Research", anchor: "research" },
  { no: "03", title: "Our Solutions", anchor: "solutions" },
  { no: "04", title: "Implementation", anchor: "analysis" },
  { no: "05", title: "Challenges & Fixes", anchor: "challenges" },
  { no: "06", title: "Conclusion", anchor: "conclusion" },
];

// ---- Chapter 01 · The Problem -------------------------------------------
// Data from the deck's "Estimated Annual Energy Wastage (India)" chart.
// Kitchen-heat (a thermal / TEG source) is intentionally omitted.
export const PROBLEM = {
  chapter: "01",
  title: "The Problem",
  headline: "We waste staggering amounts of energy — just by moving.",
  unit: "kWh wasted per year (India)",
  data: [
    { label: "Rainfall", value: 1.3e13, display: "1.3 ×10¹³", accent: "blue" },
    { label: "Vehicle Braking", value: 2.0e10, display: "2.0 ×10¹⁰", accent: "green" },
    { label: "Speed Breakers", value: 5.0e9, display: "5.0 ×10⁹", accent: "amber", highlight: true },
    { label: "Door Movement", value: 4.0e8, display: "4.0 ×10⁸", accent: "violet" },
    { label: "Footsteps", value: 5.0e7, display: "5.0 ×10⁷", accent: "green", highlight: true },
  ],
  notes: [
    "This is annual wasted energy in India, on a log scale — each gridline is 100× the one below.",
    "Highlight the two we target: Speed Breakers (5.0 ×10⁹ kWh) and Footsteps (5.0 ×10⁷ kWh).",
    "The point isn't that these are the biggest — it's that they're constant, distributed, and completely unrecovered today.",
  ],
};

// ---- Chapter 02 · Primary Research --------------------------------------
export const RESEARCH = {
  chapter: "02",
  title: "Primary Research",
  sampleSize: 60,
  stat: { value: 66.6, unit: "%" },
  statLabel: "chose vehicle & footstep energy as the top recovery opportunity",
  barrier: "Cost",
  barrierNote: "Perceived up-front cost — not the technology — is what holds adoption back.",
  notes: [
    "We surveyed 60 people to test demand and find the real barrier.",
    "Two-thirds — 66.6% — picked vehicle and footstep energy as the top opportunity. That's why those are our two systems.",
    "The one barrier that came back loudest was cost. Park that — we answer it directly in the conclusion.",
  ],
};

// ---- Chapter 03 · Our Solutions -----------------------------------------
export const SOLUTIONS = {
  chapter: "03",
  title: "Two Systems, One Strategy",
  systems: [
    {
      id: "speedbreaker",
      no: "01",
      name: "Piezoelectric Speed Breaker",
      mechanism: "Vehicle weight compresses PZT discs",
      output: "DC electricity",
      accent: "blue",
    },
    {
      id: "footstep",
      no: "02",
      name: "Footstep Harvester",
      mechanism: "Foot pressure on piezo tiles",
      output: "Sensor & lighting power",
      accent: "green",
    },
  ],
  notes: [
    "Both systems use the same physics: piezoelectric crystals turn pressure into charge.",
    "System 1 sits under the road; System 2 sits under the floor.",
    "Next two slides walk through exactly how each one works — let the animation run while you narrate.",
  ],
};

export type Step = { no: string; title: string; body: string };

export const SPEEDBREAKER = {
  eyebrow: "System 01",
  title: "Piezoelectric Speed Breaker",
  accent: "blue",
  photo: "/img/speedbreaker.jpg",
  photoCaption: "Working prototype — vehicle load lights the LED array",
  steps: [
    { no: "1", title: "Vehicle rolls over", body: "Weight presses the platform." },
    { no: "2", title: "Discs compress", body: "PZT crystals deform, releasing charge." },
    { no: "3", title: "AC generated", body: "Charge arrives as alternating current." },
    { no: "4", title: "Rectified to DC", body: "A bridge rectifier makes it usable." },
    { no: "5", title: "Stored & used", body: "Powers LEDs, USB & IoT — grid-free." },
  ] as Step[],
  notes: [
    "Walk the five steps as the animation loops: roll-over → compress → AC → rectify → store.",
    "Key selling point: no moving parts are exposed to traffic, so it's low-maintenance on the road.",
    "The photo is our actual prototype — vehicle load is enough to light the whole LED strip.",
  ],
};

export const FOOTSTEP = {
  eyebrow: "System 02",
  title: "Footstep Energy Harvester",
  accent: "green",
  photo: "/img/footstep.jpg",
  photoCaption: "Working prototype — steps counted and voltage logged live",
  steps: [
    { no: "1", title: "Footstep lands", body: "Pressure hits the tile." },
    { no: "2", title: "Layers compress", body: "Stacked piezo discs deform." },
    { no: "3", title: "Charge conditioned", body: "Rectified and smoothed." },
    { no: "4", title: "Load powered", body: "Runs sensors and lighting." },
  ] as Step[],
  notes: [
    "Same physics, floor-mounted. Best in high-footfall places — stations, malls, corridors.",
    "The prototype uses an Arduino to count steps and log the voltage live on the LCD.",
    "Per step it's small; the win is volume — thousands of steps a day add up.",
  ],
};

// ---- Chapter 04 · Implementation ----------------------------------------
export const ANALYSIS = {
  chapter: "04",
  title: "Implementation",
  output: {
    title: "Monthly output",
    unit: "kWh / month",
    data: [
      { id: "speedbreaker", label: "Speed Breaker", value: 0.5, accent: "blue" },
      { id: "footstep", label: "Footstep (per tile)", value: 3.5, accent: "green", highlight: true },
    ],
  },
  cost: [
    { id: "speedbreaker", label: "Speed Breaker", range: "₹1–3 lakh", level: "Medium", accent: "blue" },
    { id: "footstep", label: "Footstep Harvester", range: "₹12k–35k / tile", level: "Modular", accent: "green" },
  ],
  maintenance: [
    { id: "speedbreaker", label: "Speed Breaker", level: "Medium–High", note: "Heavy vehicle load", accent: "blue" },
    { id: "footstep", label: "Footstep Harvester", level: "Medium", note: "Load spread across many tiles", accent: "green" },
  ],
  notes: [
    "Headline number: a single footstep tile makes 3.5 kWh/month — seven times a speed breaker's 0.5.",
    "Cost: speed breaker is one civil job; footstep scales tile-by-tile, so you start small and grow.",
    "Maintenance is manageable — footsteps spread the load across many elements, lowering failure risk.",
  ],
};

// ---- Chapter 05 · Challenges & Fixes ------------------------------------
export type Challenge = {
  id: string;
  system: string;
  accent: string;
  problem: string;
  fix: string;
};

export const CHALLENGES = {
  chapter: "05",
  title: "Challenges & Fixes",
  items: [
    {
      id: "speedbreaker",
      system: "Speed Breaker",
      accent: "blue",
      problem: "PZT discs crack under repeated vehicle load.",
      fix: "PVDF polymer films + shock-absorbing mounts.",
    },
    {
      id: "footstep",
      system: "Footstep Harvester",
      accent: "green",
      problem: "Each step yields only milliwatts.",
      fix: "Multi-layer stacking + high-footfall placement.",
    },
  ] as Challenge[],
  notes: [
    "Every honest project has hard problems — here are ours and how we solve them.",
    "Speed breaker: durability. We swap brittle ceramic for flexible PVDF film and cushion the mounts.",
    "Footstep: low per-step output. We stack layers and place tiles only where footfall is heavy.",
  ],
};

// ---- Chapter 06 · Conclusion --------------------------------------------
export const CONCLUSION = {
  chapter: "06",
  title: "Waste Nothing. Power Everything.",
  points: [
    { title: "The problem is real", body: "Energy is wasted on every road and floor, every day." },
    { title: "The solutions are proven", body: "Piezoelectric systems turn that waste into electricity." },
    { title: "Demand exists", body: "66.6% want exactly this." },
    { title: "The barrier is perception", body: "Our prototypes are affordable and scalable. Cost is not the wall." },
  ],
  closer: "The next step is a real-world pilot.",
  notes: [
    "Land the four beats: real problem, proven fix, real demand, and the only barrier is perception.",
    "Directly answer the cost objection from the survey — our builds are cheap and modular.",
    "Close with the ask: fund a real-world pilot. End on the tagline.",
  ],
};

// ---- Bibliography (TEG sources removed) ---------------------------------
export type Reference = { title: string; kind: string };

export const BIBLIOGRAPHY: { title: string; items: Reference[]; notes: string[] } = {
  title: "Bibliography",
  items: [
    { title: "Piezoelectric Energy Generation in India — Energy, Cost & Footstep Data", kind: "Research Paper" },
    { title: "Piezoelectric Floor Tile — Experimental Output & Performance", kind: "Research Paper" },
    { title: "Review of Piezoelectric Energy-Harvesting Tiles", kind: "Research Paper" },
    { title: "Piezoelectric Energy Harvesting from Pavements", kind: "Research Paper" },
    { title: "Speed-Breaker Kinetic Energy Harvesting — Modeling & Generation", kind: "Research Article" },
    { title: "Commercial Footstep Energy Harvesting Technology", kind: "Pavegen" },
    { title: "Acoustic / Sound Energy Harvesting — Principles & Challenges", kind: "Review Paper" },
    { title: "Primary Survey — 60 Respondents", kind: "Project team (n = 60)" },
  ],
  notes: [
    "These back every claim in the talk — offer to share the full list afterwards.",
    "The primary survey (n = 60) is our own data; everything else is peer-reviewed or commercial.",
  ],
};

// Accent tokens (light theme) — shared by DOM, charts and 3D.
export const ACCENTS: Record<string, string> = {
  blue: "#0a84ff",
  green: "#12b886",
  amber: "#f59f00",
  violet: "#6741d9",
  ink: "#0c1320",
};
