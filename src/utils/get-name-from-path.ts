import fs from 'node:fs';
import path from 'node:path';
import type { ConfigExport, Context } from '@/types';

export function getNameFromPath(filePath: string, _exportItem: ConfigExport, ctx: Context) {
  if (fs.statSync(filePath).isFile()) {
    const baseName = path.basename(filePath);
    if (baseName.startsWith('index')) {
      return path.basename(path.dirname(filePath), ctx.baseDir);
    }
    return baseName.replace(/\.\w+$/, '');
  }
  return path.basename(filePath, ctx.baseDir);
}
