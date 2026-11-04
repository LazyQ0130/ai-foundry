# 16张核心教学图索引

历史图只建立文件索引与hash，本轮没有重新做H17–H19视觉审查；H20四图有当前三宽度/人工样本。

|课程/图|图与源|已有图注|PNG SHA256|
|---|---|---|---|
|h17-01|[PNG](../../h17/figures/h17-01.png) / [SVG](../../h17/figures/source/h17-01.svg)|上半部比较两种保存对象；下半部只展开事件方案。待办事件为教学类比，实际实验用真实 turn/start、turn/end。|ef78648cb8327602d0d6728ac309fb215a78806ab975218525825fb6ae47f48f|
|h17-02|[PNG](../../h17/figures/h17-02.png) / [SVG](../../h17/figures/source/h17-02.svg)|实践B第一次合法替换的精确节点。原日志由6条增长为7条，模型消息由4条变3条；Surface节点5因空内容不产出消息。|79702c433cda79251163d741cb1d6e4a0deba9c152b27977289adf8e1ace4b6f|
|h17-03|[PNG](../../h17/figures/h17-03.png) / [SVG](../../h17/figures/source/h17-03.svg)|三个读法共享一份前缀，框为并列读模型，不是先后调用链。模型历史由Surface负责，不能把它说成随意注册的业务Projection。|d22f3f8a38f187d6315eacc374352f0fd686e747fd3dcc000db7db001f332a90|
|h17-04|[PNG](../../h17/figures/h17-04.png) / [SVG](../../h17/figures/source/h17-04.svg)|按实践D真实seq分段；框内按顺序，跨框为时间推进。实时帧、Session事实与flush边界分列，flush框表示概念接口，未在该Loop夹具挂持久后端。|a457a80f18208993f20033160d4e3fedc17eac207cac57617bc830fc01bf8c6d|
|h18-01|[PNG](../../h18/figures/h18-01.png) / [SVG](../../h18/figures/source/h18-01.svg)|职责分层而非多个进程。工厂取得逐会话writer，Backend路由事件；普通Session存在并不证明已有写句柄。|b6592571eff2df9d3a49161cc7c55916ff339d0ad5684f9f1ecb42b8ef79a015|
|h18-02|[PNG](../../h18/figures/h18-02.png) / [SVG](../../h18/figures/source/h18-02.svg)|上方通用契约，下方JSONL路由路径。200ms是内部批写窗口；同步实现经过源码核读，真实往返不等于断电认证。|e2921ca2b2a434c53aeecc3a052388f1f2f38f65e21d752cc1ab63a84ea2a1b3|
|h18-03|[PNG](../../h18/figures/h18-03.png) / [SVG](../../h18/figures/source/h18-03.svg)|正常和两种开放尾是独立分支。先由后端得到有效字节记录，再由Agent恢复层追加语义closer；不删除完整旧事实。|2c358d8e14953eee547e713487fe668117ddeb4e097b154814747e770bfc3ccd|
|h18-04|[PNG](../../h18/figures/h18-04.png) / [SVG](../../h18/figures/source/h18-04.svg)|精确采用X的Seq9切点：marker先于forked closer。父子未来独立，没有工具重放箭头；普通Fork与持久Agent分支接线分开解释。|a2f1296dda3e6edfbf57a7a1fa2063868d785989c3b0ebbf0a076f436e41969d|
|h19-01|[PNG](../../h19/figures/h19-01.png) / [SVG](../../h19/figures/source/h19-01.svg)|综合X真实位置：旧事实不删；37是摘要user替换，36是仅日志summary。保存后由新后端实例Resume核对。|8fa213f8c6b7c7d22a7856eea9db673e2bf6890e7302b16b2f61ad4a38b9eb21|
|h19-02|[PNG](../../h19/figures/h19-02.png) / [SVG](../../h19/figures/source/h19-02.svg)|数字来自resolveCompactSpec。Usage锚点、路由价格和固定启发式共同形成measure；UI参考值不替代该决策。|dcd7120494835e590c4e2ae750663df075c47d048d3930ceea529505839f487f|
|h19-03|[PNG](../../h19/figures/h19-03.png) / [SVG](../../h19/figures/source/h19-03.svg)|有日志标记的尝试，不是能整体回滚的数据库事务。end-seed之前的残留start视为旧生命周期证据。|09e5136dbe3deb78c393b692236d1007b17ddc32979826a3984e234aa8b32e1c|
|h19-04|[PNG](../../h19/figures/h19-04.png) / [SVG](../../h19/figures/source/h19-04.svg)|Pruner字符按Unicode码点，Token启发式按UTF-16；图片是持久投影决定，不是摘要或物理删附件。|bbe1556950949710aad1f58cbcdcdeff13151e4c36d2dade714fc510a5f94bc5|
|h20-01|[PNG](../figures/h20-01.png) / [SVG](../figures/source/h20-01.svg)|故障分类是决策起点。每条事实的记录、模型可见性、重试与副作用要分别取证；不是所有错误都到request-error。|ae28f891e86956701ef09cee2eae1b5384af41178a659212feb9945d045b9fc0|
|h20-02|[PNG](../figures/h20-02.png) / [SVG](../figures/source/h20-02.svg)|数字来自真实A轨迹。计划、等待结束、请求尝试、最终成功分别是不同事实；本课用虚拟时间推进真实定时器调用。|5dee63df7056fc10a031630b295acaf614a2cc4724f6f740b43a62aa8f0a2cde|
|h20-03|[PNG](../figures/h20-03.png) / [SVG](../figures/source/h20-03.svg)|取消是控制信号，不是成功证明或副作用回滚。started工具不响应signal时，平台仍等待其Promise；本课门控后明确放行。|59b7b5b20481c72950ee3af50c7d0e7cde271f3f65b30f4eafbbc88752645b61|
|h20-04|[PNG](../figures/h20-04.png) / [SVG](../figures/source/h20-04.svg)|同一原始前缀在原任务与中断副本拥有不同未来。副本的合成结果保留未知性；幂等键示例是教学策略，不是Harness对所有工具的自动保证。|b740613db9106291823aae7c36c314785158a2c29d413be27af113916df6456d|
