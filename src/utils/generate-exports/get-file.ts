import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Context, RegistryFile } from '@/types';
import { tsPathsResolve } from '@/utils/ts-paths-resolve';
import { fileInWorkspace, isNodeOrgModule } from '@/utils/verify';

function getFileDependencies(
  filePath: string,
  fileContent: string,
  ctx: Context,
  dependenciesSet: Set<string>,
  uuid: string,
) {
  const { fileRequire } = ctx;
  const dependencieRegexp =
    /import.*?from.*?(['"])(.*?)\1|import.*?(['"])(.*?)\3|import\(.*?(['"])(.*?)\5.*?\)|export.*?from.*?(['"])(.*?)\7/g;

  const dependencies: RegistryFile[] = [];

  let match = dependencieRegexp.exec(fileContent);
  while (match !== null) {
    const [, , id1, , id2, , id3, , id4] = match;
    const id = id1 || id2 || id3 || id4;
    // 使用完直接更新, 防止后续分支过多需要多个地方更新 match
    match = dependencieRegexp.exec(fileContent);
    try {
      const { resolvedId, relativePath, type, ...resolveInfo } = tsPathsResolve(id, ctx, filePath);
      // 如果依赖已经处理过, 则跳过
      if (dependenciesSet.has(resolvedId)) {
        continue;
      }
      // 记录路径别名用于后续替换为相对路径, 防止引用方因路径别名导致的找不到文件
      if (type === 'alias' && relativePath) {
        ctx.runCtx.aliasMap[uuid]!.push({ ...resolveInfo, relativePath, resolvedId });
      }
      // 对于外部依赖直接通过 getFile 处理并保存到 dependencies 中, 后续会被 getFile 和并进 files
      else if (type === 'dependency') {
        dependencies.push(...getFile(id, ctx, { inWorkspace: false }));
        // 对于依赖保存 id
        dependenciesSet.add(id);
        continue;
      }
      const depPath = fileRequire.resolve(resolvedId);
      dependencies.push(...getFile(depPath, ctx, { inWorkspace: fileInWorkspace(depPath, ctx) }));
      // 对于文件保存路径
      dependenciesSet.add(depPath);
    } catch (error) {
      console.warn(error);
    }
  }

  return dependencies;
}

export function getFile(filePath: string, ctx: Context, option?: { inWorkspace?: boolean }) {
  const { runCtx, options } = ctx;
  const { inWorkspace = true } = option || {};
  const { dependenciesSet } = runCtx;
  // 如果文件已经处理过或者不在工作目录中并且是 node 内置模块, 则跳过
  if (dependenciesSet.has(filePath) || (!inWorkspace && isNodeOrgModule(filePath, ctx))) {
    return [];
  }

  const relativePath = path.relative(ctx.baseDir, filePath);
  const files: RegistryFile[] = [];

  if (inWorkspace) {
    const uuid = randomUUID();
    const aliases: Context['runCtx']['aliasMap'][string] = [];
    ctx.runCtx.aliasMap[uuid] = aliases;
    // 对于在工作目录的文件读取内容, 并处理依赖
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    files.push({
      uuid,
      path: relativePath,
      type: 'registry:file',
      target: `${options.basePath}${path.relative(ctx.baseDir, filePath)}`,
      fileType: 'workfile',
      aliases,
      fileContent,
    });
    const deps = getFileDependencies(filePath, fileContent, ctx, dependenciesSet, uuid);
    files.push(...deps);
  } else {
    // 外部依赖
    files.push({ path: filePath, id: filePath, fileType: 'dependency' });
  }

  return files;
}
