import { useId, type JSX } from 'react';

export interface LogoProps {
  variant?: 'full' | 'mark';
  tone?: 'onLight' | 'onDark';
  withTagline?: boolean;
  className?: string;
}

const TAGLINE = 'Bokningssystem för fastigheter och föreningar';

export function Logo({
  variant = 'full',
  tone = 'onLight',
  withTagline = false,
  className,
}: LogoProps): JSX.Element {
  const titleId = useId();
  const onDark = tone === 'onDark';
  const base = onDark ? 'fill-white' : 'fill-primary-900';

  const mark = (
    <svg
      role="img"
      aria-labelledby={titleId}
      viewBox="0 0 317.9 307.8"
      className="h-12 w-auto"
    >
      <title id={titleId}>Grannbo</title>
      <rect
        x="73.6"
        y="0"
        width="26.8"
        height="53.6"
        rx="13.4"
        className={base}
      />
      <rect
        x="220.9"
        y="0"
        width="26.8"
        height="53.6"
        rx="13.4"
        className={base}
      />
      <rect
        x="0"
        y="73.6"
        width="66.9"
        height="66.9"
        rx="16.7"
        className={base}
      />
      <rect
        x="83.6"
        y="73.6"
        width="66.9"
        height="66.9"
        rx="16.7"
        className={base}
      />
      <rect
        x="167.3"
        y="73.6"
        width="66.9"
        height="66.9"
        rx="16.7"
        className={base}
      />
      <rect
        x="251"
        y="73.6"
        width="66.9"
        height="66.9"
        rx="16.7"
        className={base}
      />
      <rect
        x="0"
        y="157.3"
        width="66.9"
        height="66.9"
        rx="16.7"
        className={base}
      />
      <path
        d="M78.6 185.4L113.7 150.5A5 5 0 0 1 120.7 150.5L155.6 185.4V223.6A5.7 5.7 0 0 1 149.9 229.3H84.3A5.7 5.7 0 0 1 78.6 223.6Z"
        className="fill-accent-500"
      />
      <rect
        x="167.3"
        y="157.3"
        width="66.9"
        height="66.9"
        rx="16.7"
        className={base}
      />
      <rect
        x="251"
        y="157.3"
        width="66.9"
        height="66.9"
        rx="16.7"
        className={base}
      />
      <rect
        x="0"
        y="240.9"
        width="66.9"
        height="66.9"
        rx="16.7"
        className={base}
      />
      <rect
        x="83.6"
        y="240.9"
        width="66.9"
        height="66.9"
        rx="16.7"
        className={base}
      />
      <rect
        x="167.3"
        y="240.9"
        width="66.9"
        height="66.9"
        rx="16.7"
        className={base}
      />
      <rect
        x="251"
        y="240.9"
        width="66.9"
        height="66.9"
        rx="16.7"
        className="fill-neutral-300"
      />
    </svg>
  );

  if (variant === 'mark') {
    return <span className={className}>{mark}</span>;
  }

  return (
    <span
      className={['inline-flex flex-col items-center gap-2', className]
        .filter(Boolean)
        .join(' ')}
    >
      {mark}
      <span
        aria-hidden="true"
        className={`font-heading text-3xl font-semibold ${onDark ? 'text-white' : 'text-primary-900'}`}
      >
        Grannbo
      </span>
      {withTagline && (
        <span
          aria-hidden="true"
          className={`font-heading text-sm ${onDark ? 'text-neutral-300' : 'text-neutral-600'}`}
        >
          {TAGLINE}
        </span>
      )}
    </span>
  );
}
