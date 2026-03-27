const fs = require('fs');
const content = fs.readFileSync('public/uz.svg', 'utf8');
const rx = /<path d="([^"]+)" id="([^"]+)" name="([^"]+)">/g;
let match;
const res = [];
while (match = rx.exec(content)) {
  res.push({ d: match[1], id: match[2], name: match[3] });
}
const tsx = `// Auto-generated SVG Map of Uzbekistan
import React from 'react';

const REGIONS = ${JSON.stringify(res, null, 2)};

export function UzbekistanMap({ lang = 'uz' }: { lang?: 'uz' | 'ru' | 'en' }) {
  return (
    <div className="relative w-full h-full select-none">
      <svg
        viewBox="0 0 1000 652"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0px 10px 20px rgba(70, 1, 250, 0.3))' }}
      >
        <defs>
          <radialGradient id="uzb-fill" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="var(--color-primary-dim)" />
            <stop offset="100%" stopColor="var(--color-secondary-container)" />
          </radialGradient>
        </defs>

        <g className="uzb-regions">
          {REGIONS.map((region) => (
            <path
              key={region.id}
              d={region.d}
              id={region.id}
              fill="url(#uzb-fill)"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              className="transition-all duration-300 hover:fill-[var(--color-primary)] hover:stroke-white hover:stroke-2 hover:opacity-100 opacity-90 cursor-pointer"
            >
              <title>{region.name}</title>
            </path>
          ))}
        </g>
      </svg>
    </div>
  );
}
`;
fs.writeFileSync('src/components/ui/uzbekistan-map.tsx', tsx);
console.log('Map built successfully!');
