import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import faviconSvg from '../../../public/favicon.svg?raw';
import { Logo, type LogoProps } from './Logo';

const VARIANTS: NonNullable<LogoProps['variant']>[] = ['full', 'mark'];
const TONES: NonNullable<LogoProps['tone']>[] = ['onLight', 'onDark'];
const COMBINATIONS = VARIANTS.flatMap((variant) =>
  TONES.map((tone) => ({ variant, tone })),
);
const GEOMETRY_ATTRIBUTES = [
  'x',
  'y',
  'width',
  'height',
  'rx',
  'cx',
  'cy',
  'r',
  'd',
  'points',
];

// Vitest körs utan globals, så Testing Library städar inte själv mellan testen.
afterEach(cleanup);

function shapes(svg: Element): Element[] {
  return [...svg.children].filter((child) => child.tagName !== 'title');
}

function hiddenTexts(container: HTMLElement): (string | null)[] {
  return [...container.querySelectorAll('span[aria-hidden="true"]')].map(
    (element) => element.textContent,
  );
}

describe('Logo', () => {
  it.each(COMBINATIONS)(
    'variant $variant, tone $tone has the accessible name Grannbo',
    ({ variant, tone }) => {
      render(<Logo variant={variant} tone={tone} />);
      expect(screen.getByRole('img', { name: 'Grannbo' })).toBeInTheDocument();
    },
  );

  it('has the accessible name Grannbo with the default props', () => {
    render(<Logo />);
    expect(screen.getByRole('img', { name: 'Grannbo' })).toBeInTheDocument();
  });

  it('gives two logos on the same page their own title ids', () => {
    render(
      <>
        <Logo />
        <Logo variant="mark" />
      </>,
    );
    const images = screen.getAllByRole('img', { name: 'Grannbo' });
    expect(images).toHaveLength(2);
    expect(images[0].getAttribute('aria-labelledby')).not.toBe(
      images[1].getAttribute('aria-labelledby'),
    );
  });

  it('shows the wordmark hidden from screen readers and no tagline by default', () => {
    const { container } = render(<Logo />);
    expect(hiddenTexts(container)).toEqual(['Grannbo']);
  });

  it('shows the tagline verbatim, hidden from screen readers, with withTagline', () => {
    const { container } = render(<Logo withTagline />);
    expect(hiddenTexts(container)).toEqual([
      'Grannbo',
      'Bokningssystem för fastigheter och föreningar',
    ]);
  });

  it('shows neither wordmark nor tagline for variant mark, even with withTagline', () => {
    const { container } = render(<Logo variant="mark" withTagline />);
    expect(hiddenTexts(container)).toEqual([]);
    expect(container.textContent).toBe('Grannbo');
  });

  it.each([
    { tone: 'onLight' as const, base: 'fill-primary-900', other: 'fill-white' },
    { tone: 'onDark' as const, base: 'fill-white', other: 'fill-primary-900' },
  ])(
    'tone $tone colours the squares and rings with $base',
    ({ tone, base, other }) => {
      render(<Logo variant="mark" tone={tone} />);
      const classes = shapes(screen.getByRole('img')).map((shape) =>
        shape.getAttribute('class'),
      );
      expect(classes).toEqual([
        base,
        base,
        base,
        base,
        base,
        base,
        base,
        'fill-accent-500',
        base,
        base,
        base,
        base,
        base,
        'fill-neutral-300',
      ]);
      expect(classes).not.toContain(other);
    },
  );

  it.each([
    {
      tone: 'onLight' as const,
      wordmark: 'text-primary-900',
      tagline: 'text-neutral-600',
    },
    {
      tone: 'onDark' as const,
      wordmark: 'text-white',
      tagline: 'text-neutral-300',
    },
  ])(
    'tone $tone gives the wordmark $wordmark and the tagline $tagline',
    ({ tone, wordmark, tagline }) => {
      const { container } = render(<Logo tone={tone} withTagline />);
      const [wordmarkElement, taglineElement] = container.querySelectorAll(
        'span[aria-hidden="true"]',
      );
      expect(wordmarkElement).toHaveClass(wordmark);
      expect(taglineElement).toHaveClass(tagline);
    },
  );

  it.each(VARIANTS)(
    'variant %s puts className on the outermost element',
    (variant) => {
      const { container } = render(
        <Logo variant={variant} className="test-class" />,
      );
      expect(container.firstElementChild).toHaveClass('test-class');
    },
  );

  it('uses tone onLight by default', () => {
    const { container } = render(<Logo withTagline />);
    const classes = shapes(screen.getByRole('img')).map((shape) =>
      shape.getAttribute('class'),
    );
    expect(classes).toContain('fill-primary-900');
    expect(classes).not.toContain('fill-white');
    const [wordmarkElement, taglineElement] = container.querySelectorAll(
      'span[aria-hidden="true"]',
    );
    expect(wordmarkElement).toHaveClass('text-primary-900');
    expect(taglineElement).toHaveClass('text-neutral-600');
  });

  it('writes no empty or undefined class without className', () => {
    const { container } = render(<Logo />);
    const classes = (
      container.firstElementChild?.getAttribute('class') ?? ''
    ).split(' ');
    expect(classes).not.toContain('');
    expect(classes).not.toContain('undefined');
  });
});

describe('Logo geometry matches favicon.svg', () => {
  const favicon = new DOMParser().parseFromString(
    faviconSvg,
    'image/svg+xml',
  ).documentElement;

  it('favicon.svg has the title Grannbo', () => {
    expect(favicon.querySelector('title')?.textContent).toBe('Grannbo');
  });

  it.each(COMBINATIONS)(
    'variant $variant, tone $tone has the same viewBox and shapes as favicon.svg',
    ({ variant, tone }) => {
      render(<Logo variant={variant} tone={tone} />);
      const svg = screen.getByRole('img', { name: 'Grannbo' });
      expect(svg.getAttribute('viewBox')).toBe(favicon.getAttribute('viewBox'));

      const logoShapes = shapes(svg);
      const faviconShapes = shapes(favicon);
      expect(logoShapes.map((shape) => shape.tagName)).toEqual(
        faviconShapes.map((shape) => shape.tagName),
      );
      logoShapes.forEach((shape, index) => {
        for (const attribute of GEOMETRY_ATTRIBUTES) {
          expect(
            shape.getAttribute(attribute),
            `${shape.tagName} ${index} ${attribute}`,
          ).toBe(faviconShapes[index].getAttribute(attribute));
        }
      });
    },
  );
});
