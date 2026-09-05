# dsh-ui-tint · DSH Web UI 主题色扩展

在 DSH Web 界面自带的「浅色 / 深色 / 跟随系统」之外，增加**官方黑、咖啡、拿铁、抹茶**四种配色，可在设置页一键切换并持久记忆（含刷新首屏不闪色）。

## 主题一览

| 主题 | id | 色系 | 说明 |
| --- | --- | --- | --- |
| 官方黑 | `ink` | 柔和灰黑深色 | 对齐内置深色观感但整体提亮，非纯黑、不刺眼 |
| 咖啡 | `coffee` | 暖棕深色 | 咖啡深褐 |
| 拿铁 | `latte` | 奶油米色浅色 | 拿铁浅咖 |
| 抹茶 | `matcha` | 抹茶绿浅色 | 抹茶青绿 |

切换后内置的「浅色 / 深色 / 跟随系统」仍可随时切回；切回后主题色记录自动清空。

## 为什么它"独立、不怕 DSH 升级"

- **安装位置在用户目录**：插件挂在 `~/.dsh/profiles/web/`（profile 的 bundle 栈 + node_modules），而不是 DSH 安装目录。DSH 本体升级只更新安装目录，永不触碰 `~/.dsh`，因此升级不会删除或覆盖本插件。
- **零第三方依赖**：`dependencies` 为空。宿主半与浏览器半都只依赖 DSH 公开扩展点，不 import 任何 npm 包，从根本上杜绝了 ESM 相对路径解析（`Cannot find package ...`）这类升级破坏。
- **只使用公开扩展点**，不碰 DSH 内部实现：
  - 宿主半：只监听 `webserver/index-inject` 事件，注入一段读浏览器 `localStorage` 的首屏主题脚本；
  - 浏览器半：`ctx.theme.register()` 注册第三方主题（DSH 官方预留的主题扩展通道）、`settings.general.item` 插槽增加设置行。
- **逐层降级**：首屏注入失败只是刷新时退回内置配色；主题注册失败只是设置行不可用；每一处调用都有 try/catch 兜底，页面不会崩。

> 注意：本插件**刻意不写 DSH 设置文档**（`settings` 命名空间）。DSH 内置 `theme` 服务在“任何设置写入”时都会重新采纳内置偏好 `ui-theme.preference`（只含 `light/dark/system`），从而把自定义主题强制回退成 `system`。持久化改用浏览器 `localStorage` 后彻底绕开该回退。

## 安装 / 卸载

```bash
# 安装（把本插件加入 web profile 的 bundle 栈并链接进 node_modules）
dsh plugin --profile web add link:~/dsh-ui-tint

# 重启 web 实例生效（GUI 会短暂闪断重连）：
#   1. 停掉当前 node .../bin/dsh web 进程
#   2. 重新启动：
#      setsid nohup node ~/.npm-global/bin/dsh web --no-open \
#        >> ~/.dsh/profiles/web/web-stdout.log 2>&1 &

# 卸载
dsh plugin --profile web remove dsh-ui-tint   # 重启后生效
```

安装并重启后，打开 **设置 → 通用**，在「外观」行附近会出现一行「主题色」：点击色块即可切换。选择写入浏览器 `localStorage`（key `dsh-ui-tint`），下次打开、甚至刷新页面首屏都保持该配色。

## 目录结构

```
dsh-ui-tint/
├── package.json        # 双面插件声明（dsh.bundle.patch + dsh.client，零依赖）
├── cordis.patch.yml    # bundle 挂载行（id: ui-tint）
├── lib/
│   ├── index.js        # 宿主半：首屏主题脚本注入（读 localStorage）
│   └── client.js       # 浏览器半：主题注册 + 设置行 + localStorage 持久化
└── README.md
```

## 自己加新配色

1. 在 `lib/index.js` 的 `TINTS` 与 `lib/client.js` 的 `TINTS` 中各加一项（两处必须同步）：`id`、`colorScheme`、`tokens`（alias 层变量名可从 `Theme.listTokens` 查询；现有条目可直接抄改）。
2. 在 client 的 `zh`/`en` 文案里加 `tint.<id>` 标签。
3. 刷新页面即可在设置里看到新色块；新增/变更后无需重新安装（bundle 是 link 的，改源码即生效，重启或 HMR 后可见）。

> 提示：`tokens` 里只放要覆盖的 alias 变量（如 `--dsw-alias-bg-base`、`--dsw-alias-label-primary`、`--dsw-specific-sidebar-fill`…）；未列出的变量沿用内置设计系统，保证配色协调。
