import * as path from "path";
import { WORK_DIR } from '../config/config.js';
import { searchArxivPapers, downloadArxivPdf } from '../tools/arxiv';
import { parsePdfToText } from '../tools/pdf';

// 完整流程处理 arXiv 论文
export async function processArxivPaper(arxivId: string): Promise<string[]> {
  const results = [];
  let paperInfo = null;

  try {
    results.push("步骤 0: 获取论文信息...");
    const searchResults = await searchArxivPapers(arxivId, 1);
    if (searchResults.papers.length > 0) {
      paperInfo = searchResults.papers[0];
      results.push(`✅ 论文信息获取成功: ${paperInfo.title}`);
    }
  } catch (error) {
    results.push(`⚠️ 论文信息获取失败，将使用基础信息处理`);
  }

  results.push("步骤 1: 下载 PDF...");
  await downloadArxivPdf(arxivId);
  results.push(`✅ PDF 下载完成`);

  results.push("步骤 2: 解析 PDF 并提取文本内容...");
  await parsePdfToText(arxivId);
  const textPath = path.join(WORK_DIR, `${arxivId.replace(/v\d+$/, '')}_text.txt`);
  results.push(`✅ PDF 文本提取完成，文件: ${path.basename(textPath)}`);

  results.push(`\n🎉 论文 ${arxivId} 处理完成！所有文件保存在: ${WORK_DIR}`);

  if (paperInfo) {
    results.push(`\n📄 论文信息：`);
    results.push(`标题: ${paperInfo.title}`);
    results.push(`作者: ${paperInfo.authors.map((author: any) => author.name || author).join(', ')}`);
    results.push(`发布时间: ${paperInfo.published}`);
  }

  return results;
}
