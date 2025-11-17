# Sort Images 功能审查报告

## 审查时间
2025-11-17

## 功能概述
Sort Images 功能允许用户按不同的字段对提取的图片进行排序,包括:
- Image size (图片尺寸 = width × height)
- File size (文件大小)
- Width (宽度)
- Height (高度)
- Type (类型)
- Name (名称)

用户可以在 Big→Small (降序) 和 Small→Big (升序) 之间切换。

## 代码位置
- 主要代码: `src/App.vue`
- 排序选项定义: 第 113-120 行
- 排序逻辑: 第 209-213 行
- 升降序切换: 第 218-231 行
- UI 组件: 第 936-970 行

## ✅ 功能正确性

### 1. 排序逻辑
使用 lodash 的 `orderBy` 方法进行排序,逻辑正确:
```javascript
images.value = _.orderBy(fuzzySearch(filterByType()), [selectionSortBy.value], [sortType.value])
```

### 2. 数据处理
在 `processImages` 函数中正确添加了前端所需的字段:
```javascript
fileSize: img.size || 0,
imageSize: (img.width || 0) * (img.height || 0)
```

### 3. 响应式更新
正确监听了排序字段和升降序的变化:
- `watch(selectionSortBy, () => disposalData())`
- `watch(isAscending, (newVal) => { ... })`

## ⚠️ 发现的问题

### 1. 调试代码未清理
**位置**: 第 210-211 行
```javascript
console.log('selectionSortBy.value', selectionSortBy.value)
console.log('sortType.value', sortType.value)
```
**问题**: 生产环境中应该移除调试日志
**建议**: 移除或使用环境变量控制

### 2. reset() 函数状态不完整
**位置**: 第 563-588 行
**问题**: reset() 函数重置了 `selectionSortBy`,但没有重置 `isAscending` 和 `sortType`
**影响**: 用户开始新的提取时,排序顺序(升序/降序)会保持上次的状态
**建议**: 在 reset() 中添加:
```javascript
isAscending.value = false
sortType.value = 'desc'
```

### 3. 缺少对空值的处理
**问题**: 如果某些图片缺少 name 字段,按 name 排序时可能出现意外结果
**当前处理**: lodash 的 orderBy 会将 undefined 值排在前面或后面
**建议**: 在 processImages 中添加默认值:
```javascript
name: img.name || 'Unknown'
```

### 4. 类型字段排序的语义问题
**问题**: 按 type 排序时,字符串按字母顺序排序(如 "gif" < "jpg" < "png"),但这可能不是用户期望的顺序
**建议**: 考虑定义类型的优先级顺序,或在 UI 中说明排序规则

## 🧪 测试建议

### 手动测试清单
1. ✓ 测试每个排序选项是否生效
2. ✓ 测试升降序切换是否正常
3. ✓ 测试排序与筛选(Filter by type)结合是否正常
4. ✓ 测试排序与搜索结合是否正常
5. ✓ 测试分页后排序是否保持
6. ✓ 测试切换"匹配原图"后排序是否保持

### 边界情况测试
1. 所有图片的某个字段都相同时
2. 某些图片缺少排序字段时
3. 只有一张图片时
4. 图片数量非常多时(性能测试)

## 📊 性能考虑

当前实现在每次排序时会:
1. 筛选类型(filterByType)
2. 模糊搜索(fuzzySearch)
3. 排序(orderBy)

**评估**: 对于普通数量的图片(几百张),性能应该没有问题。如果图片数量达到数千张,可能需要考虑优化。

## 💡 改进建议

### 优先级: 高
1. 移除调试 console.log
2. 完善 reset() 函数

### 优先级: 中
1. 添加对缺失字段的默认值处理
2. 添加防抖(debounce)以提高性能

### 优先级: 低
1. 考虑添加更多排序选项(如按 URL)
2. 考虑记住用户的排序偏好(localStorage)

## 总结

Sort Images 功能的核心逻辑是正确的,能够正常工作。发现的问题都是小问题,不会影响功能的基本使用,但建议进行改进以提升代码质量和用户体验。
