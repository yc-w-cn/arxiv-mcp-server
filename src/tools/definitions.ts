// 工具定义

export const toolDefinitions = {
  listChanged: false,
  tools: [
    {
      name: "search_arxiv",
      description: "搜索 arXiv 论文",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "搜索英文关键词"
          },
          maxResults: {
            type: "number",
            description: "最大结果数量",
            default: 5
          }
        },
        required: ["query"]
      }
    },
    {
      name: "download_arxiv_pdf",
      description: "下载 arXiv PDF 文件",
      inputSchema: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "arXiv 论文URL（如：http://arxiv.org/abs/2403.15137v1）或 arXiv ID（如：2403.15137v1），优先使用URL"
          }
        },
        required: ["input"]
      }
    },
    {
      name: "parse_pdf_to_text",
      description: "解析 PDF 并返回原始文本内容",
      inputSchema: {
        type: "object",
        properties: {
          arxivId: {
            type: "string",
            description: "arXiv 论文ID"
          }
        },
        required: ["arxivId"]
      }
    },
    {
      name: "convert_to_wechat_article",
      description: "转换为微信文章格式",
      inputSchema: {
        type: "object",
        properties: {
          arxivId: {
            type: "string",
            description: "arXiv 论文ID"
          }
        },
        required: ["arxivId"]
      }
    },
    {
      name: "parse_pdf_to_markdown",
      description: "解析 PDF 并返回 LLM 翻译后的中文 Markdown 文件",
      inputSchema: {
        type: "object",
        properties: {
          arxivId: {
            type: "string",
            description: "arXiv 论文ID"
          }
        },
        required: ["arxivId"]
      }
    },
    {
      name: "process_arxiv_paper",
      description: "完整流程处理 arXiv 论文（搜索、下载、解析、转换）",
      inputSchema: {
        type: "object",
        properties: {
          arxivId: {
            type: "string",
            description: "arXiv 论文ID"
          },
          includeWechat: {
            type: "boolean",
            description: "是否生成微信文章",
            default: true
          }
        },
        required: ["arxivId"]
      }
    },
    {
      name: "clear_workdir",
      description: "清空工作区所有文件（危险操作）",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    }
  ]
};