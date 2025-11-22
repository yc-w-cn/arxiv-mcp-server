import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod/v3';

// 导入配置和服务
import { validateEnvironment, initializeWorkDir } from './config';
import { searchArxivPapers, downloadArxivPdf } from './tools/arxiv';
import { parsePdfToText } from './tools/pdf';
import { processArxivPaper, clearWorkdir } from './services';

// 验证环境变量并初始化工作目录
validateEnvironment();
initializeWorkDir();

// 创建 MCP 服务器
const server = new McpServer({
  name: "arxiv-mcp-server",
  version: "1.1.6",
});

// 注册工具处理器
server.registerTool(
  "search_arxiv",
  {
    title: "搜索 arXiv 论文",
    description: "搜索 arXiv 论文",
    inputSchema: z.object({
      query: z1.string().describe("搜索英文关键词"),
      maxResults: z.number().default(5).describe("最大结果数量")
    })
  },
  async ({ query, maxResults }) => {
    try {
      const results = await searchArxivPapers(query, maxResults || 5);
      return {
        content: [{
          type: "text",
          text: `找到 ${results.papers.length} 篇相关论文（总计 ${results.totalResults} 篇）：\n\n${results.papers.map((paper, index) =>
            `${index + 1}. **${paper.title}**\n   ID: ${paper.id}\n   发布日期: ${paper.published}\n   作者: ${paper.authors.map((author: any) => author.name || author).join(', ')}\n   摘要: ${paper.summary.substring(0, 300)}...\n   URL: ${paper.url}\n`
          ).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `搜索 arXiv 论文失败: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "download_arxiv_pdf",
  {
    title: "下载 arXiv PDF",
    description: "下载 arXiv PDF",
    inputSchema: z.object({
      input: z.string().describe("arXiv ID 或 URL")
    })
  },
  async ({ input }) => {
    try {
      const pdfPath = await downloadArxivPdf(input);
      return {
        content: [{
          type: "text",
          text: `PDF 下载成功: ${pdfPath}`,
          file: require('path').basename(pdfPath)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `下载 arXiv PDF 失败: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "parse_pdf_to_text",
  {
    title: "解析 PDF 文本",
    description: "解析 PDF 文本",
    inputSchema: z.object({
      arxivId: z.string().describe("arXiv ID")
    })
  },
  async ({ arxivId }) => {
    try {
      const extractedText = await parsePdfToText(arxivId);
      return {
        content: [{
          type: "text",
          text: extractedText,
          file: `${arxivId.replace(/v\d+$/, '')}_text.txt`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `解析 PDF 文本失败: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "process_arxiv_paper",
  {
    title: "处理 arXiv 论文",
    description: "处理 arXiv 论文",
    inputSchema: z.object({
      arxivId: z.string().describe("arXiv ID"),
      includeWechat: z.boolean().default(true).describe("是否包含微信格式")
    })
  },
  async ({ arxivId, includeWechat }) => {
    try {
      const results = await processArxivPaper(arxivId, includeWechat || true);
      return {
        content: [{
          type: "text",
          text: results.join('\n')
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `处理 arXiv 论文失败: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "clear_workdir",
  {
    title: "清理工作目录",
    description: "清理工作目录",
    inputSchema: z.object({})
  },
  async () => {
    try {
      const { removed, message } = clearWorkdir();
      return {
        content: [{
          type: "text",
          text: message,
          files: removed
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `清理工作目录失败: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// 启动服务器
console.log("启动 ArXiv MCP Server...");

const transport = new StdioServerTransport();
await server.connect(transport);

console.log("🚀 ArXiv MCP Server 已启动，等待连接...");