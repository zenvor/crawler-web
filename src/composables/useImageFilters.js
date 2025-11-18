import { ref } from 'vue'

export function useImageFilters() {
  const selectionType = ref('')
  const searchQuery = ref('')
  const allTypes = ref({})

  // 判断一个字符串是否可以转化为数字
  const isNumeric = (str) => {
    return !isNaN(str) && !isNaN(parseFloat(str))
  }

  // 根据输入的文本进行模糊搜索（优化版）
  const fuzzySearch = (imagesList) => {
    const text = searchQuery.value
    if (!text) return imagesList

    return imagesList.filter((image) => {
      const searchFields = isNumeric(text)
        ? [image.url, image.name, String(image.width), String(image.height)]
        : [image.url, image.name, image.type]

      const searchString = searchFields.join('')
      return searchString.includes(text)
    })
  }

  // 根据类型进行过滤
  const filterByType = (imagesList) => {
    if (!selectionType.value) return imagesList
    return imagesList.filter((item) => item.type === selectionType.value)
  }

  // 查找所有类型
  const findAllTypes = (imagesList) => {
    allTypes.value = {}
    selectionType.value = undefined
    imagesList.forEach((item) => {
      const type = item.type
      if (allTypes.value[type]) {
        allTypes.value[type]++
      } else {
        allTypes.value[type] = 1
      }
    })
  }

  // 应用所有过滤器
  const applyFilters = (imagesList) => {
    return fuzzySearch(filterByType(imagesList))
  }

  // 重置过滤器
  const resetFilters = () => {
    selectionType.value = ''
    searchQuery.value = ''
    allTypes.value = {}
  }

  return {
    selectionType,
    searchQuery,
    allTypes,
    fuzzySearch,
    filterByType,
    findAllTypes,
    applyFilters,
    resetFilters
  }
}
