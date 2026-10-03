import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";

export const researchReferenceInputSchema = z.strictObject({ topic: z.string().trim().min(1).max(80) });
export const researchReferenceOutputSchema = z.strictObject({
  topic: z.string().trim().min(1).max(80),
  referenceId: z.string().regex(/^ref-[a-z-]{1,40}$/),
  summary: z.string().trim().min(1).max(300),
});

export function publicReference(topic: string) {
  const key = topic.toLowerCase();
  const reference = key.includes("rag") ? {
    referenceId: "ref-rag", summary: "RAG 在生成回答前检索相关资料，并将检索结果作为回答依据。",
  } : key.includes("git") ? {
    referenceId: "ref-git", summary: "Git 记录代码版本；提交和引用历史帮助定位可恢复的状态。",
  } : key.includes("mcp") ? {
    referenceId: "ref-mcp", summary: "MCP 定义应用与外部能力之间的标准化发现和调用方式。",
  } : { referenceId: "ref-general", summary: "这是一条课程自建的公开参考。请结合可靠资料继续核对主题。" };
  return researchReferenceOutputSchema.parse({ topic, ...reference });
}

export function buildResearchReferenceServer() {
  const server = new McpServer({ name: "aifoundry-public-reference", version: "1.0.0" });
  server.registerTool("research_reference", {
    description: "Return one public, deterministic reference. No user data or private knowledge is available.",
    inputSchema: researchReferenceInputSchema,
  }, async (raw) => {
    const { topic } = researchReferenceInputSchema.parse(raw);
    return { content: [{ type: "text", text: JSON.stringify(publicReference(topic)) }] };
  });
  return server;
}

export const researchReferenceHandler = createMcpHandler(buildResearchReferenceServer);
