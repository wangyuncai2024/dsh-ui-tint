# Changelog

本项目的所有重要变更都会记录在此文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.1.0] - 2026-09-05

### 新增

- **四套配色主题**：官方黑（`ink`）、咖啡（`coffee`）、拿铁（`latte`）、抹茶（`matcha`），
  其中官方黑为深色系，咖啡为暖棕深色系，拿铁/抹茶为浅色系。
- **设置页一键切换**：通过 `settings.general.item` 插槽在「设置 → 通用」新增「主题色」入口，
  点击色块立即切换主题。
- **持久记忆**：选择写入浏览器 `localStorage`（key `dsh-ui-tint`），刷新/重启后保持上次配色。
- **首屏不闪色**：宿主半通过 `webserver/index-inject` 注入首屏主题脚本，
  刷新页面第一时间即为已选配色，避免先闪内置 light/dark/system。
- **零第三方依赖**：`dependencies` 为空，宿主半与浏览器半均只依赖 DSH 公开扩展点。
- **自动恢复绕开内置回退**：包装 `theme.setTheme` 并结合 `theme/change` 事件兜底，
  规避内置 theme 服务在设置写入时的 preference 回退问题。

### 项目规范化

- 补充 MIT 许可证（`LICENSE`）、`.gitignore` 与变更日志（`CHANGELOG.md`）。
- README 说明改为通用安装路径（`~/dsh-ui-tint`），去除本机真实路径。