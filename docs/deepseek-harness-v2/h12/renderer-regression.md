# H12 Renderer与三宽度回归

已有[9项Renderer回归](evidence/renderer-tests.tap)全部通过，实际LessonMarkdown与指令插件未修改。新增检查使用实际parseLessonContent、SSR、React挂载和平台CSS，不是另造的阅读器。

[content-check](evidence/content-check.json)核五项元数据、四个全库唯一checkKey、7段完整程序逐字同步、落盘HTML与当前SSR一致；AST核23个真实类成员、ToolCallBlock/FinishReasonMap/GenerateOptions的确切字段、StreamChunk七分支及两个记录展开/组装函数。AST只校所属关系与结构，不独自证明执行语义。

| 宽度 | 页面与图 | 真实交互 |
| --- | --- | --- |
| 1440 | documentWidth=1440；4图加载、alt与图注存在 | 7段完整代码精确复制、21折叠键盘开合、10思考答案、4原图decode通过 |
| 390 | documentWidth=390；无页面横溢 | 同上；长程序在自身pre容器横滚 |
| 320 | documentWidth=320；无页面横溢 | 同上；完整程序能滚到末端 |

剪贴板逐一比对完整文件LF规范化文本，不用按钮存在代替复制成功。静态HTML保留原生details和可选择代码，不显示未水合复制按钮；React夹具验证真正的复制状态。原图链接实际打开并加载，无console/page error或网络资源失败。见[浏览器原始结果](evidence/visual-qa.json)。

四个SVG均中文字体现成、文字不出界/不重叠；640宽最小28px，1440课页图内约33.25px，390约15.66px，320约12.60px。最终作者实际看过21张定点图：4图×3宽度加导语/答案/展开程序各3宽度；[逐项哈希记录](evidence/manual-review.json)说明具体观察。另留3张整页截图，未逐像素看，不计入21。

纵图延续H09–H11风格，图1并列职责、图2/3明确时间顺序、图4独立分支；没有把所有卡片连成一次调用。作者看图不等于独立外审；12.6px也不证明所有人舒适，原图与正文提供替代读法。没有测试产品登录态、进度API、线上媒体鉴权或外部GUI。
