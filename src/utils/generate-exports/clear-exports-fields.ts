import type { Context } from '@/types';

export function clearExportsFields(ctx: Context) {
  const { exports } = ctx;
  ctx.exports = exports.map((item: any) => {
    const { extInfo: _, ...otherItem } = item;
    const files = otherItem.files.map((file: any) => {
      const { path: filePath, type, target } = file;
      return { path: filePath, type, target };
    });
    return { ...otherItem, files };
  });
}
