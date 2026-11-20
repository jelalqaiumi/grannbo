import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App';

test('App renders the level 1 heading Grannbo', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Grannbo' }),
  ).toBeInTheDocument();
});
