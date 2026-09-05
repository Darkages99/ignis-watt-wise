// Minimal animated SVG glyphs for the two solution cards (light theme).
import { ACCENTS } from "../content";

const SHOE_PATH =
  "M90 22 C108 22 112 46 108 60 C105 74 100 80 96 96 C94 99 86 99 84 96 " +
  "C80 80 75 74 72 60 C68 46 72 22 90 22 Z";

export function glyph(id: string): string {
  const a = ACCENTS;
  if (id === "speedbreaker") {
    const flat = "M20 96 Q100 40 180 96";
    const pressed = "M20 96 Q100 63 180 96";
    return `<svg class="glyph" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="96" width="140" height="8" rx="3" fill="${a.blue}" opacity="0.14"/>
      <path d="${flat}" stroke="${a.blue}" stroke-width="3">
        <animate attributeName="d" values="${flat};${pressed};${flat}" keyTimes="0;0.4;1" dur="1.8s" repeatCount="indefinite"/>
      </path>
      <!-- wheel rolling in and pressing the bump -->
      <circle cx="100" cy="42" r="10" fill="none" stroke="${a.blue}" stroke-width="2" opacity="0.7">
        <animate attributeName="cy" values="42;65;42" keyTimes="0;0.4;1" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <!-- energy dispersing outward from the contact point on compression -->
      ${[0, 1, 2]
        .map(
          (i) => `
      <circle cx="100" cy="63" r="4" fill="none" stroke="${a.blue}" stroke-width="1.5" opacity="0">
        <animate attributeName="r" values="4;36" dur="1.8s" begin="${0.7 + i * 0.18}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.65;0" dur="1.8s" begin="${0.7 + i * 0.18}s" repeatCount="indefinite"/>
      </circle>`
        )
        .join("")}
    </svg>`;
  }
  // footstep — stylised shoe-sole print
  return `<svg class="glyph" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="${SHOE_PATH}" fill="${a.green}" opacity="0.16"/>
    <path d="${SHOE_PATH}" fill="none" stroke="${a.green}" stroke-width="2"/>
    <path d="M76 46 Q90 52 104 46" stroke="${a.green}" stroke-width="1.5" opacity="0.6"/>
    <path d="M82 76 Q90 72 98 76" stroke="${a.green}" stroke-width="1.5" opacity="0.6"/>
    ${[0, 1, 2].map((i) => `<circle cx="90" cy="59" r="28" fill="none" stroke="${a.green}" stroke-width="1.5" opacity="0"><animate attributeName="r" values="24;60" dur="2s" begin="${i * 0.5}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0" dur="2s" begin="${i * 0.5}s" repeatCount="indefinite"/></circle>`).join("")}
  </svg>`;
}
