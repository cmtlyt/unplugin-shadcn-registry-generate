# unplugin-shadcn-registry-generate

生成 shadcn 的 registry 和对应的 registry-item

## 使用

创建 `shadcn-exports.json` 文件, 示例内容如下

```json
{
  "$schema": "./node_modules/@cmtlyt/unplugin-shadcn-registry-generate",
  "exports": [
    { "path": "./src/atomic-functions/assert-never.ts" },
    { "path": "./src/atomic-functions/sleep.ts" },
    { "path": "./src/tools/allx.ts", "name": "promiseAllX", "description": "promiseAllX", "title": "promiseAllX" },
    { "path": "./src/types/base.ts" }
  ]
}
```

在打包工具配置文件中补充如下内容, 以 rslib 为例

```ts
import { defineConfig } from '@rslib/core';
import shadcnRegistryGenerator from '@cmtlyt/unplugin-shadcn-registry-generate';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['node 18'],
      dts: true,
      tools: {
        rspack: {
          plugins: [shadcnRegistryGenerator.rspack()]
        },
      },
    },
  ],
});
```

然后执行 `npm run build` 即可

## 提示

name 生成规则如下

- 文件名不为 index 使用文件名
- 文件夹名

所以 name 是可能会冲突的, 为了更好的控制 name 最好是手动配置 name
