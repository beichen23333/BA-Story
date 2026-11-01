# 碧蓝档案剧情站复刻项目

本项目基于并复刻、修改自开源项目 [ba-archive/blue-archive](https://github.com/ba-archive/blue-archive)，用于展示和播放《蔚蓝档案》（Blue Archive）相关剧情内容。项目在原项目基础上进行了调整与二次开发。

> **免责声明**：本项目为非官方、粉丝制作项目，与《蔚蓝档案》版权方及发行商无隶属或官方合作关系。游戏名称、角色、剧情及相关素材的权利归其各自权利人所有。

## 项目结构

```text
.
├── data/                       # 剧情数据（调试）
├── lobby/                      # React 剧情大厅
│   ├── components/              # 大厅面板及剧情卡片
│   ├── hooks/                   # UI 交互及方向适配 Hooks
│   ├── stories/                  # 剧情集合
│   └── main.jsx                  # 大厅入口
├── player-lib/                  # Vue / Pixi 剧情播放器
│   ├── api/                     # 播放器 API
│   ├── layers/                   # 渲染及 UI 图层
│   │   ├── bgLayer/              # 背景
│   │   ├── characterLayer/       # 角色
│   │   ├── effectLayer/          # 特效
│   │   ├── l2dLayer/             # Live2D 相关
│   │   ├── soundLayer/           # 音频
│   │   ├── textLayer/            # 文本与对话
│   │   ├── translationLayer/     # 翻译
│   │   └── uiLayer/              # 播放器 UI
│   ├── middlewares/              # 资源加载等中间件
│   ├── stores/                   # Pinia 状态
│   └── types/                    # TypeScript 类型
├── public/assets/                 # 静态图片、音频及游戏资源
├── index.html                    # HTML 入口
├── package.json                  # 项目配置与 scripts
├── pnpm-lock.yaml                # pnpm 锁文件
└── pnpm-workspace.yaml            # pnpm Workspace 配置
```

## 环境要求

- Node.js：建议使用兼容当前 Vite 版本的 Node.js（Node.js 20.19+ 或 22.12+）。
- pnpm：项目使用 `pnpm-lock.yaml` 管理依赖。

## 安装

```bash
pnpm install
```

## 本地开发

```bash
pnpm dev
```

## 构建与预览

```bash
pnpm build
pnpm preview
```

## 致谢

本项目复刻、修改或使用了以下项目与技术

### 原项目

| 项目 | 地址 | 使用说明 |
|---|---|---|
| 碧蓝档案剧情站 | https://github.com/ba-archive/blue-archive | 本项目的复刻与修改基础。感谢原作者及贡献者的工作。请遵循原项目许可证及其声明。 |

### 核心

| 项目 | 官网 / 仓库 | 使用场景 | 许可证（需按版本核验） |
|---|---|---|---|
| React | https://react.dev/ · https://github.com/facebook/react | `lobby/` 大厅组件及 JSX | MIT |
| Vue | https://vuejs.org/ · https://github.com/vuejs/core | 播放器 SFC 及 UI | MIT |
| PixiJS | https://pixijs.com/ · https://github.com/pixijs/pixijs | `player-lib/` 渲染、精灵、滤镜及效果 | MIT |
| Vite | https://vite.dev/ · https://github.com/vitejs/vite | 开发服务器及构建脚本 | MIT |
| TypeScript | https://www.typescriptlang.org/ · https://github.com/microsoft/TypeScript | 播放器类型定义及 TS 源码 | Apache-2.0 |

### UI 与设计（UI & Design）

| 项目 | 官网 / 仓库 | 使用场景 | 许可证（需按版本核验） |
|---|---|---|---|
| Element Plus | https://element-plus.org/ · https://github.com/element-plus/element-plus | Vue 播放器界面组件 | MIT |
| Lucide | https://lucide.dev/ · https://github.com/lucide-icons/lucide | `lucide-react` 图标引用 | ISC |
| Sass | https://sass-lang.com/ · https://github.com/sass/sass | SCSS 样式 | MIT |

### 第三方库与工具（Libraries & Utilities）

| 项目 | 官网 / 仓库 | 使用场景 | 许可证 / 注意事项 |
|---|---|---|---|
| GSAP | https://gsap.com/ · https://github.com/greensock/GSAP | 角色及 UI 动画编排 | GSAP 专有授权条款；发布前需审查 |
| Spine Runtimes | https://esotericsoftware.com/ · https://github.com/EsotericSoftware/spine-runtimes | `@esotericsoftware/spine-pixi-v7` 角色动画运行时 | Spine Runtime License；不是标准 OSI 开源许可证，需单独核实 |
| Howler.js | https://howlerjs.com/ · https://github.com/goldfire/howler.js | 音频播放 | MIT（按版本核验） |
| Pinia | https://pinia.vuejs.org/ · https://github.com/vuejs/pinia | 播放器状态管理 | MIT（按版本核验） |
| VueUse | https://vueuse.org/ · https://github.com/vueuse/vueuse | Vue Composables 与工具 | MIT（按版本核验） |
| Axios | https://axios-http.com/ · https://github.com/axios/axios | HTTP 请求 | MIT（按版本核验） |
| mitt | https://github.com/developit/mitt | 事件总线 | MIT（按版本核验） |
| lodash-es | https://lodash.com/ · https://github.com/lodash/lodash | 通用工具函数 | MIT（按版本核验） |
| radash | https://radash-docs.vercel.app/ · https://github.com/radash-docs/radash | 通用辅助工具 | MIT（按版本核验） |
| uuid | https://github.com/uuidjs/uuid | UUID 生成 | MIT（按版本核验） |
| xxhashjs | https://github.com/piercional/xxhashjs | 哈希工具 | MIT（按版本核验） |
| `@ungap/structured-clone` | https://github.com/ungap/structured-clone | 结构化克隆辅助 | ISC（按版本核验） |
| ba-click-fx | https://github.com/CialloKing/ba-click-fx | 大厅点击交互特效 | **Unknown**：请核实仓库及所用版本的许可证 |
| vue-responsive-video-background-player | https://www.npmjs.com/package/vue-responsive-video-background-player | 响应式视频背景播放器相关集成 | **Unknown**：请核实包元数据与上游许可证 |

### 素材与资源（Assets & Resources）

本项目使用的游戏素材来源于 **《蔚蓝档案》（Blue Archive）**。相关角色、立绘、背景、剧情、音频、动画及其他游戏素材的版权和权利归其原始权利人所有，并不因本项目使用或采用 MIT 许可证而转移或开放授权。

## 许可证（License）

本仓库附带的 [MIT License](./LICENSE) 仅适用于项目作者有权许可的原创代码部分。

使用、修改、分发本项目之前，请分别阅读上游项目、第三方依赖及素材的适用条款。若你是原作者或权利人，并认为本项目存在不妥使用，请通过仓库 Issue 联系维护者。

## 免责声明

本项目仅用于学习、技术研究及非官方粉丝交流。请勿将本项目或其中的游戏资源用于侵犯版权、违反服务条款或其他法律法规的用途。使用者应自行确认其使用及再分发行为符合相关法律和授权要求。
