// PDF 处理工具函数

import * as fs from "fs";
import * as path from "path";
import { PdfReader } from "pdfreader";
import { WORK_DIR } from '../config';

// 提取 PDF 文本内容
export async function extractPdfText(pdfPath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const texts: string[] = [];
    new PdfReader().parseFileItems(pdfPath, (err, item) => {
      if (err) {
        console.error("PDF 解析失败:", err);
        reject(new Error("PDF 解析失败: " + err));
      } else if (!item) {
        // 解析结束，拼成一段文本
        let text = texts.join(' ').replace(/\s+/g, ' ').trim();
        if (text.length < 100) {
          reject(new Error("PDF 文本提取失败或内容过少"));
        } else {
          resolve(text);
        }
      } else if (item.text) {
        texts.push(item.text);
      }
    });
  });
}

// 工具函数：解析 PDF 并返回原始文本
export async function parsePdfToText(arxivId: string, paperInfo?: any): Promise<string> {
  try {
    const cleanArxivId = arxivId.replace(/v\d+$/, '');
    const pdfPath = path.join(WORK_DIR, `${cleanArxivId}.pdf`);
    const textPath = path.join(WORK_DIR, `${cleanArxivId}_text.txt`);

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF 文件不存在，请先下载: ${pdfPath}`);
    }

    if (fs.existsSync(textPath)) {
      console.log(`文本文件已存在: ${textPath}`);
      return fs.readFileSync(textPath, 'utf-8');
    }

    const pdfText = await extractPdfText(pdfPath);

    let outputContent = '';

    if (paperInfo) {
      outputContent += `=== 论文信息 ===\n`;
      outputContent += `标题: ${paperInfo.title}\n`;
      outputContent += `arXiv ID: ${arxivId}\n`;
      outputContent += `发布日期: ${paperInfo.published}\n`;

      if (paperInfo.authors && paperInfo.authors.length > 0) {
        outputContent += `作者: ${paperInfo.authors.map((author: any) => author.name || author).join(', ')}\n`;
      }

      outputContent += `摘要: ${paperInfo.summary}\n`;
      outputContent += `\n=== PDF 解析文本 ===\n\n`;
    }

    outputContent += pdfText;

    fs.writeFileSync(textPath, outputContent, 'utf-8');
    console.log(`文本文件已保存: ${textPath}`);

    return outputContent;
  } catch (error) {
    console.error("解析 PDF 时出错:", error);
    throw new Error(`PDF 解析失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}