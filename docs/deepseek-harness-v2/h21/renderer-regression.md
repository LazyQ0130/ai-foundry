# Renderer、三宽度与配图验收

12项既有 `tests/lesson-renderer.test.ts` 回归通过，使用当前工作区的实际Parser、LessonMarkdown及CSS；没有更改Renderer或覆盖用户改动。完整TAP见[evidence/renderer-regression.txt](evidence/renderer-regression.txt)。本课新增内容检查另验五元数据、四任务键全局唯一、四图、十二折叠答案、九完整程序同步、无新弃用事件读取及SSR一致。

真实React作者夹具在1440/390/320三宽度挂载，检查唯一H1、无页面横向溢出、图片加载及caption、全部折叠键盘开合、12题答案、四图原图弹出、长代码横滚、九完整程序复制与文件逐字一致。每宽度9次复制共27次；计数只是操作数，不表示27个独立场景。结果见[evidence/visual-qa.json](evidence/visual-qa.json)，截图在figures/qa。

静态HTML由实际组件SSR，保留原生details，移除不可用的未水合复制按钮；图片映射相邻私有PNG。三宽度另核静态预览无溢出和四图完整。它不挂产品路由、不改public，不说明线上鉴权媒体已接通。

四SVG经headless Chrome以Microsoft YaHei字体重绘PNG，逐项核中文字体、文字越界和相互重叠，保留生成源与脚本。最小图中文字在320内容宽约12.6px；作者实际查看四张320图、长答案与桌面入口，未发现裁切、重叠或箭头/图注方向冲突。实际样本及SHA256见[evidence/manual-review.json](evidence/manual-review.json)。低视力、更多设备和真实学员舒适性仍待试读。

本地交互检查不证明登录产品页、进度API、线上媒体权限、真实学习效果或发布已获验收。最终截图与当前正文身份由final-audit再次核对；若源/图/正文再变，需重验受影响范围。
