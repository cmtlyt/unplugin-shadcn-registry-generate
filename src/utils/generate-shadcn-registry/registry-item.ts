import fs from 'node:fs';
import path from 'node:path';
import type { AliasItem, Context, RuntimeRegistryItem, WorkFile } from '@/types';

const ignoreExtSet = new Set(['.ts', '.tsx', '.js', '.jsx']);

function sliceRelativePath(alias: AliasItem) {
  const { relativePath, resolvedId } = alias;

  if (fs.statSync(resolvedId).isFile()) {
    const fileName = path.basename(relativePath);
    // 如果文件名是 index, 则直接使用目录名
    if (fileName.startsWith('index.')) {
      return path.dirname(relativePath);
    }
    // 如果文件后缀是 .ts .tsx .js .jsx, 则移除后缀
    const fileExt = path.extname(relativePath);
    if (ignoreExtSet.has(fileExt)) {
      return relativePath.slice(0, -fileExt.length);
    }
  }

  return relativePath;
}

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
        const { originalId } = alias;
        file.fileContent = file.fileContent.replace(new RegExp(originalId, 'g'), sliceRelativePath(alias));
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
