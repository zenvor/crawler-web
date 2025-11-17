# Sort Images 功能修复建议

## 修复 1: 移除调试代码

**文件**: `src/App.vue`
**位置**: 第 210-211 行

### 当前代码
```javascript
const disposalData = () => {
  console.log('selectionSortBy.value', selectionSortBy.value)
  console.log('sortType.value', sortType.value)
  images.value = _.orderBy(fuzzySearch(filterByType()), [selectionSortBy.value], [sortType.value])
}
```

### 修复后代码
```javascript
const disposalData = () => {
  images.value = _.orderBy(fuzzySearch(filterByType()), [selectionSortBy.value], [sortType.value])
}
```

---

## 修复 2: 完善 reset() 函数

**文件**: `src/App.vue`
**位置**: 第 563-588 行

### 当前代码
```javascript
const reset = () => {
  console.log('[Reset] 开始重置参数...')

  message.value = 'Waiting for browser...'
  progress.value = 0

  allTypes.value = {}
  selectionSortBy.value = 'imageSize'
  selectionType.value = ''

  websiteDomainName.value = ''
  isMatchTheOriginalImage.value = false

  total.value = 0
  images.value = []
  imagesClone.value = []

  // 清理旧的 WebSocket 连接
  if (ws) {
    console.log('[Reset] 检测到旧的 WebSocket 连接,正在关闭...')
    ws.close()
    ws = null
  }

  console.log('[Reset] 重置完成,progress:', progress.value, 'message:', message.value)
}
```

### 修复后代码
```javascript
const reset = () => {
  console.log('[Reset] 开始重置参数...')

  message.value = 'Waiting for browser...'
  progress.value = 0

  allTypes.value = {}
  selectionSortBy.value = 'imageSize'
  selectionType.value = ''

  // 重置排序顺序为默认值(降序)
  isAscending.value = false
  sortType.value = 'desc'

  websiteDomainName.value = ''
  isMatchTheOriginalImage.value = false

  total.value = 0
  images.value = []
  imagesClone.value = []

  // 清理旧的 WebSocket 连接
  if (ws) {
    console.log('[Reset] 检测到旧的 WebSocket 连接,正在关闭...')
    ws.close()
    ws = null
  }

  console.log('[Reset] 重置完成,progress:', progress.value, 'message:', message.value)
}
```

---

## 修复 3: 为缺失字段添加默认值(可选)

**文件**: `src/App.vue`
**位置**: 第 94-101 行

### 当前代码
```javascript
const processImages = (images) => {
  return images.map((img) => ({
    ...img,
    fileSize: img.size || 0,
    imageSize: (img.width || 0) * (img.height || 0),
  }))
}
```

### 修复后代码
```javascript
const processImages = (images) => {
  return images.map((img) => ({
    ...img,
    name: img.name || 'Unknown',
    type: img.type || 'unknown',
    fileSize: img.size || 0,
    imageSize: (img.width || 0) * (img.height || 0),
  }))
}
```

---

## 应用修复的方法

### 方法 1: 手动修复
直接在 `src/App.vue` 文件中按照上述建议修改代码。

### 方法 2: 使用 Claude Code
询问 Claude Code 应用这些修复。

---

## 修复优先级

| 修复 | 优先级 | 影响 |
|------|--------|------|
| 修复 1: 移除调试代码 | 高 | 生产环境性能和日志清洁度 |
| 修复 2: 完善 reset() | 中 | 用户体验一致性 |
| 修复 3: 添加默认值 | 低 | 边界情况处理 |

---

## 测试建议

应用修复后,建议测试:
1. 提取图片后,使用不同排序选项
2. 切换升序/降序
3. 进行第二次提取,验证排序状态是否重置
4. 测试包含缺失字段的图片
