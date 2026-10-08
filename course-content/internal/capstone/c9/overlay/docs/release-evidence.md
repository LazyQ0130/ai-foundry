# Release evidence

状态必须为 PASS / FAIL / NOT VERIFIED。没有真实部署，留空 deployed SHA，不能使用代码提交 SHA 假装已部署。

| 字段 | 当前记录 |
|---|---|
| Date | 2026-10-08 |
| Environment | LOCAL PRODUCTION-LIKE VERIFIED / CLOUD DEPLOYMENT NOT VERIFIED |
| Source commit | C9 delivery change set over 9d3e637e3d8751eb95a8efa3f4f78197cfb53bdb；提交后用 git log -1 固定源 SHA，不能作为云部署 SHA |
| Deployed commit / image digest | NOT VERIFIED |
| Database migrations / vector | Local PASS：两套独立空 DB 六条 migration；vector0.8.6 / vector(1024) / scoped retrieval |
| Private storage anonymous / signed | Local Garage PASS：signed GET200 / anonymous denied；Production R2 NOT VERIFIED |
| HTTPS / browser CORS / MCP HTTPS | NOT VERIFIED |
| Auth / upload / READY | Local Docker+real Provider PASS：synthetic TXT/PDF；final image register201/login200/create201/anonymous401 |
| Private / external research | Local real PASS：private Run7 / mixed Run8；2 Runs，33 HTTP calls，34361ms；cloud NOT VERIFIED |
| Citation / source | Local PASS：private2/mixed3 Citation（external2）；两个签名原文件200，匿名拒绝 |
| Proposal / approval / replay one Note | Local PASS：Proposal前0 Note，approve/replay后每Run1 Note |
| Recovery dry/apply/idempotency | Local PASS：fresh/recent/completed保护，stale Run/Step终态，PROPOSED不变，并发/重复幂等；最终dry-run eligible0/applied0 |
| Eval commit / baseline / hard gates | C9 reviewed source tree（同上base+delivery diff）：25/25，Hit@3 10/10，MRR0.95，八项门0，37项baseline unchanged；提交后在作者运行记录绑定SHA |
| Backup restore / rollback | NOT VERIFIED |

## Build fingerprints

- Lock SHA256: `a4c54121bab41cc8f77d0298b3e7042b4ceefe190d5643f74ef6c7ec9f84cdbe`。
- Real full smoke runtime image: `sha256:03c4173b3e639b31a7d748704ba3dc585e8d11abbef5732fd758643d2f052bbe`。
- Final runtime image: `sha256:0686747873bfdb19f240c9d4991ed3a2293086bacd7bed3e7b2002a8fb994a4b`，127198826bytes，USER node；补充 recovery 用户提示后，health/auth/task持久化/匿名边界通过。完整real smoke的服务端逻辑与此版本相同。
- 基础 Node22 image digest固定在Dockerfile。release target单独构建并在容器内跑migration status，六条up-to-date。

## Failures retained

初轮Docker因没有public目录失败，修为build时mkdir后通过。全新npm ci后release script先导入未生成Prisma client，修正generate→C8 guard顺序后通过。Audit registry TLS中断时gate失败，恢复后production/full均0。真实Provider前两次MODEL_FAILED被安全终结；未放宽校验/自动重试，后续明确区分private/mixed问题的受控smoke通过。不能从一次成功推导成功率。

保留C8历史real默认8/9、optionalJudge9/9、lexical_fidelity_flags=1及人工语义复核；本轮没有重跑完整paid real Eval。Staging云端、Production、浏览器CORS和备份恢复/rollback均NOT VERIFIED。

关键云项未知就不能称 Production Ready。不要粘贴账号、secret、cookie、token、signed URL、private text。
