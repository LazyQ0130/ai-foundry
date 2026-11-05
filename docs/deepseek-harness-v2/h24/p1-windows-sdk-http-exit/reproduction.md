# 原问题和最小复现

所有命令从AI Foundry根执行。只使用本轮新隔离目录；禁止清理已有缓存、Record/Refresh或真实用户Home。

## 一：不依赖npm、SDK或Harness的原生最小例

```powershell
python -X utf8 docs/deepseek-harness-v2/h24/p1-windows-sdk-http-exit/scripts/run-standalone.py
```

它用外层Python启动minimal/native-repro.mjs，重复3次原Node与3次经SHA校验的官方Node24.22.1。脚本只建127.0.0.1:0服务，固定重定向直到fetch按限制拒绝，关闭Listener及所有连接后调用process.exit(0)。原Node3次均输出EXIT_EVENT requested=0，随后同原生断言、实际exit3221226505；新官方Node3次exit0。外层重新bind每个端口，证明测试自有监听已释放。初始简单fetch/HTTP request/普通Listener退出对照均过，不能概括成“任何fetch都必崩”。

## 二：真实原作者组合默认出口

```powershell
$env:H24_P1_LOADER='pinned'
node docs/deepseek-harness-v2/h24/p1-windows-sdk-http-exit/scripts/probe-composition.mjs D
```

默认variant=default，不安装exit钩子，SDK YAML行直接指向固定packages/sdk/server/src/index.ts。最初的等价具名re-export对照也保留。它复制H24实验到新scratch，经真实Loader/AppBoot和真实SDK子进程执行D7/D1；D1重现后即按原exit0断言变红，未继续伪称整组通过。底层原始stdout/stderr和trace均留新专项。

diag orchestrator的exit0只说明它成功保存观测；必须看run中的runnerExit/exit和wire.exit。测试driver exit1与实际SDK child exit3221226505是不同层；不能只看顶层shell退出码。原始SDK shutdown响应已到，实际子进程终态仍失败。

## 三：全新正式锁依赖对照

scripts/install-clean.py只在全新目录复制已对固定pnpm逐项核验的8棵package.json/package-lock，使用新private-npm-cache和ignore-scripts安装。每个输入锁安装前后hash一致、无removed输出；不允许已有node_modules。预先准备一次，重复复现可复用evidence/clean-anchors.json，不需要重复安装。

```powershell
$a=Get-Content docs/deepseek-harness-v2/h24/p1-windows-sdk-http-exit/evidence/clean-anchors.json -Raw | ConvertFrom-Json
foreach($p in $a.PSObject.Properties){[Environment]::SetEnvironmentVariable($p.Name,$p.Value,'Process')}
$env:H24_P1_LOADER='pinned'
node docs/deepseek-harness-v2/h24/p1-windows-sdk-http-exit/scripts/probe-composition.mjs D
```

source-lock与所有直接/传递版本及integrity在运行前检查。普通试验不允许off-pin；仅显式H24_P1_FORENSIC=1、且为三个已核cache tarball版本时允许历史重建候选，标FORENSIC_NOT_OFFICIAL，不作为干净验收。

## 实际运行链

HarnessClient用Node启动sdk-entry.mjs --profile h24-fixture；入口配置加载h24-fixture manifest（bundles=[]）和真实cordis.yml。14行核心包括LLM、Session、Projection、SystemPrompt、Tools、Native Executor、Agent Registry、FSLocal、WorkingDirectory、JSONL、fixture、Loop、Retry、SDK。

HTTP Listener在父测试进程，由官方startMockLlmServer创建；子级fixture插件注册真实DeepSeekAdapter并拥有undici Agent。调用是父SDK→子SDK Server/Loop→回环Messages/SSE→工具/JSONL。**没有挂packages/host/webserver**，不存在“SDK dispose应关闭父进程Listener”的所有权关系。父finally关闭自己Listener/Socket并重新bind，子进程观察器另等真实close。此作者核心Profile不是发行sdk或sdk-minimal完整树，最高D。

EOF用关闭已拥有子进程stdin，Dispose用隔离目录控制文件触发真实rootFiber.dispose；SIGTERM对照在Windows是TerminateProcess，单列强制观测，不当正常关闭。脚本始终有有界等待，timeout强杀只用于防止测试进程泄漏，绝不计正常PASS。所有临时目录保留。
