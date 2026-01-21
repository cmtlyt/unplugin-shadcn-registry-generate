import fs from 'node:fs';
import path from 'node:path';
import type { Context, RuntimeRegistryItem, WorkFile } from '@/types';

function aliasTransformToRelative(ctx: Context) {
  const { runtimeExports } = ctx;
  runtimeExports.forEach((item) => {
    const { files } = item;
    (files as WorkFile[]).forEach((file) => {
      const { aliases } = file;
      if (aliases.length === 0) {
        return;
      }
      aliases.forEach((alias) => {
        const { relativePath, originalId } = alias;
        file.fileContent = file.fileContent.replace(new RegExp(originalId, 'g'), relativePath);
      });
    });
  });
}

function generateRegistryItemJson(regItem: RuntimeRegistryItem) {
  const { files: _files, extInfo: _, ...otherConfig } = regItem;

  const files = (_files as WorkFile[]).map((item) => {
    const { path: fromPath, type, target, fileContent } = item;

    return {
      path: fromPath,
      type,
      target,
      content: fileContent,
    };
  });

  return {
    // biome-ignore lint/style/useNamingConvention: ignore
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    ...otherConfig,
    files,
  };
}

export function generateRegistryItemJsons(ctx: Context) {
  const { runtimeExports, options } = ctx;
  const { outputDir } = options;
  aliasTransformToRelative(ctx);

  runtimeExports.forEach((item) => {
    const ouputPath = path.join(outputDir, `${item.name}.json`);
    const regJson = generateRegistryItemJson(item);
    fs.writeFileSync(ouputPath, JSON.stringify(regJson, null, 2));
  });
}
