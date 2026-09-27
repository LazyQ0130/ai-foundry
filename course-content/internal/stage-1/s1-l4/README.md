# 1.4 内部参考实现

仅供课程验证、配图与后续课程开发，不是学生下载资源，不接入 Starter ZIP。

## 实验起点与结果

- A 的 before/app/page.tsx 原样来自 1.3 合格 A，checkbox、单次 filter、最终列表名 filtered。
- B 从 1.3 合格 B 准备：保留 button 和分步过滤，将最终列表改名为 visibleResources，并提前把原统计拆入 ResourceStats。此准备不改变行为；浏览器先验证仍符合 1.3。准备后的文件保存在 before/，不修改原 1.3 内部实现。
- after/ 是当前 Codex 按本课功能 Prompt 保存的结果：A 仅改首页统计文案；B 改首页传入的数量及现有统计组件。
- 共同的配置、锁文件、资料、样式与卡片直接复用 ../s1-l3/common/，不复制一套新的依赖和数据。
- prompts.json 保存三个正文 Prompt 原文；inspection.md 保存两个只读请求的回答；scope-evidence.json 保存源码哈希与安装副本差异。

## 组装与运行

从仓库根目录执行：

```powershell
node course-content/internal/stage-1/s1-l4/prepare.mjs a after
cd .runtime/s1-l4-reference-a-after
npm install
npm run dev
```

可改为 b after 查看组件写法，或 a before / b before 查看实验起点。第四个参数可指定新目录；拒绝覆盖已有目录，不删除文件。

## 合格行为

当前数 / 总数依次为：默认 9/9、重要 3/9、工具 2/9、重要与工具 0/9、重要与教程 2/9、Next.js 1/9、Excalidraw 与重要 0/9。关闭重要保留其他条件，刷新恢复默认。数量来自实际列表，不写死 9。

tests/s1-l4-reference.test.ts 执行真实页面与统计组件，核对标准状态及不同资料数量，比较修改前后卡片 ID 不变。这不代替浏览器交互验证；浏览器、构建与课程页面结果见 docs/s1-l4-validation.md。

当前 Codex 已按三个 Prompt 实做 A/B；不是独立盲测。尚未完成 WorkBuddy 默认演示工具验证。
