# H08 固定源码与教学断言核对

基线Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Harness `0.2.2-alpha.2`，Cordis `4.0.6-alpha.1`。`source-lock.json`保存749个相关源码/配置/文档的Git blob和SHA256；运行前再次比字节。表中EXECUTED只指作者夹具确实调用固定API；官方Vitest只选读，没有运行。

核心五文件：profile.ts、profile-context.ts、vendor/include/src/index.ts、loader/config/entry.ts、hmr/src/index.ts。其余为辅助配置、依赖、失败路径与测试。源码阅读顺序不充当运行调用链。每项均审读条件、await、catch/finally与提前返回；行界限、哈希与AST只是防漂移辅助。

| ID | 断言及适用范围 | 固定源码/测试 | 验证方式 | 状态 |
| --- | --- | --- | --- | --- |
| S01 | Profile保存有序Bundle与用户层 | [packages/boot/app-boot/src/profile.ts:74–99](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L74-L99) | loadProfileDirectory磁盘夹具 | EXECUTED |
| S02 | Bundle声明一个文件或有序文件数组 | [packages/boot/app-boot/src/profile.ts:48–71](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L48-L71) | 两个Bundle文件依次覆盖 | EXECUTED |
| S03 | 五种随附模板与minimal独立树 | [packages/util/official-bundles/src/bundles.ts:10–25](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/util/official-bundles/src/bundles.ts#L10-L25) | officialProfiles解析五模板完整Patch | EXECUTED_PARSE_ONLY |
| S04 | base以insert贡献共享行；行顺序不是服务激活顺序 | [packages/bundle/base/cordis.patch.yml:1–33](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/base/cordis.patch.yml#L1-L33) | 配置选读＋完整树解析 | STATIC_AND_PARSE |
| S05 | web-app一个Bundle列五个Patch文件 | [packages/bundle/web-app/package.json:46–56](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/web-app/package.json#L46-L56) | 五模板解析 | EXECUTED_PARSE_ONLY |
| S06 | 按安装锚点再Profile查Bundle | [packages/boot/app-boot/src/profile.ts:629–664](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L629-L664) | 隔离安装目录解析；锚点逆序未另做变异 | PARTIAL_EXECUTED |
| S07 | 缺失/平台/不兼容/坏Bundle可被跳过，用户层错误抛出 | [packages/boot/app-boot/src/profile.ts:678–714](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L678-L714) | 缺包、版本、坏Bundle及坏Profile测试；平台分支只选读 | PARTIAL_EXECUTED |
| S08 | 四常规层＋启动overlays快照 | [packages/boot/app-boot/src/profile-context.ts:74–85](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile-context.ts#L74-L85) | 磁盘Profile→boot与四层夹具 | EXECUTED |
| S09 | 遥测非空开关在最后禁用已存在行 | [packages/boot/app-boot/src/profile-context.ts:40–55](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile-context.ts#L40-L55) | 0字符串压过CLI重新启用 | EXECUTED |
| S10 | composeEntries调用官方Patch，不另造算法 | [packages/boot/app-boot/src/profile.ts:747–762](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L747-L762) | A官方对照与所有模板 | EXECUTED |
| S11 | 根insert及组insert会索引新增条目 | [vendor/include/src/index.ts:65–102](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/include/src/index.ts#L65-L102) | 同列表先插再改、组内插入 | EXECUTED |
| S12 | 缺ID/目标/name保护报告warn跳过 | [vendor/include/src/index.ts:104–123](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/include/src/index.ts#L104-L123) | 三警告与name不匹配测试 | EXECUTED |
| S13 | 整个config赋值，非默认深合并 | [vendor/include/src/index.ts:120–123](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/include/src/index.ts#L120-L123) | A五层；官方标题raw覆盖；深合并变异拒绝 | EXECUTED |
| S14 | Patch索引递归组，不跨嵌套Include文件 | [vendor/include/src/index.ts:65–74](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/include/src/index.ts#L65-L74) | 只定位配置中当前树；Include边界测试 | EXECUTED |
| S15 | 配置解析保留表达式节点，插入相对名锚定Patch目录 | [packages/boot/app-boot/src/index.ts:547–590](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L547-L590) | 五模板表达式只解析；相对路径规则选读 | STATIC_AND_PARSE |
| S16 | Loader保留Include/Group配置字面量；其他Fiber插值 | [vendor/loader/src/index.ts:104–113](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/loader/src/index.ts#L104-L113) | 模块选读；未对全部表达式作执行矩阵 | STATIC |
| S17 | EntryGroup用ID比较、同ID复用Entry | [vendor/loader/src/config/group.ts:20–65](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/loader/src/config/group.ts#L20-L65) | B稳定/匿名新对象两对照 | EXECUTED |
| S18 | 缺ID时ensureId随机生成并写回对象 | [vendor/loader/src/config/tree.ts:52–59](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/loader/src/config/tree.ts#L52-L59) | B每次重新解析全新对象，非复用已补ID对象 | EXECUTED |
| S19 | 普通config更新可清理并重跑同一Fiber | [vendor/loader/src/config/entry.ts:118–180](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/loader/src/config/entry.ts#L118-L180) | B普通无Config拦截/volatile的插件 | EXECUTED_CONDITIONAL |
| S20 | disabled释放旧Fiber，Entry仍保留；重启用新建Fiber | [vendor/loader/src/config/entry.ts:134–180](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/loader/src/config/entry.ts#L134-L180) | B Provider/Consumer状态身份 | EXECUTED |
| S21 | group标记行有enabled特例，祖先和表达式另影响禁用 | [vendor/loader/src/config/entry.ts:75–97](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/loader/src/config/entry.ts#L75-L97) | 选读getter；未覆盖所有组变更 | STATIC |
| S22 | Include同路径更新拦截自身重启而更新孩子 | [vendor/include/src/index.ts:190–201](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/include/src/index.ts#L190-L201) | App Boot recompose隔离夹具 | EXECUTED |
| S23 | Include读失败不提交新内容，refresh捕获并留旧树 | [vendor/include/src/index.ts:216–241](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/include/src/index.ts#L216-L241) | 坏YAML/空文件/下次合法恢复 | EXECUTED |
| S24 | 根Include内建准备、兼容性与Loader挂载 | [packages/boot/app-boot/src/index.ts:741–791](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L741-L791) | 真实boot＋本地纯插件 | EXECUTED_FIXTURE |
| S25 | 启动必需ID失败抛；可选项警告；缺席/禁用必需行另处理 | [packages/boot/app-boot/src/index.ts:1140–1170](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L1140-L1170) | webserver缺服务拒绝；optional-needs与缺模块保兄弟 | PARTIAL_EXECUTED |
| S26 | 重组应用前的finally恢复不同于应用后的失败 | [packages/boot/app-boot/src/index.ts:329–430](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L329-L430) | 应用后失败实际验证；映射publication前恢复只选读 | PARTIAL_EXECUTED |
| S27 | 重组PENDING通常warning；requiredIds可将其变失败 | [packages/boot/app-boot/src/index.ts:390–411](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L390-L411) | requiredIds=needs失败但条目保留 | EXECUTED |
| S28 | Schema拒绝可使raw新值与effective旧值并存 | [packages/boot/app-boot/tests/config-reload.spec.ts:232–260](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/tests/config-reload.spec.ts#L232-L260) | 独立真实boot对应夹具；官方用例未运行 | EXECUTED_AUTHOR_FIXTURE |
| S29 | base配置HMR；headless应用层禁用 | [packages/bundle/headless/cordis.patch.yml:35–46](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/bundle/headless/cordis.patch.yml#L35-L46) | 五模板解析；真实HMR未挂载 | STATIC_AND_PARSE |
| S30 | Profile/Home/manifest监听等待应用就绪并串行协调 | [packages/boot/hmr/src/index.ts:352–407](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/hmr/src/index.ts#L352-L407) | 选读初始化、watchConfig及runExclusive；未运行原生监视 | STATIC_NOT_RUN |
| S31 | Profile重组比较模块并调用App Boot重组 | [packages/boot/hmr/src/index.ts:913–982](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/hmr/src/index.ts#L913-L982) | 选读try/finally；只执行App Boot子路径 | STATIC_NOT_RUN_HMR |
| S32 | 模块预导入失败先恢复缓存而不卸载旧运行 | [packages/boot/hmr/tests/modules.spec.ts:178–192](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/hmr/tests/modules.spec.ts#L178-L192) | setup→partialReload拒绝→sameFiber/once断言选读 | STATIC_NOT_RUN |
| S33 | 模块激活失败尝试恢复旧插件 | [packages/boot/hmr/tests/modules.spec.ts:267–283](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/hmr/tests/modules.spec.ts#L267-L283) | setup→replacement throw→两次original且无成功event断言 | STATIC_NOT_RUN |
| S34 | 旧插件恢复自己也可能失败，原错误仍报告 | [packages/boot/hmr/tests/modules.spec.ts:455–469](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/hmr/tests/modules.spec.ts#L455-L469) | replacement/restore双失败与warn断言选读 | STATIC_NOT_RUN |
| S35 | 模块恢复实际catch是尽力，不保证状态/副作用回滚 | [packages/boot/hmr/src/index.ts:642–739](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/hmr/src/index.ts#L642-L739) | 预导入、delete/await、reload、rollback双层catch语义审读 | STATIC_NOT_RUN |
| S36 | Plugin Manager保存选择并经HMR应用或要求重启 | [packages/boot/plugin-manager/src/index.ts:1233–1274](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/plugin-manager/src/index.ts#L1233-L1274) | 管理器调用与状态分支选读；无安装/删除操作 | STATIC_NOT_RUN |
| S37 | isolate的true本地域与字符串命名域，不是OS隔离 | [vendor/loader/src/config/isolate.ts:25–88](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/loader/src/config/isolate.ts#L25-L88) | 选读Realm与access分支；完整隔离重组矩阵未运行 | STATIC |

## 文档概括与实现精度

架构文档“四层最后CLI”是常规组合说明；实际readProfilePatches还有遥测硬禁用尾层，正文与图三单列。Include.refresh注释的“保留旧树”仅能严格用于读取/解析失败，不能外推到已应用且插件激活失败。官方模块测试既覆盖恢复成功，也覆盖restore再次失败；正文表按阶段拆开。

稳定ID不是不重跑承诺：Entry和Fiber是两层身份；普通更新可复用Fiber，disable后再enable新建。缺ID实验每次用全新对象，不复用被ensureId补过ID的对象。Schema默认值不等于Patch深合并；原始配置、effective配置和服务另核。

本节沿用蓝图核心“手算可审查树”，扩展为真实Loader/App Boot夹具。蓝图规划的复杂agent scope/preset内部算法只说明边界，不提前开发H09/H13；配置服务realm与Agent作用域不同。所有五模板只读解析结果不冒称完整应用集成。

## 官方选读证据层

- user-patches.spec.ts：可选缺文件、坏YAML、非数组、插入路径锚点；config-reload.spec.ts：insert可被后层覆盖、坏文件保树、Schema拒绝与好兄弟保留。
- profile.spec.ts：安装/Profile解析、平台不支持跳过但保留选择、完整层顺序。源文件的afterAll存在递归清理，本轮不执行。
- hmr/reconciliation.spec.ts:75–142：主动投递配置事件；apply失败后保留fail:true、坏解析后保留前配置、合法恢复再ACTIVE；不称原生文件通知测试。
- hmr/modules.spec.ts：预导入失败、激活失败与恢复失败三个已列精确区间。HMR内部Mock cache不冒称完整应用热替换。

运行证据在lab-tests.txt（20项）与lab-mutation.txt（预期非零）。未运行：原生HMR、完整官方应用/套件、真实Provider、OS沙箱、磁盘恢复与线上鉴权媒体。事实审读与作者行为测试不能替代学员试读或独立外审。
