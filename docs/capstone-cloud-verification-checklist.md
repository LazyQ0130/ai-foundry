# Capstone Cloud Verification Checklist

状态：NOT VERIFIED。当前没有可审查的Capstone云目标、生产配置和云存储权限证据。此清单是剩余必要工作，不是完成记录；本轮不创建收费资源或发布课程。

1. 确定独立Staging/Production项目、负责人和费用上限；选择实际部署平台，记录账户内真实资源标识（不记录秘密）。
2. 建立独立云PostgreSQL；核实版本、pgvector可用、TLS、连接限制和migration权限。部署六条正式migration并核对status、extension version、vector(1024)与scoped retrieval。
3. 建立私有R2/S3 bucket及限权凭据，关闭公共访问，配置准确生产origin的CORS。实际浏览器验证signed PUT/GET，匿名GET拒绝；不能用Node preflight代替浏览器。
4. 注入独立server-only环境和安全Secret，1024维度、real Provider模式，无TEST_DATABASE_URL、mock/test/local HTTP开关；运行production env checker。记录状态，不保存值。
5. 构建并部署已审查SHA/不可变image digest；验证公网HTTPS、health、PORT/non-root、PDF资源、代理请求时限和120秒有界workflow。
6. 验证真实HTTPS MCP：认证、固定协议/工具名单、真实Crossref查询、取消/超时边界；关闭本地HTTP例外。
7. 在Staging先跑synthetic Full Smoke：登录、TXT/PDF→READY、私人/混合研究、报告、Citation/Source、Proposal/Edit/Approve、Replay同一Note。检查structured logs无秘密/原文。
8. 公网Production运行现有production-smoke，显式opt-in、synthetic、最多60HTTP/8分钟/一个mixedRun；不得故障注入或破坏性清理。记录结果、耗时、调用数和绑定SHA。
9. 明确实际云DB备份/PITR可用性、保留窗口和restore目标。在独立Staging恢复并核对数据；保留上一不可变image digest，演练application rollback。检查schema compatibility和配置，不使用migrate reset；需要时forward fix或恢复到新DB。
10. 更新安全的release evidence：实际平台、环境、日期、源SHA/image digest、migration/vector、storage/browser CORS、HTTPS/MCP、Smoke、backup/rollback。所有未知项保持NOT VERIFIED。

官方流程已于本轮核对（不代表账户内执行）：[Render Postgres backups](https://render.com/docs/postgresql-backups)、[Render rollbacks](https://render.com/docs/rollbacks)、[Postgres extensions](https://render.com/docs/postgresql-extensions)、[R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/)。Render paid Postgres支持PITR到新的恢复实例；具体窗口依计划。Registry镜像应固定digest；回滚应用不等于回滚DB，也不保证环境组恢复到旧值。

完成以上证据后再单独复审云gate；课程正式开放还需要Publishing Integration Plan的服务端正文、权益、独立进度与附件验收。
