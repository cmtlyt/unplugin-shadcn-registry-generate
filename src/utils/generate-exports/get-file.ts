import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Context } from '@/types';
import { fileRequire } from '@/utils/require';
import { tsPathsResolve } from '@/utils/ts-paths-resolve';
import { fileInWorkspace, isNodeOrgModule } from '@/utils/verify';

function getFileDependencies(
  filePath: string,
  fileContent: string,
  ctx: Context,
  dependenciesSet: Set<string>,
  uuid: string,
) {
  const dependencieRegexp =
    /import.*?from.*?(['"])(.*?)\1|import.*?(['"])(.*?)\3|import\(.*?(['"])(.*?)\5.*?\)|export.*?from.*?(['"])(.*?)\7/g;

  const dependencies: any[] = [];

  let match = dependencieRegexp.exec(fileContent);
  while (match !== null) {
    const [, , id1, , id2, , id3, , id4] = match;
    const id = id1 || id2 || id3 || id4;
    try {
      const { resolvedId, relativePath, type, ...resolveInfo } = tsPathsResolve(id, ctx, filePath);
      if (type === 'alias' && relativePath) {
        ctx.runCtx.aliasMap[uuid]!.push({ ...resolveInfo, relativePath, resolvedId });
      }
      if (dependenciesSet.has(resolvedId)) {
        match = dependencieRegexp.exec(fileContent);
        continue;
      }
      const depPath = fileRequire.resolve(resolvedId);
      dependencies.push(...getFile(depPath, ctx, id, fileInWorkspace(depPath, ctx)));
      dependenciesSet.add(depPath);
    } catch (error) {
      console.warn(error);
    }
    match = dependencieRegexp.exec(fileContent);
  }

  return dependencies;
}

export function getFile(filePath: string, ctx: Context, id?: string, inWorkspace = true) {
  const { runCtx, options } = ctx;
  const { dependenciesSet } = runCtx;
  if (dependenciesSet.has(filePath)) {
    return [];
  }

  const relativePath = path.relative(ctx.baseDir, filePath);
  const files: any[] = [];
  const uuid = randomUUID();
  const aliases: Context['runCtx']['aliasMap'][string] = [];
  ctx.runCtx.aliasMap[uuid] = aliases;
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  if (inWorkspace) {
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
    const isDependency = filePath.includes('node_modules');
    if (!isNodeOrgModule(filePath)) {
      files.push({
        uuid,
        path: relativePath,
        id,
        fileType: isDependency ? 'dependency' : 'external',
        aliases,
        fileContent,
      });
    }
  }
  return files;
}
