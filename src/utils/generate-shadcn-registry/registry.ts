import fs from 'node:fs';
import path from 'node:path';
import type { Context } from '@/types';

export function generateRegistryJson(ctx: Context) {
  const { baseDir, options, config, exports } = ctx;
  const { exports: _, $schema: __, ...otherConfig } = config;
  const { outputDir, noRootRegistry } = options;
  const registryJson = JSON.stringify(
    {
      // biome-ignore lint/style/useNamingConvention: ignore
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      name: '',
      homepage: '',
      items: exports,
      ...otherConfig,
    },
    null,
    2,
  );
  if (!noRootRegistry) {
    fs.writeFileSync(path.join(baseDir, 'registry.json'), registryJson);
  }
  fs.writeFileSync(path.join(outputDir, 'registry.json'), registryJson);
}
