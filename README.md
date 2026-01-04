# 📊 成绩条在线生成器 (Offline Grade Slip Generator)

一个高效、安全、且支持离线使用的成绩条生成工具。专为教师设计，可将 Excel 成绩表快速转换为易于裁剪的成绩条格式。
![React](https://img.shields.io/badge/React-18-blue.svg)![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)

## ✨ 核心特性

- **🔒 隐私安全**：所有数据处理均在您的浏览器本地进行，**绝不上传服务器**。
- **📶 离线可用**：支持 PWA 技术，安装后可在无网络环境下正常使用。
- **🧩 复杂表头支持**：支持选择连续多行作为复杂/级联表头。
- **📏 灵活结构**：支持“单人多行”模式，完美处理带评语、跨行数据的复杂表格。
- **🖨️ 打印优化**：提供专门的“打印优化”样式，加重边框线条，确保裁剪和阅读清晰。
- **🔄 合并单元格还原**：自动识别并保留原始表格中的合并单元格（如跨列评语）。

## 🚀 快速开始

### 运行环境
- Node.js 18.x +
- 现代浏览器（Chrome, Edge, Safari 等）

### 开发调试
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产构建
```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式处理**: Tailwind CSS + Framer Motion (动画)
- **Excel 处理**: 
  - `xlsx` (读取/解析)
  - `exceljs` (高级样式导出)
- **离线支持**: `vite-plugin-pwa` (Service Worker 管理)
- **图标库**: Lucide React

## 📖 使用指南

1. **上传文件**：选择您的 Excel 成绩表 (.xlsx / .xls)。
2. **选择表头**：在预览表格中点击行，选择要作为表头的行（支持多行）。
3. **设置参数**：
   - **间隔行数**：设置成绩条之间的空行，方便裁剪。
   - **单人行数**：如果一名学生的数据占多行，请在此设置。
   - **样式偏好**：推荐使用“打印优化”以获得更清晰的线条。
4. **预览导出**：检查前 3 条数据的生成效果，确认无误后点击“导出为 Excel”。