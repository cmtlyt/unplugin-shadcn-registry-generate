import type { Context } from '@/types';

export function isNodeOrgModule(id: string) {
  // vue 等非 node 内置会在前面被 require.resolve 解析为包含 node_modules 的实际文件路径, 所以判断是否包含 / 或者 node 开头即可
  return id.startsWith('node:') || !id.includes('/');
}

export function pathMatch(realPath: string, id: string, isFile: boolean) {
  // realPath 可能为目录或者文件的绝对路径, id 为文件的绝对路径, 如果 realPath 是目录则判断 id 是否在 realPath 目录下
  if (isFile) {
    return realPath === id;
  }
  return id.startsWith(realPath) && !id.includes('node_modules');
}

export function fileInWorkspace(filePath: string, ctx: Context) {
  return pathMatch(ctx.baseDir, filePath, false);
}
