// @vitest-environment node
//
// Logotypens färger (ARKITEKTUR 4.5): varje hex-värde i public/favicon.svg
// finns bland färgtokens i tokens.css, och Logo.tsx innehåller ingen hex-färg.
// Hex jämförs som parseHex-värden, eftersom tokens.css skriver hex med gemener.
//
// Det spärren inte fångar: färger i andra former än hex (rgb(), hsl(),
// färgnamn som fill="red", currentColor); hex som byggs ihop av delar vid
// körning. Den fångar för mycket i ett fall: ett ankare som bara består av
// hex-tecken (t.ex. href="#add") räknas också som en hex-färg.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseHex, readColorTokens } from './support/contrast';

const HEX_COLOR = /#[0-9a-f]{3,8}\b/gi;

function findHexColors(text: string): string[] {
  return text.match(HEX_COLOR) ?? [];
}

const read = (path: string): string =>
  readFileSync(new URL(path, import.meta.url), 'utf8');

describe('findHexColors', () => {
  it.each([
    ['#abc', ['#abc']],
    ['#ABC', ['#ABC']],
    ['#1b2a41', ['#1b2a41']],
    ['#1B2A41', ['#1B2A41']],
    ['#1b2a41cc', ['#1b2a41cc']],
    ['fill="#c9d2de" stroke="#E38B5C"', ['#c9d2de', '#E38B5C']],
  ])('finds the hex colour in %s', (text, expected) => {
    expect(findHexColors(text)).toEqual(expected);
  });

  it.each([
    'className="fill-primary-900"',
    'fill="rgb(27 42 65)"',
    'fill="red"',
    '',
  ])('finds no hex colour in %s', (text) => {
    expect(findHexColors(text)).toEqual([]);
  });
});

describe('logo colours', () => {
  it('favicon.svg uses only hex values that are colour tokens in tokens.css', () => {
    const tokenValues = [
      ...readColorTokens(read('../src/styles/tokens.css')).values(),
    ]
      .filter((value) => value.startsWith('#'))
      .map((value) => JSON.stringify(parseHex(value)));
    const faviconHex = findHexColors(read('../public/favicon.svg'));

    expect(faviconHex.length).toBeGreaterThan(0);
    for (const hex of faviconHex) {
      expect(tokenValues, `${hex} in favicon.svg`).toContain(
        JSON.stringify(parseHex(hex)),
      );
    }
  });

  it('Logo.tsx contains no hex colour', () => {
    expect(findHexColors(read('../src/components/brand/Logo.tsx'))).toEqual([]);
  });
});
