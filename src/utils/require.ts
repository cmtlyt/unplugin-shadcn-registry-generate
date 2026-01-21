import { createRequire as nodeCreateRequire } from 'node:module';

export function createRequire(baseUrl: string = import.meta.url) {
  return nodeCreateRequire(baseUrl);
}
