import fs from 'node:fs';
import type { Context } from '@/types';
import { getNameFromPath } from '@/utils/get-name-from-path';
import { fileRequire } from '@/utils/require';
import { tsPathsResolve } from '@/utils/ts-paths-resolve';
import { patchFileAndDeps } from './patch-file-and-deps';
import { registryItemOptimization } from './registry-item-optimization';

export * from './clear-exports-fields';

function filesSummary(item: any) {
  const files = item.files;
  const fileMap = new Map<string, any>();
  files.forEach((file: any) => {
    const { path: filePath } = file;
    fileMap.set(filePath, file);
  });
  item.extInfo.filePaths = Array.from(fileMap.keys());
  item.extInfo.fileMap = fileMap;
}

export function generateExports(ctx: Context) {
  const { config } = ctx;
  const { exports: _exports } = config;

  const exports = _exports
    .map((item: any) => {
      const { path: _path, ...rest } = item;
      const name = rest.name || getNameFromPath(item, ctx);
      const { resolvedId: realPath } = tsPathsResolve(item.path, ctx, `${ctx.baseDir}/package.json`);
      const isFile = fs.statSync(realPath).isFile();
      const resolveId = fileRequire.resolve(realPath);

      const registryItem = {
        title: name,
        name: name,
        description: name,
        registryDependencies: [],
        dependencies: [],
        files: [],
        ...rest,
        type: 'registry:item',
        extInfo: { realPath, isFile, resolveId },
      };

      ctx.runCtx.reqistrys.push(registryItem);

      return registryItem;
    })
    .map((item: any) => {
      patchFileAndDeps(item, ctx);
      filesSummary(item);
      return item;
    })
    .map((item: any) => registryItemOptimization(item, ctx));

  ctx.exports = exports;

  return exports;
}
