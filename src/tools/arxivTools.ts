// arXiv 相关工具函数

import { ArXivClient } from '@agentic/arxiv';
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { WORK_DIR } from '../config/config.js';

// 初始化 ArXiv 客户端
const arxivClient = new ArXivClient({});

// 工具函数：搜索 arXiv 论文
export async function searchArxivPapers(query: string, maxResults: number = 5): Promise<{totalResults: number, papers: any[]}> {
  try {
    const results = await arxivClient.search({
      start: 0,
      searchQuery: {
        include: [
          { field: "all", value: query }
        ]
      },
      maxResults: maxResults
    });

    const papers = results.entries.map(entry => {
      const urlParts = entry.url.split('/');
      const arxivId = urlParts[urlParts.length - 1];

      return {
        id: arxivId,
        url: entry.url,
        title: entry.title.replace(/\s+/g, ' ').trim(),
        summary: entry.summary.replace(/\s+/g, ' ').trim(),
        published: entry.published,
        authors: entry.authors || []
      };
    });

    return {
      totalResults: results.totalResults,
      papers: papers
    };
  } catch (error) {
    console.error("搜索 arXiv 论文时出错:", error);
    throw new Error(`搜索失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 工具函数：下载 arXiv PDF
export async function downloadArxivPdf(input: string): Promise<string> {
  try {
    let arxivId: string;
    let pdfUrl: string;

    if (input.startsWith('http://') || input.startsWith('https://')) {
      const urlParts = input.split('/');
      arxivId = urlParts[urlParts.length - 1];
      pdfUrl = input.replace('/abs/', '/pdf/') + '.pdf';
    } else {
      arxivId = input;
      pdfUrl = `http://arxiv.org/pdf/${arxivId}.pdf`;
    }

    const cleanArxivId = arxivId.replace(/v\d+$/, '');
    const pdfPath = path.join(WORK_DIR, `${cleanArxivId}.pdf`);
    
    if (fs.existsSync(pdfPath)) {
      console.log(`PDF 文件已存在: ${pdfPath}`);
      return pdfPath;
    }

    console.log(`正在下载 PDF: ${pdfUrl}`);

    const response = await axios({
      method: 'GET',
      url: pdfUrl,
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArXiv-MCP-Server/1.0)'
      }
    });

    const writer = fs.createWriteStream(pdfPath);
    response.data.pipe(writer);

    return new Promise<string>((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`PDF 下载完成: ${pdfPath}`);
        resolve(pdfPath);
      });
      writer.on('error', (error) => {
        console.error(`PDF 下载失败: ${error}`);
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }
        reject(error);
      });
    });
  } catch (error) {
    console.error("下载 PDF 时出错:", error);
    throw new Error(`下载失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}