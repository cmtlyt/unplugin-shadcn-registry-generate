import fs from 'node:fs';
import path from 'node:path';
import { readTSConfig, resolvePackageJSON } from 'pkg-types';
import type { Context, ShadcnRegisterGeneratorOptions } from '@/types';
import { normalizeOptions } from './base';

function readConfig(ctx: Context) {
  const configPath = path.join(ctx.baseDir, 'shadcn-exports.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

export async function initContext(ctx: Context) {
  ctx.baseDir = path.dirname(await resolvePackageJSON());

  const config = await readConfig(ctx);
  if (!config) {
    console.warn('shadcn-exports.json not found');
  }
  ctx.config = config || { exports: [] };
  ctx.tsConfig = await readTSConfig(ctx.baseDir);
}

export function createContext(options: ShadcnRegisterGeneratorOptions) {
  return {
    options: normalizeOptions(options),
    baseDir: '',
    config: null,
    exports: null,
    tsConfig: null as any,
    runCtx: {
      reqistrys: [] as any[],
      dependenciesSet: null as any,
      aliasMap: {},
    },
  } satisfies Context;
}
