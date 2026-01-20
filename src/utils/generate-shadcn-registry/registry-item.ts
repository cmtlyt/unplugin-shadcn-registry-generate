import fs from 'node:fs';
import path from 'node:path';
import type { Context } from '@/types';

function aliasTransformToRelative(ctx: Context) {
  const { exports } = ctx;
  exports.forEach((item: any) => {
    const { files } = item;
    files.forEach((file: any) => {
      const { aliases } = file;
      if (aliases.length === 0) {
        return;
      }
      aliases.forEach((alias: any) => {
        const { relativePath, originalId } = alias;
        file.fileContent = file.fileContent.replace(new RegExp(originalId, 'g'), relativePath);
      });
    });
  });
}

function generateRegistryItemJson(regItem: any) {
  const { files: _files, extInfo: _, ...otherConfig } = regItem;

  const files = _files.map((item: any) => {
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
  const { exports, options } = ctx;
  const { outputDir } = options;
  aliasTransformToRelative(ctx);

  exports.forEach((item: any) => {
    const ouputPath = path.join(outputDir, `${item.name}.json`);
    const regJson = generateRegistryItemJson(item);
    fs.writeFileSync(ouputPath, JSON.stringify(regJson, null, 2));
  });
}
