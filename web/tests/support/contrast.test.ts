// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  composite,
  contrastRatio,
  parseHex,
  parseRgba,
  readColorTokens,
  relativeLuminance,
} from './contrast';

describe('parseHex', () => {
  it('tolkar versaler och gemener till samma färg', () => {
    expect(parseHex('#1B2A41')).toEqual({ r: 27, g: 42, b: 65 });
    expect(parseHex('#1b2a41')).toEqual({ r: 27, g: 42, b: 65 });
  });

  it.each([
    ['#1B2A4', 'Ogiltig hexfärg "#1B2A4". Formen ska vara #RRGGBB.'],
    ['#1B2A411', 'Ogiltig hexfärg "#1B2A411". Formen ska vara #RRGGBB.'],
    ['1B2A41', 'Ogiltig hexfärg "1B2A41". Formen ska vara #RRGGBB.'],
    ['#1B2A4G', 'Ogiltig hexfärg "#1B2A4G". Formen ska vara #RRGGBB.'],
    [' #1B2A41', 'Ogiltig hexfärg " #1B2A41". Formen ska vara #RRGGBB.'],
  ])('C1 för %j', (hex, message) => {
    expect(() => parseHex(hex)).toThrow(new Error(message));
  });
});

describe('parseRgba', () => {
  it('tolkar rgb(R G B / A)', () => {
    expect(parseRgba('rgb(27 42 65 / 0.7)')).toEqual({
      r: 27,
      g: 42,
      b: 65,
      a: 0.7,
    });
  });

  it.each([
    ['rgb(27 42 65 / 0.85)', { r: 27, g: 42, b: 65, a: 0.85 }],
    ['rgb(27 42 65 / 0)', { r: 27, g: 42, b: 65, a: 0 }],
    ['rgb(27 42 65 / 1)', { r: 27, g: 42, b: 65, a: 1 }],
    ['rgb(255 255 255 / 1)', { r: 255, g: 255, b: 255, a: 1 }],
  ])('godtar %j', (value, expected) => {
    expect(parseRgba(value)).toEqual(expected);
  });

  it.each([
    [
      'rgb(256 42 65 / 0.7)',
      'Ogiltig rgb-färg "rgb(256 42 65 / 0.7)". R, G och B ska vara heltal mellan 0 och 255.',
    ],
    [
      'rgb(27 256 65 / 0.7)',
      'Ogiltig rgb-färg "rgb(27 256 65 / 0.7)". R, G och B ska vara heltal mellan 0 och 255.',
    ],
    [
      'rgb(27 42 256 / 0.7)',
      'Ogiltig rgb-färg "rgb(27 42 256 / 0.7)". R, G och B ska vara heltal mellan 0 och 255.',
    ],
  ])('C3 för %j', (value, message) => {
    expect(() => parseRgba(value)).toThrow(new Error(message));
  });

  it.each([
    [
      'rgb(27, 42, 65, 0.7)',
      'Ogiltig rgb-färg "rgb(27, 42, 65, 0.7)". Formen ska vara rgb(R G B / A).',
    ],
    [
      'rgba(27 42 65 / 0.7)',
      'Ogiltig rgb-färg "rgba(27 42 65 / 0.7)". Formen ska vara rgb(R G B / A).',
    ],
    [
      'rgb(27 42 65 / 1.0)',
      'Ogiltig rgb-färg "rgb(27 42 65 / 1.0)". Formen ska vara rgb(R G B / A).',
    ],
    [
      'rgb(27 42 65 / 0.855)',
      'Ogiltig rgb-färg "rgb(27 42 65 / 0.855)". Formen ska vara rgb(R G B / A).',
    ],
    [
      'rgb(27 42 65)',
      'Ogiltig rgb-färg "rgb(27 42 65)". Formen ska vara rgb(R G B / A).',
    ],
    [
      ' rgb(27 42 65 / 0.7)',
      'Ogiltig rgb-färg " rgb(27 42 65 / 0.7)". Formen ska vara rgb(R G B / A).',
    ],
    [
      'rgb(27 42 65 / 0.7) ',
      'Ogiltig rgb-färg "rgb(27 42 65 / 0.7) ". Formen ska vara rgb(R G B / A).',
    ],
  ])('C2 för %j', (value, message) => {
    expect(() => parseRgba(value)).toThrow(new Error(message));
  });
});

describe('composite', () => {
  const white = { r: 255, g: 255, b: 255 };

  it('overlay över vitt avrundar varje kanal', () => {
    expect(composite({ r: 27, g: 42, b: 65, a: 0.7 }, white)).toEqual({
      r: 95,
      g: 106,
      b: 122,
    });
  });

  it('a: 0 ger bottom och a: 1 ger top', () => {
    const top = { r: 27, g: 42, b: 65 };
    const bottom = { r: 200, g: 150, b: 100 };
    expect(composite({ ...top, a: 0 }, bottom)).toEqual(bottom);
    expect(composite({ ...top, a: 1 }, bottom)).toEqual(top);
  });

  it.each([
    [-0.01, 'Ogiltig alfa -0.01. A ska vara ett tal mellan 0 och 1.'],
    [1.01, 'Ogiltig alfa 1.01. A ska vara ett tal mellan 0 och 1.'],
    [NaN, 'Ogiltig alfa NaN. A ska vara ett tal mellan 0 och 1.'],
  ])('C5 för a = %s', (a, message) => {
    expect(() => composite({ r: 27, g: 42, b: 65, a }, white)).toThrow(
      new Error(message),
    );
  });

  it.each([0, 1])('inget fel för a = %s', (a) => {
    expect(() => composite({ r: 27, g: 42, b: 65, a }, white)).not.toThrow();
  });

  it('C4 för top med r: 256', () => {
    expect(() => composite({ r: 256, g: 42, b: 65, a: 0.7 }, white)).toThrow(
      new Error(
        'Ogiltig färg {"r":256,"g":42,"b":65,"a":0.7}. R, G och B ska vara heltal mellan 0 och 255.',
      ),
    );
  });

  it('C4 för bottom med g: -1', () => {
    expect(() =>
      composite({ r: 27, g: 42, b: 65, a: 0.7 }, { r: 255, g: -1, b: 255 }),
    ).toThrow(
      new Error(
        'Ogiltig färg {"r":255,"g":-1,"b":255}. R, G och B ska vara heltal mellan 0 och 255.',
      ),
    );
  });

  it('C4 för top med b: 1.5', () => {
    expect(() => composite({ r: 27, g: 42, b: 1.5, a: 0.7 }, white)).toThrow(
      new Error(
        'Ogiltig färg {"r":27,"g":42,"b":1.5,"a":0.7}. R, G och B ska vara heltal mellan 0 och 255.',
      ),
    );
  });

  it('C4 för top kontrolleras före C5', () => {
    expect(() => composite({ r: 256, g: 42, b: 65, a: 2 }, white)).toThrow(
      new Error(
        'Ogiltig färg {"r":256,"g":42,"b":65,"a":2}. R, G och B ska vara heltal mellan 0 och 255.',
      ),
    );
  });

  it('C5 kontrolleras före C4 för bottom', () => {
    expect(() =>
      composite({ r: 27, g: 42, b: 65, a: 2 }, { r: 255, g: -1, b: 255 }),
    ).toThrow(new Error('Ogiltig alfa 2. A ska vara ett tal mellan 0 och 1.'));
  });
});

describe('relativeLuminance', () => {
  it('svart ger 0', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it.each([
    [{ r: 255, g: 0, b: 0 }, 0.2126],
    [{ r: 0, g: 255, b: 0 }, 0.7152],
    [{ r: 0, g: 0, b: 255 }, 0.0722],
  ])('%j ger %s', (color, expected) => {
    expect(relativeLuminance(color)).toBeCloseTo(expected, 12);
  });

  it('kanalen 10 ligger under gränsen 0,04045 och 11 över', () => {
    expect(relativeLuminance({ r: 10, g: 10, b: 10 })).toBeCloseTo(
      10 / 255 / 12.92,
      12,
    );
    expect(relativeLuminance({ r: 11, g: 11, b: 11 })).toBeCloseTo(
      ((11 / 255 + 0.055) / 1.055) ** 2.4,
      12,
    );
  });

  it.each([
    [
      { r: 256, g: 0, b: 0 },
      'Ogiltig färg {"r":256,"g":0,"b":0}. R, G och B ska vara heltal mellan 0 och 255.',
    ],
    [
      { r: 0, g: -1, b: 0 },
      'Ogiltig färg {"r":0,"g":-1,"b":0}. R, G och B ska vara heltal mellan 0 och 255.',
    ],
    [
      { r: 0, g: 0, b: 1.5 },
      'Ogiltig färg {"r":0,"g":0,"b":1.5}. R, G och B ska vara heltal mellan 0 och 255.',
    ],
  ])('C4 för %j', (color, message) => {
    expect(() => relativeLuminance(color)).toThrow(new Error(message));
  });
});

describe('contrastRatio', () => {
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };
  const primary = { r: 27, g: 42, b: 65 };
  const background = { r: 244, g: 246, b: 249 };

  it('svart mot vitt ger 21', () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21, 10);
  });

  it('samma färg mot sig själv ger 1', () => {
    expect(contrastRatio(primary, primary)).toBe(1);
  });

  it('ordningen på argumenten spelar ingen roll', () => {
    expect(contrastRatio(primary, background)).toBe(
      contrastRatio(background, primary),
    );
  });

  it('C4 för andra argumentet', () => {
    expect(() => contrastRatio(primary, { r: 0, g: 0, b: 256 })).toThrow(
      new Error(
        'Ogiltig färg {"r":0,"g":0,"b":256}. R, G och B ska vara heltal mellan 0 och 255.',
      ),
    );
  });
});

describe('readColorTokens', () => {
  const valid = [
    '@theme {',
    '  --color-*: initial;',
    '  --color-primary-900: #1b2a41;',
    '  --color-overlay: rgb(27 42 65 / 0.7);',
    '  --font-body: sans-serif;',
    '}',
  ];

  it('ger exakt färgposterna i ordning', () => {
    expect([...readColorTokens(valid.join('\n'))]).toEqual([
      ['primary-900', '#1b2a41'],
      ['overlay', 'rgb(27 42 65 / 0.7)'],
    ]);
  });

  it('ger samma resultat med \\r\\n', () => {
    expect([...readColorTokens(valid.join('\r\n'))]).toEqual([
      ['primary-900', '#1b2a41'],
      ['overlay', 'rgb(27 42 65 / 0.7)'],
    ]);
  });

  it.each([
    [
      '--color-x: red;',
      'Ogiltig färgrad 2 i tokenfilen: "--color-x: red;". Formen ska vara --color-<namn>: #RRGGBB; eller --color-<namn>: rgb(R G B / A);',
    ],
    [
      '--color-x: #1b2a41',
      'Ogiltig färgrad 2 i tokenfilen: "--color-x: #1b2a41". Formen ska vara --color-<namn>: #RRGGBB; eller --color-<namn>: rgb(R G B / A);',
    ],
    [
      '--color-x: #1b2a41; --color-y: #ffffff;',
      'Ogiltig färgrad 2 i tokenfilen: "--color-x: #1b2a41; --color-y: #ffffff;". Formen ska vara --color-<namn>: #RRGGBB; eller --color-<namn>: rgb(R G B / A);',
    ],
    [
      '--color-X: #1b2a41;',
      'Ogiltig färgrad 2 i tokenfilen: "--color-X: #1b2a41;". Formen ska vara --color-<namn>: #RRGGBB; eller --color-<namn>: rgb(R G B / A);',
    ],
    [
      '--color-*:initial;',
      'Ogiltig färgrad 2 i tokenfilen: "--color-*:initial;". Formen ska vara --color-<namn>: #RRGGBB; eller --color-<namn>: rgb(R G B / A);',
    ],
  ])('C6 för %j', (line, message) => {
    expect(() =>
      readColorTokens(['--color-*: initial;', line].join('\n')),
    ).toThrow(new Error(message));
  });

  it('C1 släpps igenom för en ogiltig hexfärg', () => {
    expect(() =>
      readColorTokens(['--color-*: initial;', '--color-x: #1b2a4;'].join('\n')),
    ).toThrow(new Error('Ogiltig hexfärg "#1b2a4". Formen ska vara #RRGGBB.'));
  });

  it('C2 släpps igenom för en ogiltig rgb-färg', () => {
    expect(() =>
      readColorTokens(
        ['--color-*: initial;', '--color-x: rgb(1, 2, 3);'].join('\n'),
      ),
    ).toThrow(
      new Error(
        'Ogiltig rgb-färg "rgb(1, 2, 3)". Formen ska vara rgb(R G B / A).',
      ),
    );
  });

  it('C7 när nollställningen står efter en färgtoken', () => {
    expect(() =>
      readColorTokens(
        ['@theme {', '--color-x: #1b2a41;', '--color-*: initial;'].join('\n'),
      ),
    ).toThrow(
      new Error(
        'Raden "--color-*: initial;" på rad 3 ska stå exakt en gång och före alla färgtokens.',
      ),
    );
  });

  it('C7 när nollställningen står två gånger', () => {
    expect(() =>
      readColorTokens(
        [
          '--color-*: initial;',
          '--color-*: initial;',
          '--color-x: #1b2a41;',
        ].join('\n'),
      ),
    ).toThrow(
      new Error(
        'Raden "--color-*: initial;" på rad 2 ska stå exakt en gång och före alla färgtokens.',
      ),
    );
  });

  it('C8 för en dubblett med samma värde', () => {
    expect(() =>
      readColorTokens(
        [
          '--color-*: initial;',
          '--color-x: #1b2a41;',
          '--color-y: #ffffff;',
          '--color-x: #1b2a41;',
        ].join('\n'),
      ),
    ).toThrow(new Error('Färgtoken "x" finns redan; dubblett på rad 4.'));
  });

  it('C8 för en dubblett med annat värde', () => {
    expect(() =>
      readColorTokens(
        [
          '--color-*: initial;',
          '--color-x: #1b2a41;',
          '--color-x: rgb(27 42 65 / 0.7);',
        ].join('\n'),
      ),
    ).toThrow(new Error('Färgtoken "x" finns redan; dubblett på rad 3.'));
  });

  it('en dubblett med ogiltigt värde ger C1, inte C8', () => {
    expect(() =>
      readColorTokens(
        [
          '--color-*: initial;',
          '--color-x: #1b2a41;',
          '--color-x: #1b2a4;',
        ].join('\n'),
      ),
    ).toThrow(new Error('Ogiltig hexfärg "#1b2a4". Formen ska vara #RRGGBB.'));
  });

  it('C9 för tom text', () => {
    expect(() => readColorTokens('')).toThrow(
      new Error('Tokenfilen saknar raden "--color-*: initial;".'),
    );
  });

  it('C9 för en text med bara färgtokens', () => {
    expect(() =>
      readColorTokens(
        ['--color-x: #1b2a41;', '--color-y: #ffffff;'].join('\n'),
      ),
    ).toThrow(new Error('Tokenfilen saknar raden "--color-*: initial;".'));
  });
});
