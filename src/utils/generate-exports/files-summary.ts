import type { RuntimeRegistryItem } from '@/types';

export function filesSummary(item: RuntimeRegistryItem) {
  const files = item.files;
  const { fileMap } = item.extInfo;
  files.forEach((file) => {
    const { path: filePath } = file;
    fileMap.set(filePath, file);
  });
  item.extInfo.filePaths = Array.from(fileMap.keys());
}
