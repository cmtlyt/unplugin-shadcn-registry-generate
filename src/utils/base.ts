import fs from 'node:fs';
import type { Context, ShadcnRegisterGeneratorOptions } from '@/types';

export function initOuputDir(ctx: Context) {
  const { options } = ctx;
  const { outputDir } = options;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

function normalizeBasePath(basePath: string) {
  if (basePath.endsWith('/')) {
    return basePath;
  }
  return `${basePath}/`;
}

// 归一化
export function normalizeOptions(options: ShadcnRegisterGeneratorOptions): Required<ShadcnRegisterGeneratorOptions> {
  if (!options.registryUrl) {
    throw new Error('registryUrl is required');
  }
  return {
    registryUrl: options.registryUrl,
    outputDir: options.outputDir || './public/r',
    basePath: normalizeBasePath(options.basePath || '~/'),
    noRootRegistry: options.noRootRegistry === true,
  };
}
