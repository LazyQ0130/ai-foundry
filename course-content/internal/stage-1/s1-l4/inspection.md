# 按正文只读 Prompt 的实做回答

工具：当前 Codex。先执行功能 Prompt 并在浏览器确认结果，再重新读取保存后的文件，回答修改说明和范围检查；这两步没有修改项目源码。源码哈希见 scope-evidence.json。

## A：修改说明

实际只修改 app/page.tsx，因为统计文字与最终资料列表都已经在此文件。

统计注释下，旧内容为 `共 {resources.length} 条资料`；新内容为 `当前显示 {filtered.length} 条 · 共 {resources.length} 条资料`。

当前结果数来自 filtered.length。同一页面资料卡片部分用 filtered.map 显示这组资料，因此两处指向同一份结果。总数仍来自 resources.length。需要新增的是当前数量及其文案；没有改变资料数据、搜索或筛选逻辑，也没有改依赖。

## B：修改说明

实际修改两个文件：app/page.tsx 与 components/ResourceStats.tsx。

页面中“统计”注释下，原来只给 ResourceStats 传 totalCount={resources.length}；现在增加 currentCount={visibleResources.length}。这是把最终要显示的资料数量交给现有统计组件，卡片仍用 visibleResources.map。

统计组件原来只接收 totalCount，现在同时接收 currentCount。展示从“共 {totalCount} 条资料”变成“当前显示 {currentCount} 条 · 共 {totalCount} 条资料”。两个文件各有必要：页面掌握列表，组件掌握文案。没有为了统计重新计算或改变筛选条件。

## A/B：范围检查

对照各自 before / after 文件，只包含上述统计展示所需变化；未改数据、搜索、标签、重要条件、控件、卡片、样式、README 或 package.json，没有新增依赖。B 的变量改名与组件拆分在实验前已经存在，不属于功能 Prompt 的修改范围；原始 1.3 参考实现没有被回写。

与冻结 common 逐文件比较，运行副本有一处安装阶段的额外差异：npm install 自动移除了 package-lock.json 中 postcss 的 dev 标记。包名、版本、下载地址和依赖内容都未改变。这不是功能 Prompt 新增依赖，内部交付仍复用原冻结锁文件，安装副本差异没有写回 Starter。具体前后对象保存在 scope-evidence.json。

没有发现需移除的无关源码修改，所以只读检查后没有继续重构。
