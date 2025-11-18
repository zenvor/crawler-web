import { ref, computed } from 'vue'

export function useImageSort() {
  const sortOptions = ref([
    { label: 'Image size', value: 'imageSize' },
    { label: 'File size', value: 'fileSize' },
    { label: 'Width', value: 'width' },
    { label: 'Height', value: 'height' },
    { label: 'Type', value: 'type' },
    { label: 'Name', value: 'name' },
  ])

  const selectionSortBy = ref('imageSize')
  const sortType = ref('desc')
  const isAscending = ref(false)

  const firstText = computed(() => isAscending.value ? 'Small' : 'Big')
  const lastText = computed(() => isAscending.value ? 'Big' : 'Small')

  const toggleSortOrder = () => {
    isAscending.value = !isAscending.value
    sortType.value = isAscending.value ? 'asc' : 'desc'
  }

  const resetSort = () => {
    selectionSortBy.value = 'imageSize'
    sortType.value = 'desc'
    isAscending.value = false
  }

  return {
    sortOptions,
    selectionSortBy,
    sortType,
    isAscending,
    firstText,
    lastText,
    toggleSortOrder,
    resetSort
  }
}
