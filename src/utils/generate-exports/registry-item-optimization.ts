import type { Context } from '@/types';

export function resolveRegistryDependencieUrl(name: string, ctx: Context) {
  const { options } = ctx;

  return `${options.registryUrl}/${name}.json`;
}

export function registryItemOptimization(regItem: any, ctx: Context) {
  const { extInfo } = regItem;
  const { fileMap } = extInfo;
  const { reqistrys } = ctx.runCtx;

  reqistrys
    .filter((item) => {
      if (item.name === regItem.name) {
        return false;
      }
      // item 中只要有一个 file 不在 regItem 中, 则跳过
      if (item.extInfo.filePaths.some((filePath: string) => !fileMap.has(filePath))) {
        return false;
      }
      return true;
    })
    .forEach((item) => {
      regItem.registryDependencies.push(resolveRegistryDependencieUrl(item.name, ctx));
      item.extInfo.filePaths.forEach((filePath: string) => {
        fileMap.delete(filePath);
      });
    });

  const files = Array.from(fileMap.values());

  return { ...regItem, files };
}
