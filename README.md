# Markdown Poster Studio

一个轻量的纯前端网页工具：输入 Markdown，实时渲染成多种海报风格，并导出为适合分享的长图 PNG。

## Preview

- 实时 Markdown 预览
- 3 套视觉模板切换
- 多种画布比例切换
- 导出当前海报为长图 PNG
- 桌面与移动端自适应布局

## Features

- 支持常用 GFM Markdown 渲染
  标题、列表、引用、代码块、表格、图片、链接都可直接预览
- 海报化视觉设计
  内置编辑部杂志风、现代品牌卡片风、便签拼贴风
- 长图导出优化
  针对代码块、表格和长内容做了导出宽高与样式修正
- 纯静态部署
  无需后端，直接打开或部署到静态托管即可使用

## Tech Stack

- `HTML`
- `CSS`
- `Vanilla JavaScript`
- [`marked`](https://github.com/markedjs/marked) for Markdown parsing
- [`DOMPurify`](https://github.com/cure53/DOMPurify) for sanitization
- [`html-to-image`](https://github.com/bubkoo/html-to-image) for PNG export

## Project Structure

- `index.html`
  页面结构与 CDN 依赖入口
- `style.css`
  布局、主题样式、导出态样式
- `main.js`
  Markdown 渲染、模板切换、导出逻辑
- `CHANGELOG.md`
  版本更新记录

## Getting Started

1. 克隆仓库
2. 进入项目目录
3. 用任意静态服务器打开

示例：

```bash
python3 -m http.server 4173
```

然后在浏览器访问 `http://localhost:4173`

## Usage

1. 在左侧输入或粘贴 Markdown 内容
2. 切换模板风格和画布尺寸
3. 在右侧查看实时预览
4. 点击“导出当前图片”生成长图 PNG

## Notes

- 依赖通过 CDN 加载，首次打开需要可访问外网
- 导出逻辑目前聚焦于“当前海报长图”，不包含整个编辑界面截图
- 如果内容里包含远程图片，导出前会等待图片加载完成

## Roadmap

- 增加更多海报模板
- 支持批量导出多模板图片
- 支持自定义主题变量
- 增加本地存储与历史草稿

## License

MIT
