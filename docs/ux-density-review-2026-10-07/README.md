# Frontend Density Polish · 2026-10-07

本地 Vite + API 页面走查。截图由 `node scripts/capture-density-review.mjs` 生成，使用公开页面，不包含测试账号凭据。

| 页面 | 375×812 | 390×844 | 768×1024 | 1440×900 | 1440×1100 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Pricing | 无横向溢出 | 无横向溢出 | 无横向溢出 | 无横向溢出 | 无横向溢出 |
| Login / Register | 无横向溢出 | 无横向溢出 | 无横向溢出 | 无横向溢出 | 无横向溢出 |
| Projects | 无横向溢出 | 无横向溢出 | 无横向溢出 | 无横向溢出 | 无横向溢出 |
| Capstone | 无横向溢出 | 无横向溢出 | 无横向溢出 | 无横向溢出 | 无横向溢出 |
| Account | 无横向溢出 | 无横向溢出 | 无横向溢出 | 无横向溢出 | 无横向溢出 |

浏览器逐页核对 `document.documentElement.scrollWidth === clientWidth`。375 宽度下价格页只有 4 张阶段方案卡、1 张课程版卡、1 张项目版卡；比较组件只显示权益表。1440 宽度下 Capstone 八课为两行，四项能力为一行。390×844 购买弹窗的二维码完整处于首屏。

截图：

- `pricing-desktop.png`、`pricing-mobile.png`
- `login-desktop.png`、`login-mobile.png`、`register-mobile.png`
- `purchase-modal-desktop.png`、`purchase-modal-mobile.png`
- `projects-desktop.png`、`capstone-desktop.png`
