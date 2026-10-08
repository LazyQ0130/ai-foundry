# C9 dependency remediation

Review date: 2026-10-08。只修改 C9 package/lock；C1～C8 是历史课程快照，不把旧结果改写成已修复。

## Initial observation

C8 `npm audit --omit=dev`: 1 moderate / 4 high / 0 critical，5 affected package entries。`npm outdated` 显示 Next 16.4、Prisma 7/8 prerelease、React 19.3、MCP2.3 等较新版本；outdated 本身不要求跨大版本升级。

| 条目 / 路径 | 根因与官方 advisory | 本轮修复与代价 |
|---|---|---|
| next（direct runtime） | [SSG/ISR cache poisoning](https://github.com/vercel/next.js/security/advisories/GHSA-4jqv-mc3x-m676)、[cross-user substitution/DoS](https://github.com/vercel/next.js/security/advisories/GHSA-mcj8-r9mp-w47p)，<15.5.27 | 15.5.26→15.5.27补丁；不假定本项目没用ISR就忽略 |
| postcss（next transitive） | [style stringify XSS](https://github.com/postcss/postcss/security/advisories/GHSA-qx2v-qp2m-jg93)、[sourceMappingURL file read](https://github.com/postcss/postcss/security/advisories/GHSA-6g55-p6wh-862q)、[incomplete fix](https://github.com/postcss/postcss/security/advisories/GHSA-fxqj-rqcc-2cmp)、[map traversal](https://github.com/postcss/postcss/security/advisories/GHSA-r28c-9q8g-f849)；最后受影响<=8.5.22 | override锁8.5.23，超出Next固定传递版本，必须build回归；不接受残余Moderate |
| deepmerge-ts（transitive） | [recursive graph stack exhaustion](https://github.com/RebeccaStevens/deepmerge-ts/security/advisories/GHSA-ggr8-5vv4-36mx)，<8.0.0 | 锁8.0.2；跨major override，Prisma config generate/migrate/status和实际DB测试/Eval验证兼容；Plain JSON不产生循环仍不作为留下High的理由 |
| @prisma/config（@prisma/client→prisma→config） | 由deepmerge传播，不是独立根因 | Prisma6.19.3不变，override修传递依赖；不自动降级6.12，不在交付课改Prisma7适配器/schema |
| prisma（client peer + dev CLI，实际omit=dev也出现） | 同上dependency propagation | client/CLI继续对齐6.19.3；生产standalone只带所需client，releaseimage有CLI；审计按真实lock树而非假设CLI都是dev |

Next官方 [15.5.27 release](https://github.com/vercel/next.js/releases/tag/v15.5.27) 列出修复。修复版本和影响范围取自当天 registry audit / maintainer advisory；以后必须重新audit，不承诺永远零漏洞。

## Full audit extra chain

第一轮修复后production为0，但full仍5 High affected entries：eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces3.0.3。[Braces nested-pattern stack exhaustion](https://github.com/micromatch/braces/security/advisories/GHSA-vfj7-8cjw-p6xm) 当天没有可用patched版本，升级Next ESLint大版本仍有同链。

移除eslint-config-next/@eslint/eslintrc，使用typescript-eslint8.71.1和eslint-plugin-react-hooks7.1.1，保留TypeScript推荐检查、rules-of-hooks与exhaustive-deps。移除Next专用lint规则是明确取舍，Next build会警告未检测到plugin；没有关闭typechecking或隐藏audit。未来maintainer修复后再评估恢复专用规则。ESLint9.39.1已显示支持期警告，无audit漏洞；后续工具升级单独安排。

## Final evidence

production与full audit均0 moderate /0 high /0 critical，无接受的Moderate。新lockfile固定全部版本。验证包括npm ci、lint/typecheck、40 unit tests、build、六条migration、recovery真实DB、C8 deterministic25/25及baseline、C7 HTTP/DB边界与真实Provider容器TXT/PDF/private+mixed research/approval/source smoke。

Audit曾遇registry TLS中断，release:check正确失败为AUDIT_INCOMPLETE；不把网络错误当作0漏洞，恢复网络后重跑完整gate。实际最终命令与状态以作者验证报告为准。没有运行audit fix --force，没有升级React/MCP业务contract。
