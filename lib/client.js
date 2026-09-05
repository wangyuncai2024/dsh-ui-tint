// dsh-ui-tint —— Client half（浏览器端）
// ---------------------------------------------------------------------------
// 纯手写 bundle（无构建步骤），格式与官方 dsh-client-ui-* 一致：
//   window.__ModuleLoader__.load({ id, factory })，
//   factory 的 require 只能解析种子模块：
//     react / react-dom / react-dom/client / react/jsx-runtime
//     @deepseek-ai/cordis
//     @deepseek-ai/dsh-client-store
//     @deepseek-ai/dsh-client-ui-slots
//     @deepseek-ai/dsh-client-ui-primitives
// 本插件只用 react 与 dsh-client-store（均为种子），因此 DSH 升级只要
// 还保留这两个种子词就不会失效。
//
// 职责（全部走公开扩展点）：
//   1. ctx.theme.register() 注册主题（官方黑/咖啡/拿铁/抹茶）
//   2. 设置页 settings.general.item 增加一行主题色选择
//   3. 用浏览器 localStorage 持久化选择（不写 DSH 设置文档）。关键：内置
//      theme 服务会在"设置文档加载完成/任何设置写入"时调用 adopt()，把
//      preference 回退成内置 light/dark/system。adopt() 不经过 setTheme，
//      所以这里包装 setTheme 来区分"用户主动选内置色"（清除持久化）与
//      "adopt() 回退"（重新切回已保存的自定义主题色），从而做到刷新/重启
//      后仍是上次所选配色。
window.__ModuleLoader__.load({
  id: 'dsh-ui-tint',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    const React = require('react')
    const { defineStore } = require('@deepseek-ai/dsh-client-store')

    /** 设置行文案命名空间。 */
    const LOCALE_NS = 'settings.tint'

    /**
     * 主题注册表：id -> { colorScheme, accent, labelKey, tokens }。
     * tokens 与宿主半 lib/index.js 的 TINTS 保持一致（同一份配色）。
     * accent 仅用于设置行色块/选中描边。
     */
    const TINTS = [
      {
        id: 'ink',
        colorScheme: 'dark',
        accent: '#e9eaec',
        labelKey: 'tint.ink',
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
      {
        id: 'coffee',
        colorScheme: 'dark',
        accent: '#c98a4b',
        labelKey: 'tint.coffee',
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
      {
        id: 'latte',
        colorScheme: 'light',
        accent: '#a9712f',
        labelKey: 'tint.latte',
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
      {
        id: 'matcha',
        colorScheme: 'light',
        accent: '#7ba05a',
        labelKey: 'tint.matcha',
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
    ]
    const TINT_BY_ID = Object.fromEntries(TINTS.map((theme) => [theme.id, theme]))

    // ---- 文案 ----
    const zh = {
      'tint.title': '主题色',
      'tint.ink': '官方黑',
      'tint.coffee': '咖啡',
      'tint.latte': '拿铁',
      'tint.matcha': '抹茶',
    }
    const en = {
      'tint.title': 'Color themes',
      'tint.ink': 'Ink',
      'tint.coffee': 'Coffee',
      'tint.latte': 'Latte',
      'tint.matcha': 'Matcha',
    }

    // ---- 设置行 store（与官方外观行的写法一致） ----
    function createRowStore() {
      return defineStore({
        init: () => ({ active: '', revision: -1 }),
        actions: {
          sync: (d, active, revision) => {
            if (revision <= d.revision) return
            d.active = active
            d.revision = revision
          },
        },
      })
    }

    // ---- 设置行组件（纯 React.createElement，无 JSX） ----
    const ROW_STYLE = {
      borderBottom: '0.5px solid var(--dsw-alias-border-l2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '16px 0',
    }
    const TITLE_STYLE = {
      color: 'var(--dsw-alias-label-primary)',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '22px',
    }
    const CUBE_ROW_STYLE = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    }
    const CUBE_STYLE = {
      boxSizing: 'border-box',
      border: '0.5px solid var(--dsw-alias-border-l4)',
      borderRadius: '16px',
      flex: '1 1 140px',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '14px 20px',
      display: 'flex',
      cursor: 'pointer',
      background: 'transparent',
      color: 'var(--dsw-alias-label-primary)',
      fontSize: '13px',
      lineHeight: '20px',
      font: 'inherit',
    }
    const CUBE_SWATCH_STYLE = {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }
    const SWATCH_DOT_STYLE = {
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      display: 'inline-block',
    }

    function TintRow(props) {
      const { t, useStore, setTint } = props
      const active = useStore((state) => state.active)
      return React.createElement(
        'div',
        { style: ROW_STYLE },
        React.createElement('div', { style: TITLE_STYLE }, t('tint.title')),
        React.createElement(
          'div',
          { style: CUBE_ROW_STYLE },
          TINTS.map((theme) => {
            const selected = active === theme.id
            return React.createElement(
              'button',
              {
                key: theme.id,
                type: 'button',
                'aria-pressed': selected,
                onClick: () => setTint(theme.id),
                style: Object.assign({}, CUBE_STYLE, selected
                  ? {
                      background: 'var(--dsw-alias-bg-module-platform)',
                      borderColor: theme.accent,
                    }
                  : {}),
              },
              React.createElement(
                'span',
                { style: CUBE_SWATCH_STYLE },
                React.createElement('span', {
                  style: Object.assign({}, SWATCH_DOT_STYLE, {
                    background: theme.tokens['--dsw-alias-bg-layer-1'],
                    border: '0.5px solid var(--dsw-alias-border-l4)',
                  }),
                }),
                React.createElement('span', {
                  style: Object.assign({}, SWATCH_DOT_STYLE, {
                    background: theme.accent,
                  }),
                })
              ),
              t(theme.labelKey)
            )
          })
        )
      )
    }

    // ---- Cordis 客户端 fiber 依赖 ----
    const inject = ['slots', 'locale', 'theme']

    function apply(ctx) {
      const theme = ctx.theme

      // 1. 注册主题（每个主题返回一个 dispose；卸载时全部回收）
      const disposers = TINTS.map((def) =>
        theme.register({ id: def.id, colorScheme: def.colorScheme, tokens: def.tokens })
      )
      ctx.effect(() => () => {
        for (const dispose of disposers) {
          try { dispose() } catch (error) {}
        }
      }, 'ui-tint: registered themes')

      // 2. 持久化：用浏览器 localStorage 记住当前主题色。
      //    不能写 DSH 设置文档——设置写入会触发内置 theme 服务 adopt() 回退；
      //    因此这里只把"用户显式选择的主题色 id"存在 localStorage。
      const STORAGE_KEY = 'dsh-ui-tint'
      const isTint = (id) => Object.prototype.hasOwnProperty.call(TINT_BY_ID, id)

      const readSaved = () => {
        try { return localStorage.getItem(STORAGE_KEY) } catch (error) { return null }
      }
      const writeSaved = (id) => {
        try { localStorage.setItem(STORAGE_KEY, id) } catch (error) {}
      }
      const clearSaved = () => {
        try { localStorage.removeItem(STORAGE_KEY) } catch (error) {}
      }

      // 直接把某个自定义主题的 token + colorScheme + dark 属性写到 DOM。
      // 这是显示层的兜底：不依赖 theme 服务里 presenter 的 apply 顺序。
      const applyTintToDom = (id) => {
        const def = TINT_BY_ID[id]
        if (!def || typeof document === 'undefined' || !document.body) return
        try {
          document.documentElement.style.colorScheme = def.colorScheme
          document.body.toggleAttribute('data-ds-dark-theme', def.colorScheme === 'dark')
          for (const key of Object.keys(def.tokens)) {
            document.body.style.setProperty(key, def.tokens[key])
          }
        } catch (error) {}
      }

      // 包装 setTheme，记录"用户主动选择"：
      //  - 选自定义主题色 -> 记住
      //  - 选内置 light/dark/system -> 清除（用户主动离开自定义主题）
      // adopt() 直接改 preference 而不过 setTheme，因此永远不会被误判为
      // "用户主动离开"。
      const originalSetTheme = theme.setTheme.bind(theme)
      theme.setTheme = (id) => {
        if (isTint(id)) writeSaved(id)
        else clearSaved()
        return originalSetTheme(id)
      }

      // 开机恢复上次选中的主题色（此时主题已注册）
      const restore = () => {
        const saved = readSaved()
        if (typeof saved === 'string' && saved !== '' && isTint(saved)) {
          try { theme.setTheme(saved) } catch (error) {}
          applyTintToDom(saved)
        }
      }
      restore()

      // 关键修复：adopt() 回退（设置文档首次加载完成 / 任何设置写入）会把
      // preference 从自定义色改回内置色并触发 theme/change。
      //
      // 两个事实决定了这里不能只靠 setTheme() 切回：
      //   1. ui-layout 的 presenter（真正写 body 内联 token 的消费者）是在
      //      一个 defer 的 ctx.effect 里注册 theme/change 的，因此它的 handler
      //      排在我们这个 handler 之后；同一轮 emit 里它会在"切回 ink"之后又
      //      用内置 dark 的 token 把 DOM 覆盖掉。
      //   2. adopt() 每被触发一次都会再回退一次，所以需要每次都兜底。
      //
      // 处理：a) 用 setTheme() 把 preference 拉回自定义色（保证设置行选中态、
      // 后续 snapshot 正确）；b) 用 queueMicrotask 在本轮同步 emit 全部结束后
      // 再直接写一遍 token，覆盖 presenter 末尾写入的内置 dark token。
      ctx.on('theme/change', (snapshot) => {
        const want = readSaved()
        if (typeof want !== 'string' || want === '' || !isTint(want)) return
        if (snapshot.preference !== want) {
          try { theme.setTheme(want) } catch (error) {}
        }
        if (typeof queueMicrotask === 'function') queueMicrotask(() => applyTintToDom(want))
        else Promise.resolve().then(() => applyTintToDom(want))
      })

      // 卸载时还原原始 setTheme，避免污染后续生命周期。
      ctx.effect(() => () => {
        theme.setTheme = originalSetTheme
      }, 'ui-tint: setTheme wrapper')

      // 3. 设置页文案
      ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), 'ui-tint: row dictionaries')

      // 4. 设置页「主题色」行（加在官方外观行之后，互不干扰）
      const store = createRowStore()
      let bound
      const sync = (snapshot) => {
        if (bound) bound.sync(snapshot.preference, snapshot.revision)
      }
      ctx.on('theme/change', sync)
      ctx.slots.inject('settings.general.item', () =>
        ctx.slots.register(
          {
            name: 'settings.general.item',
            id: 'ui-tint',
            order: 12,
            store,
            locale: LOCALE_NS,
            inject: (actions) => {
              bound = actions
              sync(theme.getTheme())
              return {
                setTint: (id) => {
                  try { theme.setTheme(id) } catch (error) {}
                },
              }
            },
          },
          TintRow
        )
      )
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
