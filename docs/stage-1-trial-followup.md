# Stage 1 试学后待验证事项

## 班级同步注册与限流

当前注册限制为每 IP 每分钟 5 次。校园网或机房共用出口 IP 时，正常学生可能从第 6 次请求开始收到 429。开展班级同步注册前，先在普通课堂网络实测请求量和误伤率，再按容量调整注册阈值或采用更细的账号、设备与 IP 组合约束。保留短时间频率限制、异常行为监测和必要的反滥用保护，不直接取消限流，也不使用宽泛 IP 白名单。429 应考虑提示“请求过于频繁，请稍后重试”，并在可确定时告知等待时间，避免学生误以为表单填错。

## 本机验证开发命令

WorkBuddy 报告中的 `npm run dev` 异常发生于无 TTY 环境，尚不能推断普通交互终端也会失败。本轮保留 `concurrently` 与 `tsx watch` 原命令。

在 Windows PowerShell 打开项目根目录，确认本地数据库和 `.env` 可用后运行 `npm run dev`（若遇 npm.ps1 策略提示，改用 `npm.cmd run dev`）。等待 Vite 与 API 的启动输出；在另一个终端运行 `Invoke-WebRequest http://localhost:3001/api/health`，并用浏览器打开 Vite 显示的 Local 地址，刷新后确认页面请求正常。按 `Ctrl+C` 结束。只有在普通交互终端复现 API 未监听时，再检查 `concurrently` 与 `tsx watch` 的组合行为。
