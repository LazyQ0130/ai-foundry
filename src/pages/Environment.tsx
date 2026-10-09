import { Link } from 'react-router-dom'
import { LessonMarkdown } from '../components/LessonMarkdown.js'

// Tool downloads and provider-specific settings belong here, not in lesson bodies.
const environmentGuide = `
## 工具与安装

Stage 1 推荐使用 [WorkBuddy 官方下载页](https://www.workbuddy.cn)。它需要能打开本地项目文件夹、读取和保存文件；其他具备这些能力的 AI 开发工具也可以使用，按钮名称可能不同。

在工具中选择打开文件夹，选中解压后的 aifoundry-stage1-starter。确认能看到 app、components、lib 和 package.json；不要打开 ZIP 或只包含项目的外层文件夹。告诉 AI 先读取 package.json，核对项目 name 为 personal-knowledge-workbench。工具只回复代码时，明确要求保存到当前项目，再到浏览器验证。

从 [Node.js 官网](https://nodejs.org/en/download) 安装当前 LTS，并保留 npm。安装后重新打开终端，用 node -v 和 npm -v 检查。Stage 1 Starter 的历史最低版本是 18.18，新安装不要选择已停止维护的版本。后续 Starter 以各自 package.json 的 engines 为准。

## Chat 模型配置

以下是仓库课程参考实现已验证过的配置，不代表今天已重新执行云端调用，也不保证每个账号都能使用这些模型。模型可用性、额度和接入地址以自己的控制台为准。配置核对日期：2026-10-08；原始验证记录保留在仓库验收文档。

参考 Provider 为阿里云百炼 China (Beijing)，Chat 模型为 qwen3.7-flash。参考 [官方 API Key 与地域说明](https://help.aliyun.com/zh/model-studio/get-api-key)，使用自己北京地域 Workspace 的地址、Key 和额度，不能跨地域混用。

在学员项目被 Git 忽略的服务端 .env 配置：

\`\`\`text
AI_PROVIDER_MODE=real
AI_CHAT_BASE_URL=<自己北京地域 Workspace 的兼容接口 Base URL>
AI_CHAT_API_KEY=<仅在本机填写自己的 Key>
AI_CHAT_MODEL=qwen3.7-flash
AI_TIMEOUT_MS=20000
AI_CHAT_DISABLE_THINKING=1
\`\`\`

未配置真实模式时先用 mock 完成确定性验收。参考 Adapter 的超时范围为 1000～30000 ms，普通回答固定 max_tokens:256；AI_CHAT_DISABLE_THINKING=1 只在实现明确支持的模型上发送 enable_thinking:false。替换模型前检查 Adapter、参数兼容性和回归测试，不能只换名字就假定兼容。

## Embedding 配置

参考 Embedding 模型为 text-embedding-v4，维度 1024。Chat 和 Embedding 配置独立，在同一学员项目的服务端 .env 追加：

\`\`\`text
AI_EMBEDDING_BASE_URL=<自己北京地域 Workspace 的兼容接口 Base URL>
AI_EMBEDDING_API_KEY=<仅在本机填写自己的 Key>
AI_EMBEDDING_MODEL=text-embedding-v4
AI_EMBEDDING_DIMENSION=1024
\`\`\`

课程数据库、检索过滤和参考测试按 1024 维设计。模型或维度变化时需要验证数据库兼容性并重新建立对应索引；不要混用 Mock 与 Real 或不同模型的向量，不要截断或补零掩盖不匹配。

## Agent 兼容与配置安全

Stage 4 沿用上面的 Provider 配置。参考实现保留 tool_choice=auto、enable_thinking=false、parallel_tool_calls=false；真实模型可能直接回答，记录实际路径，不强制工具调用来凑验收计数。

Key、数据库地址、Session Secret 和审批 Secret 只留在服务端，不使用 NEXT_PUBLIC_ 前缀，不粘贴给 AI，不放入日志、截图或 Git。保存配置后检查 git status，确认 .env 被忽略，并重启本地服务。

更换 AI 开发工具通常不需要改项目；更换 Provider 或模型则必须重新验证结构化输出、流式、Embedding 和 Tool Calling。环境页集中记录推荐值，代码与测试仍承担兼容性校验。
`

export default function Environment() {
  // Stable anchors let lessons link to the specific setup they need.
  const sections = ['tools', 'chat', 'embedding', 'agent']
  const parts = environmentGuide.trim().split(/(?=^## )/m)
  return <section className="shell py-10 sm:py-14">
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-brand-700">开始之前 · 免费公开</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">课程环境说明</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">工具下载、已验证模型和环境变量集中在这里。正文中的操作示意帮助理解步骤，实际按钮以你安装的版本为准。</p>
      <nav aria-label="环境说明目录" className="my-6 flex flex-wrap gap-3 text-sm text-brand-700">
        {['工具安装', 'Chat 模型', 'Embedding', 'Agent 与安全'].map((title, i) => <a key={sections[i]} href={`#${sections[i]}`} className="underline">{title}</a>)}
      </nav>
      {parts.map((body, i) => <div id={sections[i]} key={sections[i]} className="scroll-mt-24"><LessonMarkdown body={body} /></div>)}
      <Link to="/lesson/stage-1/s1-l0" className="btn btn-primary mt-6">从第 0 课开始</Link>
    </div>
  </section>
}
