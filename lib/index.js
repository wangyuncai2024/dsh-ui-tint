// dsh-ui-tint —— Host half
// ---------------------------------------------------------------------------
// 职责：把自定义主题的首屏脚本注入 HTML，让刷新页面时第一时间就是已选配色，
//      避免先闪内置 light/dark/system。持久化由客户端用浏览器 localStorage
//      完成（key: dsh-ui-tint），因此这里只读 localStorage，不注册任何
//      settings 命名空间——也彻底绕开了内置 theme 服务的 adopt() 回退问题。
//
// 客户端（lib/client.js）负责注册主题 + 设置行 + 选择切换。

/**
 * 主题注册表：id -> { colorScheme, tokens }。
 * 与客户端 lib/client.js 中的 TINTS 保持同一份配色。
 * tokens 是 alias 层 CSS 变量（--dsw-alias-* / --dsw-specific-*），
 * 主题呈现层把 body 内联样式写这些变量，覆盖内置深/浅色中的对应项；
 * 未列出的变量沿用内置设计系统，保证整体一致。
 */
const TINTS = {
  /** 官方黑·柔和灰黑：提亮后的内置深色观感（非纯黑） */
  ink: {
    colorScheme: 'dark',
    tokens: {
      '--dsw-alias-bg-base': '#26262b',
      '--dsw-alias-bg-layer-1': '#2e2e34',
      '--dsw-alias-bg-layer-2': '#35353c',
      '--dsw-alias-bg-layer-3': '#3d3d45',
      '--dsw-alias-bg-overlay': '#4a4a52',
      '--dsw-alias-bg-module-platform': '#313138',
      '--dsw-specific-sidebar-fill': '#202025',
      '--dsw-alias-border-l1': '#ffffff12',
      '--dsw-alias-border-l2': '#ffffff21',
      '--dsw-alias-border-l3': '#ffffff30',
      '--dsw-alias-brand-primary': '#e9eaec',
      '--dsw-alias-label-primary': '#e6e7ea',
      '--dsw-alias-label-secondary': '#b6b8bf',
      '--dsw-alias-label-tertiary': '#9b9ea6',
      '--dsw-alias-label-caption': '#83868d',
      '--dsw-alias-interactive-bg-hover': '#ffffff14',
      '--dsw-alias-state-business-primary': '#7aa2f7',
      '--dsw-alias-state-error-primary': '#ef6a5f',
      '--dsw-alias-state-success-primary': '#4fbf6e',
      '--dsw-alias-state-warn-primary': '#f0a832',
      '--dsw-alias-markdown-code-block': '#2a2a30',
    },
  },
  /** 咖啡·暖棕深色 */
  coffee: {
    colorScheme: 'dark',
    tokens: {
      '--dsw-alias-bg-base': '#201814',
      '--dsw-alias-bg-layer-1': '#2a2018',
      '--dsw-alias-bg-layer-2': '#33281e',
      '--dsw-alias-bg-layer-3': '#3a2d21',
      '--dsw-alias-bg-overlay': '#3a2d21',
      '--dsw-alias-bg-module-platform': '#241b14',
      '--dsw-specific-sidebar-fill': '#1c150f',
      '--dsw-alias-border-l1': '#443524',
      '--dsw-alias-border-l2': '#5a4630',
      '--dsw-alias-border-l3': '#6f563c',
      '--dsw-alias-brand-primary': '#c98a4b',
      '--dsw-alias-label-primary': '#ece3d8',
      '--dsw-alias-label-secondary': '#b7a892',
      '--dsw-alias-label-tertiary': '#8a7a64',
      '--dsw-alias-label-caption': '#8a7a64',
      '--dsw-alias-interactive-bg-hover': '#3a2d21',
      '--dsw-alias-state-business-primary': '#c98a4b',
      '--dsw-alias-state-error-primary': '#e06c5f',
      '--dsw-alias-state-success-primary': '#8fb573',
      '--dsw-alias-state-warn-primary': '#e0b46b',
      '--dsw-alias-markdown-code-block': '#241b14',
    },
  },
  /** 拿铁·奶油米色浅色 */
  latte: {
    colorScheme: 'light',
    tokens: {
      '--dsw-alias-bg-base': '#f6efe4',
      '--dsw-alias-bg-layer-1': '#fbf6ec',
      '--dsw-alias-bg-layer-2': '#f1e7d6',
      '--dsw-alias-bg-layer-3': '#eadcc4',
      '--dsw-alias-bg-overlay': '#ffffff',
      '--dsw-alias-bg-module-platform': '#efe5d2',
      '--dsw-specific-sidebar-fill': '#efe5d2',
      '--dsw-alias-border-l1': '#e5d8c2',
      '--dsw-alias-border-l2': '#d3c2a6',
      '--dsw-alias-border-l3': '#c0ac8c',
      '--dsw-alias-brand-primary': '#a9712f',
      '--dsw-alias-label-primary': '#3a2c1c',
      '--dsw-alias-label-secondary': '#7a6a52',
      '--dsw-alias-label-tertiary': '#9c8a6e',
      '--dsw-alias-label-caption': '#9c8a6e',
      '--dsw-alias-interactive-bg-hover': '#f1e7d6',
      '--dsw-alias-state-business-primary': '#a9712f',
      '--dsw-alias-state-error-primary': '#c0533f',
      '--dsw-alias-state-success-primary': '#5d8a4a',
      '--dsw-alias-state-warn-primary': '#b9822c',
      '--dsw-alias-markdown-code-block': '#f1e7d6',
    },
  },
  /** 抹茶·青绿浅色 */
  matcha: {
    colorScheme: 'light',
    tokens: {
      '--dsw-alias-bg-base': '#f4f7ee',
      '--dsw-alias-bg-layer-1': '#fafcf5',
      '--dsw-alias-bg-layer-2': '#e9efdf',
      '--dsw-alias-bg-layer-3': '#dde7cf',
      '--dsw-alias-bg-overlay': '#ffffff',
      '--dsw-alias-bg-module-platform': '#ecf2e2',
      '--dsw-specific-sidebar-fill': '#ecf2e2',
      '--dsw-alias-border-l1': '#dbe5cc',
      '--dsw-alias-border-l2': '#c5d4ae',
      '--dsw-alias-border-l3': '#aebf93',
      '--dsw-alias-brand-primary': '#7ba05a',
      '--dsw-alias-label-primary': '#2a3622',
      '--dsw-alias-label-secondary': '#657358',
      '--dsw-alias-label-tertiary': '#87957b',
      '--dsw-alias-label-caption': '#87957b',
      '--dsw-alias-interactive-bg-hover': '#e9efdf',
      '--dsw-alias-state-business-primary': '#7ba05a',
      '--dsw-alias-state-error-primary': '#c0533f',
      '--dsw-alias-state-success-primary': '#5d8a4a',
      '--dsw-alias-state-warn-primary': '#b9822c',
      '--dsw-alias-markdown-code-block': '#e9efdf',
    },
  },
}

/**
 * 生成首屏主题脚本：读取浏览器 localStorage 里的主题色 id，
 * 应用对应 colorScheme、data-ds-dark-theme 属性以及 token 变量，
 * 与内置主题服务的首屏脚本写法保持一致（且在其之后注入，覆盖内置结果）。
 * 脚本自带 try/catch：任何异常都不影响页面启动（最多退回默认配色）。
 * @returns 注入 HTML 的内联脚本体
 */
function buildBootScript() {
  return `(() => {
  try {
    const tints = ${JSON.stringify(TINTS)}
    const saved = localStorage.getItem('dsh-ui-tint')
    const t = tints[saved]
    if (!t) return
    const dark = t.colorScheme === 'dark'
    document.documentElement.style.colorScheme = t.colorScheme
    document.body.toggleAttribute('data-ds-dark-theme', dark)
    for (const key of Object.keys(t.tokens)) {
      document.body.style.setProperty(key, t.tokens[key])
    }
  } catch (error) {}
})()`
}

/** 宿主插件主体：只做首屏注入，无外部依赖。 */
export function apply(ctx) {
  ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'script', placement: 'body', text: buildBootScript() })
  })
}