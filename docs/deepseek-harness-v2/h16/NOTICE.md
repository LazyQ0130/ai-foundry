# H16 来源与许可

官方实现从固定DeepSeek Harness源码缓存导入，未修改、未打包node_modules或上游完整测试套件。[上游](SOURCE-LICENSE.txt)、[Cordis](CORDIS-LICENSE.txt)、[Zod](ZOD-LICENSE.txt)、[Chokidar](CHOKIDAR-LICENSE.txt)、[Koffi](KOFFI-LICENSE.txt)、[YAML](YAML-LICENSE.txt)、[SDK Client](MCP-CLIENT-LICENSE.txt)、[SDK Server](MCP-SERVER-LICENSE.txt)、[SDK Core](MCP-CORE-LICENSE.txt)、[Turndown](TURNDOWN-LICENSE.txt)、[GFM](GFM-LICENSE.txt)、[diff](DIFF-LICENSE.txt)许可随交付保留。

讲解、四图和题目本轮制作。FixtureShell参考官方tool-pwsh/tests/tools.spec.ts的可控句柄边界，明确为替身；MCP Server使用实际SDK并返回虚构数据。File只替换暂存清理钩子，保留真实文件原语；Node解析hook不替换官方实现。结构性Agent只用于组件夹具，综合程序用真实AgentLoop。
