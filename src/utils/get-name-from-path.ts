import fs from 'node:fs';
import path from 'node:path';
import type { ConfigExport, Context } from '@/types';

export function getNameFromPath(exportItem: ConfigExport, ctx: Context) {
  if (fs.statSync(exportItem.path).isFile()) {
    const baseName = path.basename(exportItem.path);
    if (baseName.startsWith('index')) {
      return path.basename(path.dirname(exportItem.path), ctx.baseDir);
    }
    return baseName.replace(/\.\w+$/, '');
  }
  return path.basename(exportItem.path, ctx.baseDir);
}
