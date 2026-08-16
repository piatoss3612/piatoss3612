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
const introFrames = 5;
const typingFrames = 32;
const payoffStartFrame = introFrames + typingFrames;
const payoffFrames = 6;
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

const PIXEL_FONT = {
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "00000", "00100"],
  ">": ["10000", "01000", "00100", "00010", "00100", "01000", "10000"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
};

const textScale = 3;
const textAdvance = 6 * textScale;

function visibleText(frameNumber) {
  if (frameNumber < introFrames) return "";

  const typed = clamp(
    Math.floor(
      ((frameNumber - introFrames + 1) / typingFrames) * typedText.length,
    ),
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
  if (first.length < line1.length) {
    return { x: 116 + first.length * textAdvance, y: 283 };
  }

  return { x: 116 + second.length * textAdvance, y: 313 };
}

function spriteForFrame(frameNumber) {
  if (frameNumber >= payoffStartFrame) return SPARKLE;
  if (frameNumber % 31 === 12) return BLINK;
  if (frameNumber < introFrames) {
    return [IDLE, TAIL_R][Math.floor(frameNumber / 3) % 2];
  }

  return [WORK_L, WORK_R, WORK_BOTH, WORK_R][
    Math.floor((frameNumber - introFrames) / 3) % 4
  ];
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

function renderPixelText(text, x, y, color) {
  const rects = [];

  for (let characterIndex = 0; characterIndex < text.length; characterIndex += 1) {
    const character = text[characterIndex];
    const glyph = PIXEL_FONT[character];
    if (!glyph) throw new Error(`Missing pixel-font glyph: ${character}`);

    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyph[row].length; col += 1) {
        if (glyph[row][col] !== "1") continue;
        rects.push(
          `<rect x="${x + characterIndex * textAdvance + col * textScale}" y="${y + row * textScale}" width="${textScale}" height="${textScale}" fill="${color}"/>`,
        );
      }
    }
  }

  return rects.join("\n");
}

function payoffOffset(frameNumber) {
  const payoffFrame = frameNumber - payoffStartFrame;
  if (payoffFrame < 0 || payoffFrame >= payoffFrames) return 0;
  return [0, -2, -4, -4, -2, 0][payoffFrame];
}

function svg(frameNumber) {
  const typed = visibleText(frameNumber);
  const [first, second] = textLines(typed);
  const cursor = cursorPosition(first, second);
  const cursorOn = frameNumber % 12 < 7;
  const sprite = spriteForFrame(frameNumber);
  const spriteX = 290;
  const spriteY = 70;
  const spriteScale = 7;
  const itemOffset = payoffOffset(frameNumber);
  const keplrY = 92 + itemOffset;
  const vizorY = 92 + itemOffset;
  const flameOuter = frameNumber % 14 < 7 ? "#ffcc44" : "#e8a050";
  const flameInner = frameNumber % 14 < 7 ? "#fffaf2" : "#ffcc44";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#0b0813"/>
  <rect x="28" y="28" width="664" height="324" rx="0" fill="#171126" stroke="#2e2145" stroke-width="4"/>
  <rect x="40" y="40" width="640" height="300" rx="0" fill="#211832" stroke="#1a1530" stroke-width="4"/>

  <g shape-rendering="crispEdges">
    <rect x="40" y="40" width="640" height="12" fill="#171126"/>
    <rect x="40" y="52" width="16" height="188" fill="#1a1328"/>
    <rect x="664" y="52" width="16" height="188" fill="#1a1328"/>
    ${[0, 1, 2, 6, 7, 8].map((i) => `<rect x="${52 + i * 72}" y="58" width="36" height="6" fill="${i % 2 ? "#281d3d" : "#2e2145"}"/>`).join("\n")}
    ${[0, 1, 6, 7].map((i) => `<rect x="${88 + i * 72}" y="82" width="36" height="6" fill="${i % 2 ? "#2e2145" : "#281d3d"}"/>`).join("\n")}
    ${[0, 1, 5, 6].map((i) => `<rect x="${64 + i * 86}" y="112" width="42" height="6" fill="${i % 2 ? "#251b38" : "#2b1f40"}"/>`).join("\n")}

    <rect x="294" y="52" width="132" height="8" fill="#2e2145"/>
    <rect x="286" y="60" width="148" height="8" fill="#2e2145"/>
    <rect x="278" y="68" width="164" height="8" fill="#2e2145"/>
    <rect x="270" y="76" width="180" height="128" fill="#2e2145"/>
    <rect x="302" y="60" width="116" height="8" fill="#171126"/>
    <rect x="294" y="68" width="132" height="8" fill="#171126"/>
    <rect x="286" y="76" width="148" height="8" fill="#171126"/>
    <rect x="278" y="84" width="164" height="120" fill="#171126"/>

    <rect x="84" y="60" width="40" height="8" fill="#2b1d32"/>
    <rect x="76" y="68" width="56" height="40" fill="#2b1d32"/>
    <rect x="84" y="108" width="40" height="8" fill="#2b1d32"/>
    <rect x="92" y="68" width="24" height="8" fill="#3a2231"/>
    <rect x="84" y="76" width="40" height="24" fill="#3a2231"/>
    <rect x="92" y="100" width="24" height="8" fill="#3a2231"/>
    <rect x="596" y="60" width="40" height="8" fill="#2b1d32"/>
    <rect x="588" y="68" width="56" height="40" fill="#2b1d32"/>
    <rect x="596" y="108" width="40" height="8" fill="#2b1d32"/>
    <rect x="604" y="68" width="24" height="8" fill="#3a2231"/>
    <rect x="596" y="76" width="40" height="24" fill="#3a2231"/>
    <rect x="604" y="100" width="24" height="8" fill="#3a2231"/>

    <rect x="136" y="82" width="142" height="108" fill="#18243b"/>
    <rect x="144" y="90" width="126" height="92" fill="#0f0b1a"/>
    <rect x="476" y="82" width="142" height="108" fill="#351827"/>
    <rect x="484" y="90" width="126" height="92" fill="#0f0b1a"/>

    <rect x="54" y="198" width="612" height="10" fill="#171126"/>
    <rect x="72" y="214" width="576" height="6" fill="#f0c888"/>
    <rect x="72" y="220" width="576" height="18" fill="#4b3048"/>
    <rect x="88" y="220" width="544" height="6" fill="#6a3f50"/>
    <rect x="72" y="238" width="576" height="10" fill="#1a1530"/>
    <rect x="338" y="220" width="100" height="8" fill="#171126"/>
    <rect x="92" y="90" width="24" height="34" fill="#3a2850"/>
    <rect x="98" y="102" width="12" height="46" fill="#40305a"/>
    <rect x="92" y="84" width="24" height="14" fill="${flameOuter}"/>
    <rect x="100" y="76" width="8" height="16" fill="${flameInner}"/>
    <rect x="604" y="90" width="24" height="34" fill="#3a2850"/>
    <rect x="610" y="102" width="12" height="46" fill="#40305a"/>
    <rect x="604" y="84" width="24" height="14" fill="${flameOuter}"/>
    <rect x="612" y="76" width="8" height="16" fill="${flameInner}"/>
    <rect x="148" y="94" width="118" height="86" fill="#171126" stroke="#1d4c72" stroke-width="4"/>
    <rect x="158" y="104" width="98" height="66" fill="#162033"/>
    <rect x="170" y="116" width="74" height="42" fill="#13364f"/>
    <rect x="184" y="126" width="46" height="22" fill="#1d4c72"/>
    <rect x="166" y="176" width="82" height="12" fill="#e8a050"/>
    <rect x="154" y="188" width="106" height="12" fill="#1a1530"/>
    <rect x="178" y="188" width="58" height="22" fill="#5a3d8a"/>
    <rect x="488" y="94" width="118" height="86" fill="#171126" stroke="#6f1f32" stroke-width="4"/>
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
  <rect x="80" y="270" width="560" height="72" rx="0" fill="#211832" stroke="#3a2850" stroke-width="4"/>
  <g shape-rendering="crispEdges">
    ${renderPixelText(">", 92, 283, "#ffcc44")}
    ${renderPixelText(first, 116, 283, "#fffaf2")}
    ${renderPixelText(second, 116, 313, "#fffaf2")}
    ${cursorOn ? `<rect x="${cursor.x + 3}" y="${cursor.y + 18}" width="12" height="3" fill="#fffaf2"/>` : ""}
  </g>
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
