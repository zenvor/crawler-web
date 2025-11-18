import { ref, computed } from 'vue'

export function useImageFilters(images) {
  const selectionType = ref('')
  const searchQuery = ref('')
  const allTypes = ref({})

  // 判断一个字符串是否可以转化为数字
  const isNumeric = (str) => {
    return !isNaN(str) && !isNaN(parseFloat(str))
  }

  // 根据输入的文本进行模糊搜索
  const fuzzySearch = (imagesList) => {
    const text = searchQuery.value
    if (text) {
      let result = []
      if (isNumeric(text)) {
        // 如果可以转化为数字，就根据url, name, width, height进行搜索
        for (let i = 0; i < imagesList.length; i++) {
          let image = imagesList[i]
          let imageStr = image.url + image.name + image.width + image.height
          if (imageStr.indexOf(text) != -1) {
            result.push(image)
          }
        }
      } else {
        // 如果不可以转化为数字，就根据url, name, type进行搜索
        for (let i = 0; i < imagesList.length; i++) {
          let image = imagesList[i]
          let imageStr = image.url + image.name + image.type
          if (imageStr.indexOf(text) != -1) {
            result.push(image)
          }
        }
      }
      return result
    } else {
      return imagesList
    }
  }

  // 根据类型进行过滤
  const filterByType = (imagesList) => {
    const filterImages = imagesList.filter((item) => {
      if (selectionType.value) {
        return item.type == selectionType.value
      } else {
        return item
      }
    })
    return filterImages
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
