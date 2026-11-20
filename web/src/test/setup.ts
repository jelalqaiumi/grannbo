import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest körs utan globals (vite.config.ts), så Testing Library registrerar
// ingen städning själv. Den görs här, en gång för alla testfiler.
afterEach(cleanup);
