export type Rgb = { r: number; g: number; b: number };

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const RGBA_PATTERN =
  /^rgb\((\d{1,3}) (\d{1,3}) (\d{1,3}) \/ (0|1|0\.\d{1,2})\)$/;
const COLOR_LINE_PATTERN =
  /^--color-([a-z0-9]+(?:-[a-z0-9]+)*): (#[^;]*|rgb\([^;]*);$/;
const COLOR_RESET_LINE = '--color-*: initial;';

function assertRgb(color: Rgb): void {
  for (const channel of [color.r, color.g, color.b]) {
    if (!Number.isInteger(channel) || channel < 0 || channel > 255) {
      throw new Error(
        `Ogiltig färg ${JSON.stringify(color)}. R, G och B ska vara heltal mellan 0 och 255.`,
      );
    }
  }
}

export function parseHex(hex: string): Rgb {
  if (!HEX_PATTERN.test(hex)) {
    throw new Error(`Ogiltig hexfärg "${hex}". Formen ska vara #RRGGBB.`);
  }
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

export function parseRgba(value: string): Rgb & { a: number } {
  const match = RGBA_PATTERN.exec(value);
  if (match === null) {
    throw new Error(
      `Ogiltig rgb-färg "${value}". Formen ska vara rgb(R G B / A).`,
    );
  }
  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  if (r > 255 || g > 255 || b > 255) {
    throw new Error(
      `Ogiltig rgb-färg "${value}". R, G och B ska vara heltal mellan 0 och 255.`,
    );
  }
  return { r, g, b, a: Number(match[4]) };
}

export function composite(top: Rgb & { a: number }, bottom: Rgb): Rgb {
  assertRgb(top);
  if (!(top.a >= 0 && top.a <= 1)) {
    throw new Error(
      `Ogiltig alfa ${top.a}. A ska vara ett tal mellan 0 och 1.`,
    );
  }
  assertRgb(bottom);
  const mix = (topChannel: number, bottomChannel: number): number =>
    Math.round(topChannel * top.a + bottomChannel * (1 - top.a));
  return {
    r: mix(top.r, bottom.r),
    g: mix(top.g, bottom.g),
    b: mix(top.b, bottom.b),
  };
}

function linearize(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: Rgb): number {
  assertRgb(color);
  return (
    0.2126 * linearize(color.r) +
    0.7152 * linearize(color.g) +
    0.0722 * linearize(color.b)
  );
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const luminanceA = relativeLuminance(a);
  const luminanceB = relativeLuminance(b);
  return (
    (Math.max(luminanceA, luminanceB) + 0.05) /
    (Math.min(luminanceA, luminanceB) + 0.05)
  );
}

export function readColorTokens(cssText: string): Map<string, string> {
  const tokens = new Map<string, string>();
  let resetSeen = false;
  const lines = cssText.split('\n');
  for (let index = 0; index < lines.length; index++) {
    const n = index + 1;
    const line = lines[index].trim();
    if (!line.includes('--color-')) {
      continue;
    }
    if (line === COLOR_RESET_LINE) {
      if (resetSeen || tokens.size > 0) {
        throw new Error(
          `Raden "--color-*: initial;" på rad ${n} ska stå exakt en gång och före alla färgtokens.`,
        );
      }
      resetSeen = true;
      continue;
    }
    const match = COLOR_LINE_PATTERN.exec(line);
    if (match === null) {
      throw new Error(
        `Ogiltig färgrad ${n} i tokenfilen: "${line}". Formen ska vara --color-<namn>: #RRGGBB; eller --color-<namn>: rgb(R G B / A);`,
      );
    }
    const name = match[1];
    const value = match[2];
    if (value.startsWith('#')) {
      parseHex(value);
    } else {
      parseRgba(value);
    }
    if (tokens.has(name)) {
      throw new Error(`Färgtoken "${name}" finns redan; dubblett på rad ${n}.`);
    }
    tokens.set(name, value);
  }
  if (!resetSeen) {
    throw new Error('Tokenfilen saknar raden "--color-*: initial;".');
  }
  return tokens;
}
