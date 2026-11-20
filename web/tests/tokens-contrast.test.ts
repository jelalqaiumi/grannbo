// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  composite,
  contrastRatio,
  parseHex,
  parseRgba,
  readColorTokens,
  type Rgb,
} from './support/contrast';

type Pair = {
  id: string;
  foreground: string;
  background: string;
  // true: bakgrunden är token-värdet komponerat över #FFFFFF (T18, N5)
  backgroundOverWhite: boolean;
  limit: number;
};

const TEXT_PAIRS: Pair[] = [
  {
    id: 'T1',
    foreground: 'primary-900',
    background: 'neutral-50',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T2',
    foreground: 'primary-900',
    background: 'white',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T3',
    foreground: 'neutral-600',
    background: 'neutral-50',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T4',
    foreground: 'neutral-600',
    background: 'white',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T5',
    foreground: 'white',
    background: 'primary-900',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T6',
    foreground: 'white',
    background: 'primary-800',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T7',
    foreground: 'primary-900',
    background: 'accent-500',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T8',
    foreground: 'accent-700',
    background: 'neutral-50',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T9',
    foreground: 'accent-700',
    background: 'white',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T10',
    foreground: 'accent-700',
    background: 'accent-100',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T11',
    foreground: 'primary-900',
    background: 'primary-100',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T12',
    foreground: 'neutral-300',
    background: 'primary-900',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T13',
    foreground: 'danger-700',
    background: 'neutral-50',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T14',
    foreground: 'danger-700',
    background: 'white',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T15',
    foreground: 'danger-700',
    background: 'danger-100',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T16',
    foreground: 'success-700',
    background: 'success-100',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T17',
    foreground: 'primary-900',
    background: 'white',
    backgroundOverWhite: false,
    limit: 4.5,
  },
  {
    id: 'T18',
    foreground: 'white',
    background: 'overlay',
    backgroundOverWhite: true,
    limit: 4.5,
  },
  {
    id: 'T19',
    foreground: 'accent-500',
    background: 'primary-900',
    backgroundOverWhite: false,
    limit: 4.5,
  },
];

const NON_TEXT_PAIRS: Pair[] = [
  {
    id: 'N1',
    foreground: 'neutral-500',
    background: 'white',
    backgroundOverWhite: false,
    limit: 3,
  },
  {
    id: 'N2',
    foreground: 'neutral-500',
    background: 'neutral-50',
    backgroundOverWhite: false,
    limit: 3,
  },
  {
    id: 'N3',
    foreground: 'primary-900',
    background: 'neutral-50',
    backgroundOverWhite: false,
    limit: 3,
  },
  {
    id: 'N4',
    foreground: 'accent-500',
    background: 'primary-900',
    backgroundOverWhite: false,
    limit: 3,
  },
  {
    id: 'N5',
    foreground: 'white',
    background: 'overlay',
    backgroundOverWhite: true,
    limit: 3,
  },
];

const FAILING_PAIRS: Pair[] = [
  {
    id: 'X1',
    foreground: 'accent-500',
    background: 'neutral-50',
    backgroundOverWhite: false,
    limit: 3,
  },
];

const tokens = readColorTokens(
  readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8'),
);

function ratioFor(pair: Pair): number {
  expect(tokens.has(pair.foreground)).toBe(true);
  expect(tokens.has(pair.background)).toBe(true);
  const foreground = parseHex(tokens.get(pair.foreground) as string);
  const background: Rgb = pair.backgroundOverWhite
    ? composite(
        parseRgba(tokens.get(pair.background) as string),
        parseHex('#FFFFFF'),
      )
    : parseHex(tokens.get(pair.background) as string);
  return contrastRatio(foreground, background);
}

describe('kontrast för färgtokens i tokens.css (WCAG 2.x)', () => {
  it.each([...TEXT_PAIRS, ...NON_TEXT_PAIRS])(
    '$id: $foreground mot $background når minst $limit:1',
    (pair) => {
      const ratio = ratioFor(pair);
      expect(
        ratio,
        `${pair.id}: kvoten är ${ratio.toFixed(6)}`,
      ).toBeGreaterThanOrEqual(pair.limit);
    },
  );

  it.each(FAILING_PAIRS)(
    '$id: $foreground mot $background ligger under $limit:1',
    (pair) => {
      const ratio = ratioFor(pair);
      expect(ratio, `${pair.id}: kvoten är ${ratio.toFixed(6)}`).toBeLessThan(
        pair.limit,
      );
    },
  );
});
