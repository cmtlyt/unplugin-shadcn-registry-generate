import path from 'node:path';
import type { Context } from '@/types';

export function isNodeOrgModule(id: string, ctx: Context) {
  return id.startsWith('node:') || !(isDependency(id, ctx) || path.isAbsolute(id));
}

export function fileInWorkspace(filePath: string, ctx: Context) {
  // 不是依赖包, 并且不在 node_modules 中
  return !(isDependency(filePath, ctx) || filePath.includes('node_modules'));
}

export function isDependency(id: string, ctx: Context) {
  const { pkgConfig } = ctx;
  const { dependencies = {}, devDependencies = {} } = pkgConfig;
  return Boolean(
    // node: 开头
    id.startsWith('node:') ||
      // 不包含 / 例如 fs path process, 如果不是三方包肯定会存在 /, 除非是 alias
      /**
       * TODO
       *
       * 是否判断 fs/promise 或无斜杠 alias 等路径?
       * 判断: 判断是否为一个路径, 需要联合 alias 判断
       * 不判断: 通过报错直接跳过解析这个 node 模块, 逻辑好像也是正确的
       */
      !id.includes('/') ||
      // 依赖包
      dependencies[id] ||
      // 开发依赖包
      devDependencies[id],
  );
}
