# H14 前置知识与交接

此文件只交接，不是 H14 正文、实验或开发启动。

进入 H14 前，学员应能独立解释四层：定义在哪里登记；当前 Scope 解析到哪份；本 Step 准入哪次注册；实际调用前身份是否仍有效。还应知道规范 JSON 值、output.render 内容、ToolResultMessage 与 Host 展示的区别，知道 timeoutMs 是声明、取消需要合作、注销不回滚已发生效果。

建议携带 H13 D 的 `sum-1` 轨迹：assistant/message → tool/call → 主体 → tool/result → 下一请求。原始 seq 和每次请求 prefix 都在 practice-output；通过第二个真实内存 Session 重建 Loop 请求，并单独对照 Runtime 投影后的 Adapter 输入。D_remove/D_replace/D_restrict 作为邻接反例：已有声明与合法参数，主体仍为0。

H14 的新问题应是“通过资格之后怎样形成最终权威结果”：输入快照与准备、前置决策/guard 位置、dispatch 与包装、并发/独占调度、post/project/finalize、错误归一化、观察与结果提交。H13 只解释字段与当前资格，虽真实运行 Native 流水线验证接口，没有完成这些扩展点的组合工程教学。

不要将 H13 某次成功或 unknown-tool 反例泛化成审批/OS 强制已验证。H15 负责审批、权限、守卫与沙箱，H16 负责文件/Shell/Web/MCP 的实际提供方差异。本次没有这些实验，也没有 E 级应用证据。若学生仍分不清 Schema/业务/权限，回看 H13 的 A/C 四问表，不要求先读 H15 补救本课缺口。

建议前置自检：能解释 C 的同对象重登记失效、D_retry 的两Step三请求、ToolCallBlock.id 与 message.toolCallId 关联；能明确哪些是 Session 事实、哪些是作者观察。阈值与课时仍待实际学员验证。
