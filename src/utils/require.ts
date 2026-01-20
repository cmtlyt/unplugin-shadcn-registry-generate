import { createRequire } from 'node:module';

export const fileRequire = createRequire(import.meta.url);
