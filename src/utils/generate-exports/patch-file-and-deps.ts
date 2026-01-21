import fs from 'node:fs';
import path from 'node:path';
import type { Context, RegistryFile, RuntimeRegistryItem } from '@/types';
import { getFile } from './get-file';

function readDirFiles(realPath: string, files: RegistryFile[], ctx: Context) {
  fs.readdirSync(realPath).forEach((file) => {
    const filePath = path.join(realPath, file);
    const isFile = fs.statSync(filePath).isFile();
    if (isFile) {
      files.push(...getFile(filePath, ctx));
    } else {
      readDirFiles(filePath, files, ctx);
    }
  });
}

export function patchFileAndDeps(exportItem: RuntimeRegistryItem, ctx: Context) {
  const { extInfo, files, dependencies } = exportItem;
  // 一个入口文件只会对应一个外部依赖
  ctx.runCtx.dependenciesSet = new Set<string>();

  if (extInfo.isFile) {
    files.push(...getFile(exportItem.extInfo.realPath, ctx));
  } else {
    readDirFiles(extInfo.realPath, files, ctx);
  }
  // 后置文件处理, 所有依赖都会被收集到 files 中, 然后过滤不属于当前工作目录的文件到其他依赖中
  exportItem.files = files.filter((item) => {
    if (item.fileType === 'workfile') {
      return true;
    }
    if (item.fileType === 'dependency') {
      dependencies.push(item.id);
      return false;
    }
    return false;
  });

  ctx.runCtx.dependenciesSet = null as any;
}
