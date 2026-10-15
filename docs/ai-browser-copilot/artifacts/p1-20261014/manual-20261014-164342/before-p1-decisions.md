# P1 技术决策冻结

日期：2026-10-14。上游是Phase0 GO；本文件不修改上游报告。P1自身原生验收待人工完成，见矩阵。

## D1：保留验证组合，裁剪教学边界

WXT0.21.4、React/DOM18.3.1、TS5.9.3、React模块1.2.2保持原版本。P1的170个非根lock条目均能对应Phase0中的相同version/integrity；是依赖裁剪，不是升级。package/lock两套相同；`npm ci`验证了从网络取得锁定包。独立Node24.16.0/npm11.13.0，不依赖Foundry服务或数据库。项目engines>=22对应WXT下限，但锁定的Vite/rolldown另要求^20.19或>=22.12，合并安装下限实际为22.12；本课只实测并要求优先使用24.16.0，不把22.0当作可用环境。

没有把290包的完整Spike和Playwright/Vitest/API/选区源码打包给学员。作者QA借用仓库已有工具，不增加P1产品依赖。Starter/Reference各13个文件，仅README、background、App三处不同。

## D2：普通action与最小产品权限

P1生产只声明sidePanel；普通action回调立即open，初始化/安装/启动显式恢复`openPanelOnActionClick:false`。无popup。沿用Phase0已验证入口，后续P2才增加activeTab/scripting/storage。侧栏按钮是React交互，不给它虚构网页授权。

Service Worker同步注册事件，不提供保活。P1无跨worker业务状态；P2将沿用storage.session与每tab UUID上下文代次，具体规格在handoff-p2.md，不在P1学生代码中预置协议实现。

## D3：项目根与源码根分离

WXT `root`明确为含package.json的项目目录，`srcDir`明确为extension，配置仍在extension/wxt.config.ts、输出仍在项目.output。

起初沿用Spike的extension root，但P1未复制Spike第二份extension/package.json，`wxt zip`因此输出`reference-undefined-chrome.zip`。实际运行发现后，改为标准项目根/源码根划分，使WXT直接读取唯一package.json，重新检查开发更新、类型、构建、ZIP以及最终包重装。最终`npm run zip`生成`aifoundry-ai-web-reader-p1-0.1.0-chrome.zip`。原失败日志保留，不伪称打包首次即正确。

## D4：开发服务器监听与公开origin均固定回环

WXT的`dev.server.host`控制监听，`origin`控制生成的脚本地址。只设置host=127.0.0.1仍生成localhost脚本和host权限，已通过实际Manifest发现。最终同时设置`host:127.0.0.1`、`origin:http://127.0.0.1:3080`、`port:3080`、`strictPort:true`。端口冲突退出1，停旧服务后恢复成功。关闭自动webExt启动，手动加载。

开发Manifest由WXT加入tabs/scripting与`http://127.0.0.1/*`（匹配模式不含端口）；不能将此作为生产权限。生产Manifest只有sidePanel，CSP connect-src none；真实Chrome headless扩展页面的外连尝试被CSP拒绝。权限/CORS/CSP独立负责；本节没有API或CORS配置。

## D5：CSS和教学可复制性

沿用普通CSS，不引入新的UI框架。显式`vite.css.postcss.plugins=[]`避免独立子工程在作者仓库继承主站PostCSS。学员ZIP白名单含.nvmrc/.npmrc/.gitignore，不含node_modules、.wxt、.output、测试、临时Profile、环境密钥。开发构建与生产源码包、生产扩展ZIP各有明确用途。

## D6：证据分层与停止线

已实际执行Node安装/CLI/HTTP、Chrome155 headless真实MV3加载与扩展文档React、真实Renderer V2本地预览。CDP loadUnpacked需要测试专用调试标志，不写进学员启动要求。没有派发伪造工具栏事件。

Windows原生工具因URL识别失败停止；P1 toolbar→原生SidePanel、侧栏原生更新、生产重开和新Profile人工验收均保持BLOCKED。Phase0通过不替代P1新构建；Chrome116、真实模型和最终产品T01–T36没有本轮证据。本轮不进入P2，不修改平台注册或发布状态。

## 核对依据

- [Side Panel官方API](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)：用户手势、open/windowId和sidePanel权限。
- [activeTab官方说明](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab)：临时授权的范围与触发方式。
- [MV3生命周期](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)：空闲终止与状态恢复要求。
- [WXT InlineConfig](https://wxt.dev/api/reference/wxt/interfaces/inlineconfig)、[WXT CLI](https://wxt.dev/api/cli/wxt)：配置与命令；另以锁定0.21.4本地types.d.mts、resolve-config.mjs、manifest.mjs、zip.mjs核对具体行为。

上述文档用于核对API契约；运行结论以本目录artifacts/p1-20261014原始日志为准。
