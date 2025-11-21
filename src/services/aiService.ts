// 工具函数：解析 PDF 并返回 LLM 翻译后的中文 Markdown
export async function parsePdfToText(arxivId: string): Promise<string> {
  try {
    const fs = require('fs');
    const path = require('path');
    const { WORK_DIR } = await import('../config/config.js');
    const { extractPdfText } = await import('../tools/pdfTools.js');
    
    const cleanArxivId = arxivId.replace(/v\d+$/, '');
    const pdfPath = path.join(WORK_DIR, `${cleanArxivId}.pdf`);
    const mdPath = path.join(WORK_DIR, `${cleanArxivId}_md_zh.md`);

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF 文件不存在，请先下载: ${pdfPath}`);
    }

    if (fs.existsSync(mdPath)) {
      return fs.readFileSync(mdPath, 'utf-8');
    }

    // 先解析出 PDF 的英文文本
    const pdfText = await extractPdfText(pdfPath);
    return pdfText;
  } catch (error) {
    console.error("PDF 转 Text 时出错:", error);
    throw new Error(`PDF 转 Text 失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}