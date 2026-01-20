import { createUnplugin } from 'unplugin';
import type { ShadcnRegisterGeneratorOptions } from './types';
import {
  clearExportsFields,
  createContext,
  generateExports,
  generateRegistryItemJsons,
  generateRegistryJson,
  initContext,
  initOuputDir,
} from './utils';

const shadcnRegisterGenerator = createUnplugin((options: ShadcnRegisterGeneratorOptions) => {
  const ctx = createContext(options);

  return {
    name: 'unplugin-shadcn-register-generator',
    async buildStart() {
      await initContext(ctx);
      // 生成导出文件的信息
      generateExports(ctx);
      // 初始化输出目录
      initOuputDir(ctx);
      // 生成 registry-item.json
      generateRegistryItemJsons(ctx);
      // 清除内部字段
      clearExportsFields(ctx);
      // 生成 registry.json
      generateRegistryJson(ctx);
    },
  };
});

// biome-ignore lint/style/noDefaultExport: skip
export default shadcnRegisterGenerator;
