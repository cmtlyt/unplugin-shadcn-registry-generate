import fs from 'node:fs';
import path from 'node:path';
import type { Context } from '@/types';
import { getFile } from './get-file';

function readDirFiles(realPath: string, files: any[], ctx: Context) {
  fs.readdirSync(realPath).forEach((file) => {
    const filePath = path.join(realPath, file);
    const isFile = fs.statSync(filePath).isFile();
    if (isFile) {
      files.push(...getFile(filePath, ctx));
      return;
    }
    readDirFiles(filePath, files, ctx);
  });
}

export function patchFileAndDeps(exportItem: any, ctx: Context) {
  const { extInfo, files, dependencies, registryDependencies } = exportItem;
  ctx.runCtx.dependenciesSet = new Set<string>();

  if (extInfo.isFile) {
    files.push(...getFile(exportItem.extInfo.realPath, ctx));
  } else {
    readDirFiles(extInfo.realPath, files, ctx);
  }
  exportItem.files = files
    .filter((item: any) => {
      if (item.fileType === 'workfile') {
        return true;
      }
      if (item.fileType === 'registry') {
        registryDependencies.push(`./${item.id}.json`);
        return false;
      }
      if (item.fileType === 'dependency') {
        dependencies.push(item.id);
        return false;
      }
      return false;
    })
    .map((item: any) => {
      const { fileType: _, ...rest } = item;

      return rest;
    });

  ctx.runCtx.dependenciesSet = null as any;
}
