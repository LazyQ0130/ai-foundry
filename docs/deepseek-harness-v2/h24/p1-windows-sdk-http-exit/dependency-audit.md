# npm三个包替换专项审计

| 包名 | 替换前版本 → 后版本 | 来源/入口 | 影响 |
| --- | --- | --- | --- |
| pretty-ms | 9.3.1 → 9.3.0 | registry.npmjs.org；ESM index.js/types | execa测试/子进程诊断格式；无.node |
| pure-rand | 8.4.2 → 8.4.0 | registry.npmjs.org；CJS/ESM条件子路径 | fast-check随机生成；无.node |
| yoctocolors | 2.2.0 → 2.1.2 | registry.npmjs.org；ESM index.js/types | execa输出颜色；无.node |

替换后版本及integrity均是固定pnpm中条目。替换前pretty-ms9.3.1直接出现在保留的预检失败断言；另两项由同秒缓存tarball、包元数据、完整SRI和纠正后的override共同还原。**原pre-replacement package-lock未保留，另两项没有逐字原锁，不能把高可信还原写成已认证的完整历史目录。** 实际cache key、毫秒时间、tarball SHA512、package.json、exports和native文件检查在[dependency-cache-forensics](evidence/dependency-cache-forensics.json)。8.4.0/8.4.2的条件exports表一致，两版ESM包入口/Node>=18声明也一致；算法/格式细节仍可能影响时序，不能声称完全无影响。

历史原地npm install把当时新作者缓存的3个传递包替换了，package.json新增override，作者package-lock解析发生变化；固定官方pnpm-lock和主站锁未修改。原始控制台3 added/3 removed在旧报告中披露，不伪造当时未保存的npm raw。本轮不再原地替换，没有批量删除或改全局npm/pnpm配置。

## 三套依赖对照

1. 保留的h24-test-deps现存目录已经是纠正后的状态，仍使用它复现同原生断言；不谎称它仍含替换前包。
2. 八个全新目录严格复制已核固定pnpm解析的锁，独立npm cache、ignore-scripts；每个输入锁安装前后hash相同，版本/完整integrity核验全部PASS。新环境原24.16默认SDK+HTTP仍失败。
3. 另建“替换前3版本候选”目录，只将这3条解析设为已核缓存tarball。它是显式forensic候选，非官方pin环境；其余包保持正式锁，runner验证三项SRI，其运行也复现相同断言。它不是恢复了未保留的历史lock，不能用于正式验收。

这些安装各在全新目录开始，输出仅新增，无removed；原依赖树和主仓库node_modules未改；全局包缓存只读核对，没有在其中安装、替换或清理，npm自身查询/版本命令日志不在逐字保护保证中。input/lock/tree/命令/退出在clean-install与before-candidate-install，所有目录保留。这些是正式pnpm条目中本课所需的作者最小npm依赖树，不是整个官方monorepo的干净构建；全量构建未执行。纯Node最小例不加载任何npm包也失败，因此3包替换不是必要条件，不能独立解释整个故障。

三个包都是JavaScript，不改Node Native Binding ABI。fresh安装的.node身份另存clean-native-bindings；纯Node例连Koffi/tsx都不加载，所以不支持把Koffi或三个包直接定为根因。模块解析代表性确有历史偏差：当时初装取到固定锁外传递版本，且runner曾使用主站tsx4.23.15；本轮对照显式把tsx CLI/API统一为固定4.23.13并核esbuild0.28.2，问题仍在。

机器自带另一Node24.22.1的SHA与官方不一致，只保留候选对照，不擅自解释再签名/构建原因。本轮另在新目录下载官方24.22.1 win-x64/node.exe，逐字匹配nodejs.org SHASUMS256，再运行同链。旧24.16也匹配官方SHA；没有全局升级/降级，没有把“版本号不同”自动当修复。
