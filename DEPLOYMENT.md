# 部署说明

## 开发环境

### 1. 启动后端服务
确保后端服务运行在端口 3000：
```bash
# 在后端项目目录
npm run dev
# 或
npm run server
```

后端服务应该在 http://localhost:3000 启动

### 2. 启动前端服务

**重要：如果修改了 .env 文件，必须重启 Vite 开发服务器**

```bash
# 停止当前的开发服务器 (Ctrl+C)

# 清除缓存并重新启动
rm -rf node_modules/.vite
npm run dev
```

前端服务会在 http://localhost:5173 启动

### 3. 清除浏览器缓存

打开浏览器开发者工具（F12），然后：
- Chrome/Edge: 右键点击刷新按钮 → 选择"清空缓存并硬性重新加载"
- Firefox: Ctrl+Shift+R (强制刷新)

## 环境变量配置

### 开发环境 (.env.development)
```
VITE_APP_BASE_API = 'http://localhost:3000'
```

### 生产环境 (.env.production)
```
VITE_APP_BASE_API = 'http://8.130.76.127:3000'
```

## API 端点

所有 API 请求都会发送到：
- 开发环境: http://localhost:3000/api/*
- 生产环境: http://8.130.76.127:3000/api/*

### 主要端点
- POST /api/extractions - 创建提取任务
- GET /api/extractions/:id - 获取任务状态
- GET /api/extractions/:id/stream - SSE 实时进度
- POST /api/downloads/single - 下载单个图片
- POST /api/downloads/multiple - 下载多个图片（ZIP）

## 故障排除

### 跨域错误 (CORS)

如果看到类似错误：
```
Access to XMLHttpRequest at 'http://localhost:xxxx/api/extractions' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**检查清单：**

1. ✅ 确认后端服务运行在正确的端口（3000）
2. ✅ 重启 Vite 开发服务器
   ```bash
   # 停止服务器 (Ctrl+C)
   rm -rf node_modules/.vite
   npm run dev
   ```
3. ✅ 清除浏览器缓存并硬性刷新
4. ✅ 检查后端是否配置了正确的 CORS 设置
5. ✅ 确认 .env.development 文件中的配置正确

### SSE 连接失败

如果 SSE 连接失败：
1. 确认后端支持 SSE（/api/extractions/:id/stream 端点）
2. 检查网络请求，确认 URL 正确
3. 查看浏览器控制台的错误信息

## 构建生产版本

```bash
npm run build
```

构建后的文件在 `dist` 目录中。
