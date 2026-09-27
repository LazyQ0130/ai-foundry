# Lesson Renderer V2 编写规范

课程文件保存在 `course-content/<stage>/<lessonId>.md`，只由服务端在权限验证后读取。不要导入前端源码、复制到 `public`，也不要使用可执行 MDX。

## 元数据

文件必须以 YAML frontmatter 开始。五个字段全部必填，拒绝未知字段、重复 YAML key、别名与自定义类型。

```yaml
---
estimatedTime: "15 分钟"
difficulty: "入门"
objective: "修改首页并确认变化。"
checklist:
  - "确认页面变化"
checkKeys:
  - "check-0123456789abcdef"
---
```

`checkKeys` 与 `checklist` 一一对应，key 必须唯一且符合 `check-` 加 16 位十六进制字符。已发布任务措辞调整时保留原 key；新任务才分配新 key。元数据服务于工作台，正文服务于阅读，不要互相替代。

## 文章正文

页面输出唯一 H1，正文从 `##`、`###` 开始；正文写 `#` 也会安全降为 H2。支持普通段落、粗体、斜体、行内代码、有序/无序列表、引用和 GFM 表格、任务列表、删除线。GFM 的勾选框只是静态示例，不与学习进度同步。

用空行分段，解释紧贴操作；不要把普通解释全部包进教学块。代码使用围栏，推荐 `bash`、`powershell`、`tsx`、`ts`、`json`、`text`。终端代码显示“终端”，其他显示语言名；提供复制按钮，长代码在块内横向滚动，Prompt 自动换行。

## 教学块

使用 remark-directive 的容器语法，注意标题属性外有花括号：

````md
## 第一次修改

先决定自己的标题，再把需求交给 AI。

:::prompt{title="修改首页标题"}

下面的代码块是要复制给 AI 的内容。

```text
请把首页中央标题改成「我的资料库」。
只修改这一处文字，完成后告诉我文件路径。
```

> 把示例标题换成自己想要的名字。

:::

## 页面变化以后

这里继续正常写解释，不需要放进卡片。

:::check
- 标题已经改变
- 其他区域保持原样
:::

:::deepdive{title="页面为什么会更新？"}
可选的深入解释，默认折叠。
:::
````

白名单：`prompt`、`task`、`concept`、`check`、`stuck`、`warning`、`deepdive`、`image-placeholder`。只支持可选 `title` 属性，不支持 class、id、style、事件等。Prompt 必须有且仅有一个直接子级非空代码块，复制按钮仅复制该块，不包含说明、备注和围栏。普通代码块不能放在 Prompt 的列表或引用中来代替主代码块。

- Prompt / Task：蓝色，参考需求 / 现在动手。
- Concept：紫色，当前必需的短概念说明。
- Check：绿色，可观察的检查结果。
- Stuck：琥珀色，症状和排查顺序。
- Warning：红色，只用于真实风险。
- DeepDive：灰色，原生 details/summary，默认折叠且支持键盘操作。

第一处 Prompt 自动获得 `lesson-prompt` 锚点；第一处 Stuck 为 `lesson-help`，后续同类型加数字后缀。不要自行插入 HTML 锚点。

## 图片与占位

```md
![终端显示 Ready 与 Local 地址](/course-media/stage-1/ready.png "启动成功后的终端")

:::image-placeholder{title="项目启动关系图"}
项目文件 → Node.js / Next.js → localhost → 浏览器。
:::
```

图片最大宽度跟随文章，使用 title 作为 caption，没有 title 时使用 alt。支持 `/course-media/` 下的图片或 HTTPS 图片；拒绝 data、javascript、协议相对地址。`public/course-media` 中的图片是公开素材，不能放完整付费课截图或其他受保护内容；需要私有图片时应另外设计鉴权资源接口。

只给作者看的制图说明可以保留为 `<!-- 配图建议：…… -->`，不会显示给学生。未制作的图片不要填写不存在的文件路径。本次迁移保留了原有配图注释，未制作图片。

## 安全与发布检查

原始 HTML 被跳过，Markdown 不执行 JS，链接协议受限，外链带 `noopener noreferrer`。正文中的冒号与普通文本不会被当作可执行功能。禁止引入 `rehype-raw` 或动态组件执行。

运行 `npm run typecheck`、`npm run build`、`npm test`、`npm run check:content`、`npm run check:bundle`。正文测试位于 `tests/lesson-renderer.test.ts`，访问和进度测试位于 `tests/learning.test.ts`。用真实课程页在桌面和手机宽度检查标题层级、代码滚动、Prompt 复制、DeepDive 折叠与任务勾选。
