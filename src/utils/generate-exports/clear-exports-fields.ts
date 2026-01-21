import type { Context, WorkFile } from '@/types';

export function clearExportsFields(ctx: Context) {
  const { runtimeExports } = ctx;
  ctx.exports = runtimeExports.map((item) => {
    const { extInfo: _, ...otherItem } = item;
    const files = (otherItem.files as WorkFile[]).map((file) => {
      const { fileType: __, path: filePath, type, target } = file;
      return { path: filePath, type, target };
    });
    return { ...otherItem, files };
  });
}
