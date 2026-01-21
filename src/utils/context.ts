import fs from 'node:fs';
import path from 'node:path';
import { readPackageJSON, readTSConfig, resolvePackageJSON } from 'pkg-types';
import type { Context, ShadcnRegisterGeneratorOptions } from '@/types';
import { normalizeOptions } from './base';
import { createRequire } from './require';

function readConfig(ctx: Context) {
  const configPath = path.join(ctx.baseDir, 'shadcn-exports.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

export async function initContext(ctx: Context) {
  const pkgPath = await resolvePackageJSON();
  ctx.baseDir = path.dirname(pkgPath);
  ctx.fileRequire = createRequire();

  const config = await readConfig(ctx);
  if (!config) {
    console.warn('shadcn-exports.json not found');
  }
  ctx.config = config || { exports: [] };
  ctx.tsConfig = await readTSConfig(ctx.baseDir);
  ctx.pkgConfig = await readPackageJSON(ctx.baseDir);
}

export function createContext(options: ShadcnRegisterGeneratorOptions) {
  return {
    options: normalizeOptions(options),
    baseDir: '',
    config: null as any,
    exports: [],
    runtimeExports: [],
    tsConfig: null as any,
    pkgConfig: null as any,
    fileRequire: null as any,
    runCtx: {
      reqistrys: [] as any[],
      dependenciesSet: null as any,
      aliasMap: {},
    },
  } satisfies Context;
}
