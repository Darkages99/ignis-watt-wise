// Minimal animated SVG glyphs for the two solution cards (light theme).
import { ACCENTS } from "../content";

export function glyph(id: string): string {
  const a = ACCENTS;
  if (id === "speedbreaker") {
    return `<svg class="glyph" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 96 Q100 40 180 96" stroke="${a.blue}" stroke-width="3"/>
      <rect x="30" y="96" width="140" height="8" rx="3" fill="${a.blue}" opacity="0.14"/>
      ${[0, 1, 2, 3].map((i) => `<circle cx="${70 + i * 20}" cy="70" r="3.4" fill="${a.blue}"><animate attributeName="opacity" values="0.2;1;0.2" dur="1.6s" begin="${i * 0.2}s" repeatCount="indefinite"/></circle>`).join("")}
      <circle cx="100" cy="42" r="10" fill="none" stroke="${a.blue}" stroke-width="2" opacity="0.5"/>
    </svg>`;
  }
  // footstep
  return `<svg class="glyph" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="90" cy="60" rx="20" ry="30" fill="${a.green}" opacity="0.14"/>
    <ellipse cx="90" cy="60" rx="20" ry="30" fill="none" stroke="${a.green}" stroke-width="2"/>
    <circle cx="112" cy="40" r="6" fill="none" stroke="${a.green}" stroke-width="2"/>
    <circle cx="120" cy="52" r="5" fill="none" stroke="${a.green}" stroke-width="2"/>
    ${[0, 1, 2].map((i) => `<circle cx="90" cy="60" r="28" fill="none" stroke="${a.green}" stroke-width="1.5" opacity="0"><animate attributeName="r" values="24;60" dur="2s" begin="${i * 0.5}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0" dur="2s" begin="${i * 0.5}s" repeatCount="indefinite"/></circle>`).join("")}
  </svg>`;
}
