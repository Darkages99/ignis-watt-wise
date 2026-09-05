// Minimal animated SVG glyphs for the two solution cards (light theme).
import { ACCENTS } from "../content";

// A real shoe print lands as two separate pads — the forefoot and the heel —
// with the arch lifted clear in between.
const SHOE_FOREFOOT =
  "M88 12 C100 12 108 20 109 32 C110 44 107 58 104 70 C102 76 94 78 88 78 " +
  "C82 78 75 76 73 70 C70 58 67 44 68 32 C69 20 76 12 88 12 Z";
const SHOE_HEEL =
  "M88 86 C97 86 103 93 103 103 C103 114 96 124 88 124 " +
  "C80 124 73 114 73 103 C73 93 79 86 88 86 Z";

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
  // footstep — shoe print: forefoot pad + heel pad, with tread bars
  return `<svg class="glyph" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="ig-sole-clip">
        <path d="${SHOE_FOREFOOT}"/>
        <path d="${SHOE_HEEL}"/>
      </clipPath>
    </defs>
    <g transform="rotate(-7 88 68)">
      <path d="${SHOE_FOREFOOT}" fill="${a.green}" opacity="0.18"/>
      <path d="${SHOE_FOREFOOT}" fill="none" stroke="${a.green}" stroke-width="2"/>
      <path d="${SHOE_HEEL}" fill="${a.green}" opacity="0.18"/>
      <path d="${SHOE_HEEL}" fill="none" stroke="${a.green}" stroke-width="2"/>
      <g clip-path="url(#ig-sole-clip)" stroke="${a.green}" stroke-width="1.6" opacity="0.5">
        <path d="M60 25 Q88 32 116 25"/>
        <path d="M58 40 Q88 48 118 40"/>
        <path d="M60 55 Q88 62 116 55"/>
        <path d="M62 67 Q88 73 114 67"/>
        <path d="M64 99 Q88 106 112 99"/>
      </g>
    </g>
    ${[0, 1, 2].map((i) => `<circle cx="88" cy="68" r="28" fill="none" stroke="${a.green}" stroke-width="1.5" opacity="0"><animate attributeName="r" values="26;62" dur="2s" begin="${i * 0.5}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0" dur="2s" begin="${i * 0.5}s" repeatCount="indefinite"/></circle>`).join("")}
  </svg>`;
}
