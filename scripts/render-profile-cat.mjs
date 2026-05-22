#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const frameDir = join(root, ".tmp-profile-cat-frames");
const out = join(root, "assets", "profile-cat.gif");

const width = 720;
const height = 380;
const frames = 72;
const delay = 7;
const line1 = "IT IS DANGEROUS TO GO ALONE.";
const line2 = "TAKE ONE OR... BOTH!";
const typedText = `${line1}\n${line2}`;

const palette = {
  "1": "#1a1530",
  "2": "#e8a050",
  "3": "#f0c888",
  "4": "#e8e8ff",
  "5": "#1a1a2e",
  "6": "#ff7088",
  "7": "#5a3d8a",
  "8": "#7a5aaa",
  "9": "#ff9898",
  a: "#c47830",
  b: "#40305a",
  c: "#ffaaaa",
  d: "#ffcc44",
  e: "#4488ff",
  f: "#3a2850",
  g: "#5bc8f2",
  h: "#ffffff",
  i: "#0fa9dc",
  j: "#d7d9dd",
  k: "#8d929a",
  l: "#3c404a",
  m: "#11131a",
  n: "#f7f7f2",
  o: "#a8384c",
  p: "#ba4f62",
  q: "#6f1f32",
  r: "#ff7688",
  s: "#f3f4f6",
  t: "#c5c8cf",
  u: "#242630",
  v: "#13b9f7",
  w: "#1d4c72",
  x: "#80d2f2",
  y: "#e5f6fc",
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const wave = (frame, phase = 0, scale = 1) =>
  Math.sin(((frame + phase) / frames) * Math.PI * 2) * scale;

function frame(rows) {
  if (rows.length !== 20 || rows.some((row) => row.length !== 20)) {
    throw new Error("Wanrochi sprite frames must be 20x20.");
  }
  return rows;
}

const IDLE = frame([
  "00000011000001100000",
  "00000122100012210000",
  "00001292210129221000",
  "00012222221222222100",
  "00122222222222222210",
  "00122442233224422210",
  "00122542233245222210",
  "0012c222332222c22210",
  "00012222363622221000",
  "00000123333333321000",
  "00000111111111110000",
  "00001778877887710000",
  "00017777777777771000",
  "00017777777777771000",
  "00127777777777772100",
  "00127777777777772100",
  "00017777777777771000",
  "0000117777777711b000",
  "00000121000012100000",
  "00000111000011100000",
]);

const BLINK = frame([
  "00000011000001100000",
  "00000122100012210000",
  "00001292210129221000",
  "00012222221222222100",
  "00122222222222222210",
  "00122112233211222210",
  "00122222233222222210",
  "0012c222332222c22210",
  "00012222363622221000",
  "00000123333333321000",
  "00000111111111110000",
  "00001778877887710000",
  "00017777777777771000",
  "00017777777777771000",
  "00127777777777772100",
  "00127777777777772100",
  "00017777777777771000",
  "0000117777777711b000",
  "00000121000012100000",
  "00000111000011100000",
]);

const TAIL_R = frame([...IDLE.slice(0, 19), "00000111000011100120"]);
const TAIL_L = frame([...IDLE.slice(0, 19), "01200111000011100000"]);

const WORK_L = frame([
  "00000011000001100000",
  "00000122100012210000",
  "00001292210129221000",
  "00012222221222222100",
  "00122222222222222210",
  "00122552233225522210",
  "00122552233255222210",
  "00122222332222222210",
  "00012222333322221000",
  "00000123333333321000",
  "00000111111111110000",
  "00001778877887710000",
  "00017777777777771000",
  "00017777777777771000",
  "01277777777777777210",
  "00127777777777772100",
  "00017777777777771000",
  "0000117777777711b000",
  "00000121000012100000",
  "00000111000011100000",
]);

const WORK_R = frame([
  ...WORK_L.slice(0, 14),
  "00127777777777772100",
  "01277777777777777210",
  ...WORK_L.slice(16),
]);

const WORK_BOTH = frame([
  ...WORK_L.slice(0, 14),
  "01277777777777777210",
  "01277777777777777210",
  ...WORK_L.slice(16),
]);

const SPARKLE = frame([
  "0d000011000001100d00",
  "00000122100012210000",
  "00001292210129221000",
  "00012222221222222100",
  "00122222222222222210",
  "00122442233224422210",
  "00122542233245222210",
  "0012c222332222c22210",
  "00012222363622221000",
  "00001233363333210000",
  "00000111111111110000",
  "00001778877887710000",
  "00017777777777771000",
  "00017777777777771000",
  "01277777777777777210",
  "00127777777777772100",
  "00017777777777771000",
  "0000117777777711b000",
  "00000121000012100000",
  "000001110d0011100000",
]);

const KEPLR_ICON = [
  "000vvvvvvvvvvvvvv000",
  "00vvvvvvvvvvvvvvvv00",
  "0vvvggxxyyyyxxggvvv0",
  "vvvgyhhhhhhyyyhygvvv",
  "vvgyhhhhyxggvgxhygvv",
  "vvghhhhxgvvvvvvxhgvv",
  "vvxhhhxgvggvvvvgyxvv",
  "vvxhhxvvvxxvvvvvyxvv",
  "vvyhygvvgyygvvvgyyvv",
  "vvyhxvxxyhhyxxvghyvv",
  "vvyhgvxxyhhyxxvxhyvv",
  "vvyygvvvgyygvvgyhyvv",
  "vvxyvvvvvxxvvgxhhxvv",
  "vvxygvvvvggvgxhhhxvv",
  "vvghxvvvvvvgxhhhhgvv",
  "vvgyhxgvggxyhhhhygvv",
  "vvvgyhyyyhhhhhhygvvv",
  "0vvvggxxyyyyxxggvvv0",
  "00vvvvvvvvvvvvvvvv00",
  "000vvvvvvvvvvvvvv000",
];

const VIZOR_ICON = [
  "oooooooooooooooo",
  "oooooooooooooooo",
  "oooooooolloooooo",
  "ooooooklluuloooo",
  "ooooooljjkkljooo",
  "oooookjtlktlkooo",
  "oooooljlljklkooo",
  "oooolkkuljlulooo",
  "pppplkkulkuupppp",
  "pppppljuukkkpppp",
  "pppppkjuukjlkppp",
  "ppppppplkkkkpppp",
  "pppppppjjkpppppp",
  "pppppppkpppppppp",
  "pppppppppppppppp",
  "pppppppppppppppp",
];

function visibleText(frameNumber) {
  const hold = 18;
  const typingFrames = frames - hold;
  const typed = clamp(
    Math.floor((frameNumber / typingFrames) * (typedText.length + 3)),
    0,
    typedText.length,
  );
  return typedText.slice(0, typed);
}

function textLines(text) {
  const [first = "", second = ""] = text.split("\n");
  return [first, second];
}

function cursorPosition(first, second) {
  const charWidth = 10.6;
  if (first.length < line1.length) {
    return { x: 116 + first.length * charWidth, y: 304 };
  }

  return { x: 116 + second.length * charWidth, y: 329 };
}

function spriteForFrame(frameNumber) {
  if (frameNumber > frames - 9) return SPARKLE;
  if (frameNumber % 31 === 12) return BLINK;
  if (frameNumber < 17) return [IDLE, TAIL_R, IDLE, TAIL_L][Math.floor(frameNumber / 4) % 4];
  return [WORK_L, WORK_R, WORK_BOTH, WORK_R][frameNumber % 4];
}

function renderSprite(sprite, x, y, scale) {
  const rects = [];
  for (let row = 0; row < sprite.length; row += 1) {
    for (let col = 0; col < sprite[row].length; col += 1) {
      const color = palette[sprite[row][col]];
      if (!color) continue;
      rects.push(
        `<rect x="${x + col * scale}" y="${y + row * scale}" width="${scale}" height="${scale}" fill="${color}"/>`,
      );
    }
  }
  return rects.join("\n");
}

function svg(frameNumber) {
  const typed = visibleText(frameNumber);
  const [first, second] = textLines(typed);
  const cursor = cursorPosition(first, second);
  const cursorOn = frameNumber % 12 < 7;
  const bob = wave(frameNumber, 0, 4);
  const sprite = spriteForFrame(frameNumber);
  const spriteX = 290;
  const spriteY = 70 + bob;
  const spriteScale = 7;
  const itemBob = wave(frameNumber, 11, 1.25);
  const keplrY = 92 - itemBob;
  const vizorY = 92 + itemBob;
  const flameOuter = frameNumber % 14 < 7 ? "#ffcc44" : "#e8a050";
  const flameInner = frameNumber % 14 < 7 ? "#fffaf2" : "#ffcc44";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#0f0b1a"/>
  <rect x="28" y="28" width="664" height="324" rx="0" fill="#171126" stroke="#ffcc44" stroke-width="4"/>
  <rect x="40" y="40" width="640" height="300" rx="0" fill="#211832" stroke="#1a1530" stroke-width="4"/>

  <g shape-rendering="crispEdges">
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${52 + i * 72}" y="54" width="36" height="8" fill="${i % 2 ? "#2e2145" : "#3a2850"}"/>`).join("\n")}
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${88 + i * 72}" y="74" width="36" height="8" fill="${i % 2 ? "#3a2850" : "#2e2145"}"/>`).join("\n")}
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${64 + i * 86}" y="102" width="42" height="8" fill="${i % 2 ? "#241a38" : "#35254c"}"/>`).join("\n")}
    <rect x="54" y="194" width="612" height="14" fill="#171126"/>
    <rect x="72" y="214" width="576" height="10" fill="#ffcc44"/>
    <rect x="72" y="224" width="576" height="14" fill="#5a3d8a"/>
    <rect x="72" y="238" width="576" height="10" fill="#1a1530"/>
    <rect x="92" y="90" width="24" height="34" fill="#3a2850"/>
    <rect x="98" y="102" width="12" height="46" fill="#40305a"/>
    <rect x="92" y="84" width="24" height="14" fill="${flameOuter}"/>
    <rect x="100" y="76" width="8" height="16" fill="${flameInner}"/>
    <rect x="604" y="90" width="24" height="34" fill="#3a2850"/>
    <rect x="610" y="102" width="12" height="46" fill="#40305a"/>
    <rect x="604" y="84" width="24" height="14" fill="${flameOuter}"/>
    <rect x="612" y="76" width="8" height="16" fill="${flameInner}"/>
    <rect x="144" y="90" width="126" height="92" fill="#0f0b1a"/>
    <rect x="148" y="94" width="118" height="86" fill="#171126" stroke="#ffcc44" stroke-width="4"/>
    <rect x="158" y="104" width="98" height="66" fill="#162033"/>
    <rect x="170" y="116" width="74" height="42" fill="#13364f"/>
    <rect x="184" y="126" width="46" height="22" fill="#1d4c72"/>
    <rect x="166" y="176" width="82" height="12" fill="#e8a050"/>
    <rect x="154" y="188" width="106" height="12" fill="#1a1530"/>
    <rect x="178" y="188" width="58" height="22" fill="#5a3d8a"/>
    <rect x="484" y="90" width="126" height="92" fill="#0f0b1a"/>
    <rect x="488" y="94" width="118" height="86" fill="#171126" stroke="#ffcc44" stroke-width="4"/>
    <rect x="498" y="104" width="98" height="66" fill="#3a1324"/>
    <rect x="506" y="112" width="82" height="50" fill="#6f1f32"/>
    <rect x="514" y="120" width="66" height="34" fill="#a8384c"/>
    <rect x="506" y="176" width="82" height="12" fill="#e8a050"/>
    <rect x="494" y="188" width="106" height="12" fill="#1a1530"/>
    <rect x="518" y="188" width="58" height="22" fill="#5a3d8a"/>
    <rect x="342" y="216" width="92" height="8" fill="#1a1530"/>
  </g>

  <g shape-rendering="crispEdges">
    <rect x="186" y="104" width="42" height="4" fill="#fffaf2"/>
    <rect x="204" y="108" width="6" height="10" fill="#fffaf2"/>
    <rect x="526" y="104" width="42" height="4" fill="#fffaf2"/>
    <rect x="544" y="108" width="6" height="10" fill="#fffaf2"/>
${renderSprite(KEPLR_ICON, 167, keplrY, 4)}
${renderSprite(VIZOR_ICON, 502, vizorY, 5)}
  </g>

  <g shape-rendering="crispEdges">
${renderSprite(sprite, spriteX, spriteY, spriteScale)}
  </g>

  <rect x="74" y="264" width="572" height="84" rx="0" fill="#0f0b1a"/>
  <rect x="80" y="270" width="560" height="72" rx="0" fill="#211832" stroke="#ffcc44" stroke-width="4"/>
  <text x="98" y="304" fill="#ffcc44" font-size="18" font-family="Menlo, Monaco, Consolas, monospace" font-weight="700">&gt;</text>
  <text x="116" y="304" fill="#fffaf2" font-size="17" font-family="Menlo, Monaco, Consolas, monospace" font-weight="700">${first}</text>
  <text x="116" y="329" fill="#fffaf2" font-size="17" font-family="Menlo, Monaco, Consolas, monospace" font-weight="700">${second}</text>
  ${cursorOn ? `<rect x="${cursor.x.toFixed(1)}" y="${cursor.y - 17}" width="9" height="20" fill="#fffaf2"/>` : ""}
</svg>`;
}

rmSync(frameDir, { recursive: true, force: true });
mkdirSync(frameDir, { recursive: true });
mkdirSync(join(root, "assets"), { recursive: true });

for (let frameNumber = 0; frameNumber < frames; frameNumber += 1) {
  writeFileSync(
    join(frameDir, `frame-${String(frameNumber).padStart(3, "0")}.svg`),
    svg(frameNumber),
  );
}

const framePaths = readdirSync(frameDir)
  .filter((name) => name.endsWith(".svg"))
  .sort()
  .map((name) => join(frameDir, name));

execFileSync(
  "magick",
  ["-delay", String(delay), "-loop", "0", ...framePaths, "-layers", "Optimize", out],
  { stdio: "inherit" },
);

if (!process.env.KEEP_PROFILE_CAT_FRAMES) {
  rmSync(frameDir, { recursive: true, force: true });
}

console.log(`Wrote ${out}`);
