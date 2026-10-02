# Stage 3 V1.1.1 Reliability Patch

## Fixed

- 保留每用户每分钟 5 次 HTTP 请求限制；真实 Provider 另有每用户每分钟 10 单位的单实例内存预算。`answer`、`suggest`、`stream`、`retrieve` 各 1 单位，`ask` 一次预留 2 单位，`documents` 在切块后、创建 `indexing` 文档前一次预留 `chunks.length` 单位（最多 8）。Mock 不消耗 Provider 单位。10 单位允许一篇 8 块资料及少量正常问答，阻止短时间连续索引多篇 8 块资料。成功预留后即使 Provider 失败也不退款。
- 文档索引保留单次 Provider 的 20 秒超时，并增加整篇外部调用的 75 秒截止时间；Embedding 继续顺序执行、结果顺序不变，不在数据库事务中等待 Provider。
- SSE parser 将 `finish_reason` 解析为独立 finish frame。`length` 转为 `OUTPUT_TRUNCATED`；Route 发出脱敏的 error event，不发 done。页面进入 failed、保留已收到的文字。4000 字符绝对防御上限仍保留，正常长度截断由 `finish_reason` 判断。
- 3.1～3.7 Reference 快照均固定使用本地 `tsx` 运行纯单元测试，补齐 `npm test`、干净装配脚本和各课 README 中的执行命令。Prisma Client 生成不再要求安装时已有 `DATABASE_URL`；migration 和运行仍需真实数据库。
- 七份 Reference package 描述改为 Stage 3 Reference；RAG Mock 状态标识改为“Mock 模式 · 未调用真实模型”。3.3 与 3.4 正文同步截断状态和真实调用预算，全部 35 个 Stage 3 checkKeys 保留。

## Verification

### Reference 快照

在平台仓库根目录对每课的 A、B 分别使用**新的** `.runtime` 目录执行：

```powershell
node scripts/assemble-stage3-reference.mjs <课号 1～7> <a|b> .runtime/<新目录>
cd .runtime/<新目录>
npm install --no-audit --no-fund
npm test
npm run build
```

14 个干净快照均以 exit 0 结束。每个页面变体的单元测试数：3.1 为 3，3.2 为 3，3.3 为 9，3.4 为 12，3.5 为 12，3.6 为 13，3.7 为 18。`knowledge-units.test.mjs` 用项目本地 `tsx` 正常运行，包括段落切块、Mock Embedding 与向量验证；不依赖 Node 内建 TypeScript 去除或作者全局工具。

数据库集成测试使用本机独立 pgvector 测试库、已有四次 migration 与本地 Provider Stub，不产生真实模型费用。命令形式为 `node <lesson>/reference.test.mjs <装配项目>`、`node <lesson>/knowledge-reference.test.mjs <装配项目>`、`node --import tsx <lesson>/rag-reference.test.mjs <装配项目>`，并按各测试文件要求设置 `TEST_DATABASE_URL`/`DATABASE_URL`。3.1～3.7 的基础接口测试、3.4～3.7 的知识入库测试、3.5～3.7 的 RAG 测试均以 exit 0 结束。覆盖 5/6 次 HTTP 请求、1/2/8 单位原子预留、Mock 跳过预算、60 秒窗口、8 Chunk 拒绝前 0 次 Embed 且无新 `indexing` 文档、RAG 拒绝前 0 次 Embed/Chat、SSE `length` 后仅 `meta`/`delta`/`error` 无 `done`。正常 `stop`、分帧 usage、网络切分及单块多帧也通过。

平台仓库逐项运行 `npm run typecheck`、`npm run build`、`npm test`、`npm run check:authored-content`、`npm run check:content`、`npm run check:starter`、`npm run check:bundle`、`npm run verify`、`npm run check`，全部 exit 0。平台测试 70 项通过；作者正文校验覆盖 22 篇、109 个全局唯一 checkKeys；已发布目录同步校验覆盖 4 阶段和 22 篇已发布正文；两个 Starter ZIP 与源目录一致；前端 bundle 检查了 236 个文件。

Production Reference 在同步最终 Implementation A 后运行 `npm install --no-audit --no-fund`、`npm test`（3 项）、`npm run build`，全部 exit 0。

Reference commit `81a0dc762191f1c67ddf65dac640eb535945af11` 已推送到远端 `main`，GitHub Production Deployment `6809765017` 状态为 success，关联同一 SHA。对正式 URL `https://aifoundry-stage3-workbench-referenc.vercel.app/` 运行一次低成本真实 smoke：`node .runtime/stage3-v11-production-smoke.mjs`，exit 0；Chat 200、短文本 Structured 200、Streaming 正常完成 200、三块资料真实 Embedding 入库 201（1024 维）、RAG 200，实际引用来源与本次检索结果相符。终端只记录状态、块数和引用数，未记录完整回答、向量或 Secret。`finish_reason=length` 的拒绝路径使用 Stub 验证，没有在 Production 刻意消耗 token 制造截断；没有重跑 12 Case Evaluation。

## Still true

- Provider 预算只是每个服务实例的内存 Map；Serverless 多实例之间不共享额度，也不是计费账本。没有做大规模并发或分布式限流验收。
- Prisma schema 不变，仍为四次正式 migration；Starter 没有加入 Stage 3 AI runtime；课程图像与 Stage 4 没有变更。
- Stage 3 七课继续 `isPublished: false`，正式课程总数仍为 29；未开展真实新学员全流程。
