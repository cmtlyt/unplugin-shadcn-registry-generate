import path from 'node:path';

export function getRelativePath(base: string, target: string) {
  const result = path.relative(base, target);
  if (path.sep === '/') {
    return result;
  }
  return result.replace(new RegExp(path.sep, 'g'), '/');
}
