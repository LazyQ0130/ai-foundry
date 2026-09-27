# Stage 1 Starter 课程资源交付

## 下载接口与权限

- `GET /api/course-assets/stage1-starter`：未登录 401；ACTIVE 登录用户即可下载（无需 Stage 1 entitlement）；禁用用户仍拒绝。复用现有 Session，没有改变 Auth 或数据模型。
- 第 0 课与 1.1 为 Preview；附件授权独立使用 `authenticated-preview` 策略。通用策略同时支持 `stage-entitlement` 和 `admin-only`，以后新增付费附件时显式声明。此规则取代最初的 Starter 付费限制，详见 `free-experience.md`。
- 固定服务端白名单指向 `starter/aifoundry-stage1-starter.zip`。请求不接受 filesystem path；任意 query 不改变文件映射。未知 ID、路径穿越、原型属性名均不能解析为资源。
- `Content-Type: application/zip`，`Content-Disposition: attachment; filename="aifoundry-stage1-starter.zip"`，`Cache-Control: no-store`。
- `GET /api/course-assets/stage1-starter/info` 公开格式与实际字节数，供 Preview 显示资源信息，不公开正文、路径或附件内容。
- ZIP 未放入 public/dist，Vite 也禁止直接访问 starter 目录。生产静态服务只使用 dist。

## 正文与打包

```md
:::resource{asset="stage1-starter"}
:::
```

资源块不允许填写其他属性、正文、路径或 URL。固定 registry 提供标题、说明、文件名和 API 地址。

第 0 课已移除 GitHub 仓库 URL、Code / Download ZIP、仓库权限说明、联系提供方兜底、ai-foundry-main/starter/stage-1 路径；改为课程内下载、解压、打开 aifoundry-stage1-starter，再验证根目录。原教学目标和 checklist keys 保持不变。

在网站仓库根目录运行 `npm run build:starter`。它按文件白名单生成 ZIP，网站 build 自动调用，`npm run check:starter` 和测试检查源文件同步。打包不包含依赖、构建缓存、环境变量文件、Git、日志、OS 临时文件，也不跟随符号链接。

```text
aifoundry-stage1-starter/
├─ app/
├─ components/
├─ lib/
├─ package.json
├─ package-lock.json
├─ README.md
├─ next.config.ts
├─ next-env.d.ts
├─ postcss.config.js
├─ tailwind.config.ts
└─ tsconfig.json
```

当前 ZIP 为 24,455 字节，界面显示约 24 KB。部署时需要将 starter/aifoundry-stage1-starter.zip 与后端一起交付，保持从仓库根目录启动。

## 依赖与验收（2026-09-27）

Next.js 15.1.6 → 15.5.26，保持 15.x；React / React DOM 19.0.0 → 19.0.8，满足 Next peer dependency。Tailwind 保持 3.x，lockfile 实际为 3.4.19。PostCSS 固定为 8.5.28，并通过 npm overrides 统一 Next 内部依赖，避免旧版间接依赖的安全提示。

官方依据：[Next.js 15.5.26 release](https://github.com/vercel/next.js/releases/tag/v15.5.26)、[PostCSS 安全修复](https://github.com/postcss/postcss/security/advisories/GHSA-fxqj-rqcc-2cmp)。未迁移 Next 16 或 Tailwind 4，也未修改 Starter 产品逻辑。

- 39 项测试通过，包含附件未登录/无权限/有效权限/Admin/撤销、响应 MIME 和文件名、ZIP 解压与内容一致、禁止文件排除、路径穿越/非法 ID，以及 Resource 语法白名单和伪造 HTML。
- 网站类型检查、构建、内容检查、public/dist 泄漏检查、编译后生产服务 smoke 全部通过。主前端包仍有原有体积提示。
- Starter npm install 显示 0 vulnerabilities、无 Next deprecated 提示；npm run build 和 npm run dev 成功。另将最终 ZIP 解压到全新验收目录，重新 npm install / build，均通过。
- 浏览器实测：9 张资料卡片；搜索 Excalidraw 得到 1 张；工具筛选得到 2 张；无结果提示；清空并恢复全部后回到 9 张。课程有意保留的总数显示逻辑未改动。
- 实测资源块未登录提示、授权账号下载。浏览器下载文件与服务器 ZIP 的 SHA-256 一致：D4E95406F8E3040C0C8A3E039EAE51C14882EDCBDCA645C02F2C8DC2185484FF。
- 桌面 1440px 和手机 390px 无整页横向溢出。截图保存在 preview/starter-resource-desktop.png 和 preview/starter-resource-mobile.png（本地验收文件，不提交）。

## 本轮文件清单

```text
course-content/stage-1/s1-l0.md
docs/lesson-renderer-v2.md
docs/starter-delivery.md
package.json
package-lock.json
scripts/build-starter.ts
scripts/starter-package.ts
scripts/check-bundle.ts
scripts/production-smoke.ts
server/app.ts
server/routes/course-assets.ts
src/data/courseAssets.ts
src/components/CourseResource.tsx
src/components/LessonMarkdown.tsx
src/lib/lessonMarkdown.ts
src/index.css
starter/aifoundry-stage1-starter.zip
starter/stage-1/package.json
starter/stage-1/package-lock.json
starter/stage-1/next.config.ts
starter/stage-1/next-env.d.ts
starter/stage-1/README.md
tests/course-assets.test.ts
tests/lesson-renderer.test.ts
vite.config.ts
```

未修改 29 节目录、Stage 2–4、Auth 架构、entitlement 数据模型、价格、进度计算、Starter 功能或 1.1 教学目标；未编写 1.2。
