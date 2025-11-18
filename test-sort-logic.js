// 测试 Sort Images 功能的排序逻辑
import _ from 'lodash'

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

console.log('原始图片数据:')
console.log(JSON.stringify(processedImages, null, 2))

// 测试不同的排序选项
const sortOptions = [
  { label: 'Image size', value: 'imageSize' },
  { label: 'File size', value: 'fileSize' },
  { label: 'Width', value: 'width' },
  { label: 'Height', value: 'height' },
  { label: 'Type', value: 'type' },
  { label: 'Name', value: 'name' },
]

console.log('\n=== 测试排序功能 ===\n')

sortOptions.forEach((option) => {
  console.log(`\n--- 按 ${option.label} (${option.value}) 排序 ---`)

  // 降序 (Big -> Small)
  const descSorted = _.orderBy(processedImages, [option.value], ['desc'])
  console.log(`降序 (desc):`)
  descSorted.forEach((img, index) => {
    const value = img[option.value]
    console.log(`  ${index + 1}. ${img.name || 'Unknown'} - ${option.value}: ${value}`)
  })

  // 升序 (Small -> Big)
  const ascSorted = _.orderBy(processedImages, [option.value], ['asc'])
  console.log(`升序 (asc):`)
  ascSorted.forEach((img, index) => {
    const value = img[option.value]
    console.log(`  ${index + 1}. ${img.name || 'Unknown'} - ${option.value}: ${value}`)
  })
})

console.log('\n=== 测试完成 ===')
