import type { TSConfig } from 'pkg-types';

export interface ShadcnRegisterGeneratorOptions {
  /**
   * registry 仓库地址
   */
  registryUrl: string;
  /**
   * 输出目录
   * @default './public/r'
   */
  outputDir?: string;
  /**
   * 基础 target 路径
   * @default '~/'
   */
  basePath?: string;
  /**
   * 是否不生成根目录的 registry.json
   * @default false
   */
  noRootRegistry?: boolean;
}

export interface Context {
  options: Required<ShadcnRegisterGeneratorOptions>;
  baseDir: string;
  config: any;
  exports: any;
  tsConfig: TSConfig;
  runCtx: {
    reqistrys: any[];
    dependenciesSet: Set<string>;
    aliasMap: Record<string, Array<{ originalId: string; relativePath: string; resolvedId: string }>>;
  };
}
