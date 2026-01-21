import fs from 'node:fs';
import type { Context, RuntimeRegistryItem } from '@/types';
import { getNameFromPath } from '@/utils/get-name-from-path';
import { tsPathsResolve } from '@/utils/ts-paths-resolve';
import { filesSummary } from './files-summary';
import { patchFileAndDeps } from './patch-file-and-deps';
import { registryItemOptimization } from './registry-item-optimization';

export * from './clear-exports-fields';

export function generateExports(ctx: Context) {
  const { config, fileRequire } = ctx;
  const { exports: _exports } = config;

  const exports = _exports
    // 入口文件处理, 生成 registryItem 基本结构
    .map<RuntimeRegistryItem>((item) => {
      const { path: _, ...rest } = item;
      const name = item.name || getNameFromPath(item, ctx);
      const { resolvedId: realPath } = tsPathsResolve(item.path, ctx, `${ctx.baseDir}/package.json`);
      const isFile = fs.statSync(realPath).isFile();
      const resolvedId = fileRequire.resolve(realPath);

      const registryItem: RuntimeRegistryItem = {
        title: name,
        name: name,
        description: name,
        registryDependencies: [],
        dependencies: [],
        files: [],
        ...rest,
        type: 'registry:item',
        extInfo: {
          realPath,
          isFile,
          resolvedId,
          filePaths: [],
          fileMap: new Map(),
        },
      };

      ctx.runCtx.reqistrys.push(registryItem);

      return registryItem;
    })
    // 处理入口文件并收集和处理依赖
    .map((item) => {
      patchFileAndDeps(item, ctx);
      filesSummary(item);
      return item;
    })
    // 优化 registryItem, 抽离 registryDependencies
    .map((item) => registryItemOptimization(item, ctx));

  ctx.runtimeExports = exports;

  return exports;
}
