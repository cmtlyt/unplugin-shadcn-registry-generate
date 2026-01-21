import fs from 'node:fs';
import path from 'node:path';
import type { Context } from '@/types';
import { getRelativePath } from './get-relative-path';
import { isDependency } from './verify';

function extTry(filePath: string, _ctx: Context) {
  const exts = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.vue'];
  for (let i = 0; i < exts.length; i++) {
    const ext = exts[i];
    const fullPath = `${filePath}${ext}`;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  if (fs.existsSync(`${filePath}/index.ts`)) {
    return `${filePath}/index.ts`;
  }
  return filePath;
}

export function tsPathsResolve(id: string, ctx: Context, filePath: string) {
  // 判断是否为外部依赖, 如果是的话则直接返回
  if (isDependency(id, ctx)) {
    return { type: 'dependency', originalId: id, resolvedId: id };
  }
  // 通过 tsconfig.json 配置进行路径解析
  const { paths, baseUrl } = ctx.tsConfig?.compilerOptions || {};
  const fileDir = path.dirname(filePath);
  if (!paths) {
    return { type: 'relative', originalId: id, resolvedId: extTry(path.resolve(fileDir, id), ctx) };
  }
  const keys = Reflect.ownKeys(paths) as string[];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = paths[key][0].replace(/\*$/, '');
    if (id === key) {
      const resolvedId = extTry(path.resolve(baseUrl || ctx.baseDir, value), ctx);
      return {
        type: 'alias',
        originalId: id,
        resolvedId,
        relativePath: getRelativePath(fileDir, resolvedId),
        aliasPath: value,
      };
    }
    const keyWithoutStar = key.replace(/\*$/, '');
    if (id.startsWith(keyWithoutStar)) {
      const resolvedId = extTry(path.resolve(baseUrl || ctx.baseDir, id.replace(keyWithoutStar, value)), ctx);
      return {
        type: 'alias',
        originalId: id,
        resolvedId,
        relativePath: getRelativePath(fileDir, resolvedId),
        aliasPath: value,
      };
    }
  }
  return { type: 'relative', originalId: id, resolvedId: extTry(path.resolve(fileDir, id), ctx) };
}
