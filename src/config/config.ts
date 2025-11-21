// 配置文件

// 工作目录设置
export const WORK_DIR: string = process.env.WORK_DIR || '';

// 验证环境变量配置
export function validateEnvironment(): void {
  if (!WORK_DIR) {
    console.error("❌ 错误: 必须设置 WORK_DIR 环境变量");
    console.error("请设置工作目录，例如:");
    console.error("  export WORK_DIR=/path/to/your/work/directory");
    console.error("  或者在运行时指定: WORK_DIR=/path/to/dir node server.js");
    process.exit(1);
  }
}

// 初始化工作目录
export function initializeWorkDir(): void {
  try {
    if (!WORK_DIR) return;
    
    const fs = require('fs');
    if (!fs.existsSync(WORK_DIR)) {
      fs.mkdirSync(WORK_DIR, { recursive: true });
      console.log(`✅ 工作目录已创建: ${WORK_DIR}`);
    } else {
      console.log(`✅ 使用工作目录: ${WORK_DIR}`);
    }
  } catch (error) {
    console.error(`❌ 无法创建或访问工作目录 ${WORK_DIR}:`, error);
    console.error("请检查路径是否正确且有写入权限");
    process.exit(1);
  }
}