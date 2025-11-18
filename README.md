# Image Extractor

一个强大的网页图片提取工具，支持从任意网页中提取、过滤、排序和下载图片。

## ✨ 特性

- 🚀 **快速提取** - 支持从任意网页快速提取所有图片
- 🔍 **智能过滤** - 按图片类型、尺寸、大小等条件筛选
- 📊 **多种排序** - 支持按文件大小、分辨率、图片尺寸排序
- 🎯 **原图匹配** - 智能匹配缩略图对应的原图
- 💾 **批量下载** - 支持单张下载或批量打包下载
- 🔄 **实时进度** - WebSocket 实时显示提取进度
- 📱 **响应式设计** - 完美适配各种屏幕尺寸
- 🎨 **现代化 UI** - 基于 PrimeVue 和 Tailwind CSS

## 🛠️ 技术栈

- **框架**: Vue 3.5.13 (Composition API)
- **构建工具**: Vite 6.0.3
- **UI 库**: PrimeVue 3.36.0
- **样式**: Tailwind CSS 3.4.17
- **HTTP 客户端**: Axios 1.7.7
- **代码规范**: ESLint + Prettier
- **实时通信**: WebSocket

## 📁 项目结构

```
crawler-web/
├── src/
│   ├── api/                    # API 接口层
│   │   └── extract.js          # 图片提取和下载 API
│   ├── assets/                 # 静态资源
│   ├── components/             # Vue 组件
│   │   ├── AppHeader.vue       # 导航栏
│   │   ├── ExtractionForm.vue  # 提取表单
│   │   ├── ImageCard.vue       # 图片卡片
│   │   ├── ImageGrid.vue       # 图片网格
│   │   ├── SidebarControls.vue # 侧边栏控制
│   │   ├── FeaturesSection.vue # 功能特性展示
│   │   └── FAQSection.vue      # 常见问题
│   ├── composables/            # 组合式函数
│   │   ├── useImageExtraction.js # 图片提取逻辑
│   │   ├── useImageFilters.js    # 图片过滤逻辑
│   │   ├── useImageSort.js       # 图片排序逻辑
│   │   ├── usePagination.js      # 分页逻辑
│   │   └── useWebSocket.js       # WebSocket 连接管理
│   ├── utils/                  # 工具函数
│   │   └── request.js          # Axios 封装
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── public/                     # 公共资源
├── .env.development            # 开发环境配置
├── .env.production             # 生产环境配置
├── .env.staging                # 预发布环境配置
├── .eslintrc.cjs               # ESLint 配置
├── .prettierrc                 # Prettier 配置
├── index.html                  # HTML 模板
├── package.json                # 项目依赖
├── tailwind.config.js          # Tailwind CSS 配置
└── vite.config.js              # Vite 配置

```

## 🏗️ 架构设计

### 组件化架构

项目采用组件化架构，将原本 2000+ 行的单文件组件拆分为：

- **7 个独立组件** - 每个组件职责单一，易于维护
- **5 个 Composables** - 封装业务逻辑，提高代码复用性
- **代码量减少 84%** - App.vue 从 2042 行减少到 321 行

### Composables 模式

采用 Vue 3 Composition API 的 Composables 模式，实现业务逻辑的模块化：

- `useImageExtraction` - 管理图片提取流程、WebSocket 连接
- `useImageFilters` - 处理图片筛选和搜索
- `useImageSort` - 管理排序逻辑
- `usePagination` - 处理分页功能
- `useWebSocket` - WebSocket 连接管理（支持自动重连）

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动（默认端口）

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist` 目录

### 预览生产构建

```bash
npm run preview
```

## 🔧 开发指南

### 代码规范

项目使用 ESLint 和 Prettier 保证代码质量和风格统一：

```bash
# 检查代码规范
npm run lint

# 自动修复代码规范问题
npm run lint:fix

# 格式化代码
npm run format
```

### ESLint 规则

- 强制使用 `===` 和 `!==`（禁止使用 `==` 和 `!=`）
- Vue 3 推荐规则
- 与 Prettier 集成，避免格式冲突

### Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 120,
  "trailingComma": "es5"
}
```

## 🌍 环境变量

项目支持多环境配置：

### 开发环境 (`.env.development`)

```bash
VITE_APP_BASE_API = 'http://localhost:3000'
VITE_APP_BASE_WS_API = 'ws://localhost:8080'
VITE_APP_TITLE = 'Image Extractor - Dev'
VITE_APP_ENABLE_CONSOLE = 'true'
```

### 生产环境 (`.env.production`)

```bash
VITE_APP_BASE_API = 'http://8.130.76.127:3000'
VITE_APP_BASE_WS_API = 'ws://8.130.76.127:8080'
VITE_APP_TITLE = 'Image Extractor'
VITE_APP_ENABLE_CONSOLE = 'false'
```

### 预发布环境 (`.env.staging`)

```bash
VITE_APP_BASE_API = 'https://staging-api.your-domain.com'
VITE_APP_BASE_WS_API = 'wss://staging-api.your-domain.com'
VITE_APP_TITLE = 'Image Extractor - Staging'
```

## ⚡ 性能优化

### 构建优化

- **代码分割** - Vue、PrimeVue、工具库分别打包
- **Gzip 压缩** - 大于 10KB 的文件自动压缩
- **Tree Shaking** - 移除未使用的代码
- **Terser 压缩** - 生产环境移除 console 和 debugger
- **资源内联** - 小于 4KB 的资源转为 base64

### 运行时优化

- **图片懒加载** - 使用 `loading="lazy"` 和 `decoding="async"`
- **异步解码** - 避免阻塞主线程
- **低优先级** - 使用 `fetchpriority="low"` 优化加载
- **分页显示** - 大量图片分页展示，减少 DOM 节点

### WebSocket 优化

- **自动重连** - 连接断开自动重连（最多 5 次）
- **指数退避** - 重连延迟指数增长，避免频繁请求
- **状态管理** - 清晰的连接状态（connecting、connected、disconnected、error）
- **错误处理** - 完善的错误日志和回调机制

## 📦 打包分析

构建完成后，可以查看打包分析报告：

```bash
# 构建项目
npm run build

# 打开 dist/stats.html 查看打包分析
```

分析报告包含：
- 各模块的大小
- Gzip 压缩后的大小
- Brotli 压缩后的大小
- 依赖关系图

## 🎯 API 接口

### 图片提取 API

```javascript
import { extractionApi } from '@/api/extract'

// 创建提取任务
await extractionApi.createExtraction({
  url: 'https://example.com',
  mode: 'advanced',
  imageMode: 'all',
  ignoreInlineImages: false
})

// 获取提取结果
await extractionApi.getExtraction(id)

// 匹配原图
await extractionApi.matchOriginal(id, 'original')
```

### 下载 API

```javascript
import { downloadApi } from '@/api/extract'

// 单张下载
await downloadApi.single(extractionId, imageId)

// 批量下载
await downloadApi.multiple(extractionId, imageIds)
```

## 🔌 WebSocket 使用

```javascript
import { useWebSocket } from '@/composables/useWebSocket'

const { connect, disconnect, send, status } = useWebSocket({
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000
})

// 连接 WebSocket
connect(wsUrl, {
  onOpen: (event) => console.log('Connected'),
  onMessage: (event) => console.log('Message:', event.data),
  onError: (error) => console.error('Error:', error),
  onClose: (event) => console.log('Closed')
})

// 发送消息
send({ type: 'ping' })

// 断开连接
disconnect()
```

## 🐛 常见问题

### 1. 图片无法加载

检查是否存在跨域问题，可以在图片标签添加 `referrerpolicy="no-referrer"`

### 2. WebSocket 连接失败

确保后端 WebSocket 服务已启动，并检查环境变量中的 WebSocket URL 配置

### 3. 构建后样式丢失

确保已正确配置 Tailwind CSS 和 PostCSS

### 4. ESLint 报错

运行 `npm run lint:fix` 自动修复大部分规范问题

## 📝 开发规范

### 组件开发

- 使用 `<script setup>` 语法
- Props 使用 `defineProps()` 定义
- 事件使用 `defineEmits()` 定义
- 暴露方法使用 `defineExpose()`

### 样式规范

- 优先使用 Tailwind CSS 工具类
- 复杂样式使用 `<style scoped>`
- 避免使用内联样式

### 命名规范

- 组件文件：PascalCase（如 `ImageCard.vue`）
- Composables：camelCase（如 `useImageExtraction.js`）
- 常量：UPPER_SNAKE_CASE（如 `MAX_RECONNECT_ATTEMPTS`）
- 变量/函数：camelCase（如 `handleClick`）

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证

## 👨‍💻 IDE 推荐

- [VS Code](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 语法支持
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - 代码规范检查
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - 代码格式化
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - Tailwind 智能提示

## 📊 项目统计

- **代码行数**: ~2,500 行（从 2,042 行单文件重构而来）
- **组件数量**: 7 个
- **Composables 数量**: 5 个
- **代码复用率**: 显著提升
- **可维护性**: 极大改善

---

**Made with ❤️ using Vue 3 + Vite**
