// @vitest-environment node
//
// Spärr mot externa typsnittsvärdar (ARKITEKTUR 4.3). Läser index.html och
// varje .css-fil under src/, vald rekursivt; symboliska länkar följs inte.
//
// Det spärren inte fångar: andra typsnittsvärdar (t.ex. Typekit, Bunny
// Fonts); en extern URL i en .ts/.tsx-fil eller i public/; CSS-escapes eller
// procentkodning av värdnamnet (fonts\2e googleapis, fonts%2Egoogleapis).
// Den fångar för mycket i ett fall: värdnamnet i en kommentar ger också träff.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const FONT_HOSTS = /fonts\.googleapis|fonts\.gstatic/gi;

const webDir = fileURLToPath(new URL('..', import.meta.url));

function toWebPath(absolutePath: string): string {
  return relative(webDir, absolutePath).split(sep).join('/');
}

function collectCssFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectCssFiles(entryPath));
    } else if (entry.name.endsWith('.css')) {
      files.push(entryPath);
    }
  }
  return files;
}

describe('typsnitt laddas bara lokalt', () => {
  const filesToRead = [
    join(webDir, 'index.html'),
    ...collectCssFiles(join(webDir, 'src')),
  ];
  const readPaths = filesToRead.map(toWebPath);

  it('läser index.html och CSS-filerna under src/', () => {
    expect(readPaths).toContain('index.html');
    expect(readPaths).toContain('src/styles/index.css');
    expect(readPaths).toContain('src/styles/tokens.css');
    expect(
      readPaths.filter((p) => p !== 'index.html' && !p.endsWith('.css')),
    ).toEqual([]);
  });

  it('ingen fil hänvisar till fonts.googleapis eller fonts.gstatic', () => {
    const hits = filesToRead.flatMap((file) =>
      (readFileSync(file, 'utf8').match(FONT_HOSTS) ?? []).map(
        (hit) => `${toWebPath(file)}: ${hit}`,
      ),
    );
    expect(hits).toEqual([]);
  });
});
