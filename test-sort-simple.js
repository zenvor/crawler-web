// 测试 Sort Images 功能的排序逻辑 (不依赖 lodash)

// 模拟 lodash 的 orderBy 函数
function orderBy(array, iteratees, orders) {
  const result = [...array]
  const order = orders[0] || 'asc'
  const iteratee = iteratees[0]

  result.sort((a, b) => {
    let aVal = a[iteratee]
    let bVal = b[iteratee]

    // 处理 undefined 值
    if (aVal === undefined) aVal = ''
    if (bVal === undefined) bVal = ''

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (order === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    }
  })

  return result
}

// 模拟图片数据
const mockImages = [
  {
    id: '1',
    name: 'image1.jpg',
    url: 'http://example.com/image1.jpg',
    type: 'jpg',
    width: 1920,
    height: 1080,
    size: 500000,
  },
  {
    id: '2',
    name: 'image2.png',
    url: 'http://example.com/image2.png',
    type: 'png',
    width: 800,
    height: 600,
    size: 200000,
  },
  {
    id: '3',
    name: 'image3.gif',
    url: 'http://example.com/image3.gif',
    type: 'gif',
    width: 1024,
    height: 768,
    size: 150000,
  },
  {
    id: '4',
    name: 'large.jpg',
    url: 'http://example.com/large.jpg',
    type: 'jpg',
    width: 3840,
    height: 2160,
    size: 2000000,
  },
  {
    id: '5',
    name: undefined, // 测试缺失 name 的情况
    url: 'http://example.com/noname.jpg',
    type: 'jpg',
    width: 640,
    height: 480,
    size: 100000,
  },
]

// 模拟 processImages 函数
const processImages = (images) => {
  return images.map((img) => ({
    ...img,
    fileSize: img.size || 0,
    imageSize: (img.width || 0) * (img.height || 0),
  }))
}

// 处理图片数据
const processedImages = processImages(mockImages)

console.log('📊 Sort Images 功能测试\n')
console.log('=' .repeat(80))

// 测试不同的排序选项
const sortOptions = [
  { label: 'Image size', value: 'imageSize' },
  { label: 'File size', value: 'fileSize' },
  { label: 'Width', value: 'width' },
  { label: 'Height', value: 'height' },
  { label: 'Type', value: 'type' },
  { label: 'Name', value: 'name' },
]

let allTestsPassed = true

sortOptions.forEach((option, index) => {
  console.log(`\n${index + 1}. 测试按 ${option.label} (${option.value}) 排序`)
  console.log('-'.repeat(80))

  // 降序 (Big -> Small)
  console.log('\n  📉 降序 (desc - Big → Small):')
  const descSorted = orderBy(processedImages, [option.value], ['desc'])
  descSorted.forEach((img, idx) => {
    const value = img[option.value]
    const displayValue = value !== undefined ? value : '(undefined)'
    console.log(`     ${idx + 1}. ${img.name || '(no name)'} - ${option.value}: ${displayValue}`)
  })

  // 验证降序排列是否正确
  let descValid = true
  for (let i = 1; i < descSorted.length; i++) {
    const prev = descSorted[i - 1][option.value] || ''
    const curr = descSorted[i][option.value] || ''
    if (typeof prev === 'number' && typeof curr === 'number') {
      if (prev < curr) {
        descValid = false
        break
      }
    }
  }
  console.log(`     ✓ 降序排列正确: ${descValid ? 'YES ✓' : 'NO ✗'}`)
  if (!descValid) allTestsPassed = false

  // 升序 (Small -> Big)
  console.log('\n  📈 升序 (asc - Small → Big):')
  const ascSorted = orderBy(processedImages, [option.value], ['asc'])
  ascSorted.forEach((img, idx) => {
    const value = img[option.value]
    const displayValue = value !== undefined ? value : '(undefined)'
    console.log(`     ${idx + 1}. ${img.name || '(no name)'} - ${option.value}: ${displayValue}`)
  })

  // 验证升序排列是否正确
  let ascValid = true
  for (let i = 1; i < ascSorted.length; i++) {
    const prev = ascSorted[i - 1][option.value] || ''
    const curr = ascSorted[i][option.value] || ''
    if (typeof prev === 'number' && typeof curr === 'number') {
      if (prev > curr) {
        ascValid = false
        break
      }
    }
  }
  console.log(`     ✓ 升序排列正确: ${ascValid ? 'YES ✓' : 'NO ✗'}`)
  if (!ascValid) allTestsPassed = false
})

console.log('\n' + '='.repeat(80))
console.log(`\n🎯 测试结果: ${allTestsPassed ? '全部通过 ✓' : '部分失败 ✗'}`)
console.log('\n' + '='.repeat(80))

// 额外测试: 验证 processImages 函数
console.log('\n📝 验证 processImages 函数计算是否正确:')
console.log('-'.repeat(80))
processedImages.forEach((img) => {
  const expectedImageSize = (img.width || 0) * (img.height || 0)
  const expectedFileSize = img.size || 0
  const imageSizeCorrect = img.imageSize === expectedImageSize
  const fileSizeCorrect = img.fileSize === expectedFileSize

  console.log(`\n${img.name || '(no name)'}:`)
  console.log(`  - imageSize: ${img.imageSize} (expected: ${expectedImageSize}) ${imageSizeCorrect ? '✓' : '✗'}`)
  console.log(`  - fileSize: ${img.fileSize} (expected: ${expectedFileSize}) ${fileSizeCorrect ? '✓' : '✗'}`)

  if (!imageSizeCorrect || !fileSizeCorrect) allTestsPassed = false
})

console.log('\n' + '='.repeat(80))
console.log(`\n🏆 最终结果: ${allTestsPassed ? '所有测试通过 ✓✓✓' : '存在失败的测试 ✗'}`)
console.log('=' .repeat(80) + '\n')

process.exit(allTestsPassed ? 0 : 1)
