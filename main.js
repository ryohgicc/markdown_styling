const DEFAULT_MARKDOWN = `# 春季内容发布计划

> 把一段普通 Markdown，排版成更适合分享的视觉海报。

## 本周重点

- 完成官网改版的视觉文案
- 发布产品更新说明
- 整理一次用户访谈摘要

## 推荐节奏

1. 先写结构清晰的 Markdown
2. 再切换合适的海报模板
3. 最后导出 PNG 分享到社媒或群聊

---

### 示例代码

\`\`\`js
const post = {
  title: "Markdown Poster Studio",
  status: "ready",
};

console.log(\`Exporting: \${post.title}\`);
\`\`\`

### 数据表格

| 渠道 | 状态 | 负责人 |
| --- | --- | --- |
| 网站 | 进行中 | Lin |
| 社媒 | 待排期 | Chen |
| 邮件 | 已完成 | Mo |

[查看灵感库](https://example.com)
`;

const templates = [
  { id: "editorial", name: "编辑部杂志风", badge: "Editorial" },
  { id: "brand", name: "现代品牌卡片风", badge: "Brand" },
  { id: "scrapbook", name: "便签拼贴风", badge: "Scrapbook" },
];

const canvasPresets = [
  {
    id: "portrait",
    name: "海报竖版",
    className: "poster-size-portrait",
    exportWidth: 1080,
  },
  {
    id: "square",
    name: "社媒方图",
    className: "poster-size-square",
    exportWidth: 1080,
  },
  {
    id: "story",
    name: "故事长图",
    className: "poster-size-story",
    exportWidth: 1080,
  },
];

const state = {
  templateId: templates[0].id,
  presetId: canvasPresets[0].id,
  renderTimer: null,
  exportNode: null,
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  setupMarkdownParser();
  mountSwitchers();
  bindEvents();
  elements.markdownInput.value = DEFAULT_MARKDOWN;
  applyTemplate(state.templateId);
  applyPreset(state.presetId);
  renderMarkdown(elements.markdownInput.value);
});

function bindElements() {
  elements.markdownInput = document.getElementById("markdown-input");
  elements.previewContent = document.getElementById("preview-content");
  elements.posterFrame = document.getElementById("poster-frame");
  elements.previewTitle = document.getElementById("preview-title");
  elements.posterBadge = document.getElementById("poster-badge");
  elements.statusText = document.getElementById("status-text");
  elements.exportButton = document.getElementById("export-button");
  elements.resetButton = document.getElementById("reset-button");
  elements.templateSwitcher = document.getElementById("template-switcher");
  elements.presetSwitcher = document.getElementById("preset-switcher");
}

function setupMarkdownParser() {
  if (!window.marked) {
    updateStatus("Markdown 解析库加载失败，请检查网络后刷新。", true);
    return;
  }

  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: false,
    mangle: false,
  });
}

function mountSwitchers() {
  templates.forEach((template) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = template.name;
    button.dataset.templateId = template.id;
    elements.templateSwitcher.appendChild(button);
  });

  canvasPresets.forEach((preset) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = preset.name;
    button.dataset.presetId = preset.id;
    elements.presetSwitcher.appendChild(button);
  });
}

function bindEvents() {
  elements.markdownInput.addEventListener("input", () => {
    window.clearTimeout(state.renderTimer);
    state.renderTimer = window.setTimeout(() => {
      renderMarkdown(elements.markdownInput.value);
    }, 120);
  });

  elements.templateSwitcher.addEventListener("click", (event) => {
    const target = event.target.closest("[data-template-id]");
    if (!target) {
      return;
    }
    applyTemplate(target.dataset.templateId);
  });

  elements.presetSwitcher.addEventListener("click", (event) => {
    const target = event.target.closest("[data-preset-id]");
    if (!target) {
      return;
    }
    applyPreset(target.dataset.presetId);
  });

  elements.exportButton.addEventListener("click", () => {
    exportPreview().catch((error) => {
      console.error(error);
      updateStatus(error.message || "导出失败，请稍后重试。", true);
    });
  });

  elements.resetButton.addEventListener("click", () => {
    elements.markdownInput.value = DEFAULT_MARKDOWN;
    renderMarkdown(DEFAULT_MARKDOWN);
    updateStatus("已恢复示例内容。");
  });
}

function renderMarkdown(markdown) {
  const source = markdown.trim();

  if (!source) {
    elements.previewContent.innerHTML = `
      <div class="empty-state">
        <div>
          <h3>预览区域已就绪</h3>
          <p>在左侧输入 Markdown，这里会实时生成海报排版。</p>
        </div>
      </div>
    `;
    updateStatus("输入内容为空，已显示占位预览。");
    return "";
  }

  if (!window.marked || !window.DOMPurify) {
    elements.previewContent.innerHTML = `
      <div class="empty-state">
        <div>
          <h3>依赖加载失败</h3>
          <p>请确认网络可访问 CDN，然后刷新页面重试。</p>
        </div>
      </div>
    `;
    updateStatus("依赖加载失败，无法渲染 Markdown。", true);
    return "";
  }

  const rawHtml = marked.parse(source);
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
  });

  elements.previewContent.innerHTML = sanitizedHtml;
  updateStatus("预览已更新。");
  return sanitizedHtml;
}

function applyTemplate(templateId) {
  const template = templates.find((item) => item.id === templateId) || templates[0];
  state.templateId = template.id;
  elements.posterFrame.dataset.theme = template.id;
  elements.previewTitle.textContent = template.name;
  elements.posterBadge.textContent = template.badge;
  syncActiveChip(elements.templateSwitcher, "templateId", template.id);
}

function applyPreset(presetId) {
  const preset = canvasPresets.find((item) => item.id === presetId) || canvasPresets[0];
  state.presetId = preset.id;
  elements.posterFrame.classList.remove(
    ...canvasPresets.map((item) => item.className),
  );
  elements.posterFrame.classList.add(preset.className);
  syncActiveChip(elements.presetSwitcher, "presetId", preset.id);
  updateStatus(`已切换为 ${preset.name}。`);
}

function syncActiveChip(container, key, activeId) {
  container.querySelectorAll(".chip").forEach((button) => {
    const isActive = button.dataset[key] === activeId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

async function exportPreview() {
  if (!window.htmlToImage) {
    updateStatus("导出库加载失败，请检查网络后刷新。", true);
    return;
  }

  setExporting(true);
  updateStatus("正在准备海报长图...");

  try {
    const exportNode = createExportPoster();
    const activePreset = canvasPresets.find((item) => item.id === state.presetId) || canvasPresets[0];
    await waitForRender();
    await waitForAssets(exportNode);
    const metrics = getExportMetrics(exportNode);
    logExportMetrics(exportNode, metrics);
    assertExportNode(exportNode, metrics);

    const width = activePreset.exportWidth;
    const { height } = metrics;

    const pixelRatio = 2;
    const dataUrl = await window.htmlToImage.toPng(exportNode, {
      cacheBust: true,
      pixelRatio,
      width,
      height,
      backgroundColor: getComputedStyle(exportNode).backgroundColor,
      style: {
        width: `${width}px`,
      },
    });

    const activeTemplate = templates.find((item) => item.id === state.templateId);
    const filename = buildFileName(activeTemplate?.id || "poster");
    downloadDataUrl(dataUrl, filename);
    updateStatus(`长图导出成功：${filename}`);
  } finally {
    destroyExportPoster();
    setExporting(false);
  }
}

function createExportPoster() {
  destroyExportPoster();

  const markup = getCurrentPosterMarkup();
  const activePreset = canvasPresets.find((item) => item.id === state.presetId) || canvasPresets[0];
  if (!markup.html) {
    throw new Error("没有可导出的内容，请先输入 Markdown。");
  }

  const sandbox = document.createElement("div");
  sandbox.className = "export-sandbox";
  sandbox.setAttribute("aria-hidden", "true");

  const exportNode = document.createElement("section");
  exportNode.className = "poster-frame poster-frame--export";
  exportNode.dataset.theme = markup.themeId;
  exportNode.style.width = `${activePreset.exportWidth}px`;

  const chrome = document.createElement("div");
  chrome.className = "poster-chrome poster-chrome--export";

  const badge = document.createElement("div");
  badge.className = "poster-badge";
  badge.textContent = markup.badge;

  const content = document.createElement("div");
  content.className = "poster-content poster-content--export markdown-body";
  applyExportBodyClass(content);
  content.innerHTML = markup.html;

  chrome.appendChild(badge);
  chrome.appendChild(content);
  exportNode.appendChild(chrome);
  sandbox.appendChild(exportNode);
  document.body.appendChild(sandbox);

  state.exportNode = sandbox;
  return exportNode;
}

function destroyExportPoster() {
  if (state.exportNode) {
    state.exportNode.remove();
    state.exportNode = null;
  }
}

function getCurrentPosterMarkup() {
  return {
    themeId: state.templateId,
    badge: elements.posterBadge.textContent.trim(),
    html: elements.previewContent.innerHTML.trim(),
  };
}

function applyExportBodyClass(contentNode) {
  contentNode.classList.add("markdown-body--export");
}

function assertExportNode(exportNode, metrics) {
  const content = exportNode.querySelector(".poster-content--export");
  if (!content) {
    throw new Error("导出节点为空，未生成正文内容。");
  }

  const hasText = content.textContent.trim().length > 0;
  const hasElements = content.children.length > 0;
  if (!hasText && !hasElements) {
    throw new Error("导出节点为空，请先输入 Markdown。");
  }

  if (metrics.height < 120) {
    throw new Error("导出节点高度异常，已阻止生成空白图片。");
  }
}

function getExportMetrics(exportNode) {
  const rect = exportNode.getBoundingClientRect();
  const content = exportNode.querySelector(".poster-content--export");
  const contentRect = content ? content.getBoundingClientRect() : rect;
  const visibleChildren = content
    ? Array.from(content.children).filter(isVisibleBlock)
    : [];
  const overflowBlocks = content
    ? Array.from(content.querySelectorAll("table, pre")).filter(isVisibleBlock)
    : [];
  const lastElementBottom = visibleChildren.length
    ? Math.max(...visibleChildren.map((node) => node.getBoundingClientRect().bottom - rect.top))
    : Math.ceil(contentRect.bottom - rect.top);
  const tableBottom = overflowBlocks.length
    ? Math.max(...overflowBlocks.map((node) => node.getBoundingClientRect().bottom - rect.top))
    : 0;
  const contentBottom = Math.ceil(contentRect.bottom - rect.top);
  const width = Math.ceil(rect.width);
  const height = Math.ceil(
    Math.max(
      exportNode.offsetHeight,
      exportNode.scrollHeight,
      rect.height,
      contentBottom,
      lastElementBottom,
      tableBottom,
    ),
  ) + 12;

  return {
    width,
    height,
    contentBottom,
    lastElementBottom,
    tableBottom,
  };
}

function isVisibleBlock(node) {
  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function logExportMetrics(exportNode, metrics) {
  const content = exportNode.querySelector(".poster-content--export");
  const firstTable = content?.querySelector("table");
  const computed = firstTable ? getComputedStyle(firstTable) : null;

  console.info("[poster-export] metrics", {
    width: metrics.width,
    height: metrics.height,
    contentBottom: metrics.contentBottom,
    lastElementBottom: metrics.lastElementBottom,
    tableBottom: metrics.tableBottom,
    tableDisplay: computed?.display || null,
    tableOverflowX: computed?.overflowX || null,
  });

  if (computed && (computed.display === "block" || computed.overflowX === "auto")) {
    console.warn("[poster-export] export table styles did not switch correctly");
  }
}

function waitForRender() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

async function waitForAssets(container) {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) {
    return;
  }

  await Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth > 0) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const cleanup = () => {
          image.removeEventListener("load", onLoad);
          image.removeEventListener("error", onError);
        };
        const onLoad = () => {
          cleanup();
          resolve();
        };
        const onError = () => {
          cleanup();
          reject(new Error(`图片加载失败: ${image.src}`));
        };

        image.addEventListener("load", onLoad, { once: true });
        image.addEventListener("error", onError, { once: true });
      });
    }),
  );
}

function buildFileName(prefix) {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");

  return `markdown-poster-${prefix}-${stamp}.png`;
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

function setExporting(isExporting) {
  elements.exportButton.disabled = isExporting;
  elements.exportButton.textContent = isExporting ? "正在导出..." : "导出当前图片";
}

function updateStatus(message, isError = false) {
  elements.statusText.textContent = message;
  elements.statusText.style.color = isError ? "#b42318" : "";
}
