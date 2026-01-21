import type { PackageJson, TSConfig } from 'pkg-types';

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

export interface ConfigExport {
  name?: string;
  path: string;
  description?: string;
  title?: string;
  author?: string;
}

export interface ShadcnFile {
  path: string;
  type: string;
  target: string;
}

export interface ShadcnRegistry extends Omit<ConfigExport, 'path'> {
  type: 'registry:item';
  registryDependencies: string[];
  dependencies: string[];
  files: ShadcnFile[];
}

export interface RuntimeRegistryItem extends Omit<Required<ShadcnRegistry>, 'files' | 'author'> {
  files: RegistryFile[];
  extInfo: {
    realPath: string;
    isFile: boolean;
    resolvedId: string;
    fileMap: Map<string, RegistryFile>;
    filePaths: string[];
  };
}

export interface Config {
  exports: ConfigExport[];

  [key: string]: any;
}

export interface Context {
  options: Required<ShadcnRegisterGeneratorOptions>;
  baseDir: string;
  config: Config;
  runtimeExports: RuntimeRegistryItem[];
  exports: ShadcnRegistry[];
  tsConfig: TSConfig;
  pkgConfig: PackageJson;
  fileRequire: NodeJS.Require;
  runCtx: {
    reqistrys: RuntimeRegistryItem[];
    dependenciesSet: Set<string>;
    aliasMap: Record<string, Array<{ originalId: string; relativePath: string; resolvedId: string }>>;
  };
}

export interface WorkFile {
  uuid: string;
  path: string;
  type: 'registry:file';
  target: string;
  fileType: 'workfile';
  aliases: Context['runCtx']['aliasMap'][string];
  fileContent: string;
}

export interface Dependency {
  path: string;
  id: string;
  fileType: 'dependency';
}

export type RegistryFile = WorkFile | Dependency;
