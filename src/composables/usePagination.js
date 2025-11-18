import { ref, computed } from 'vue'

export function usePagination(items, initialPageSize = 48) {
  const pageNum = ref(1)
  const pageSize = ref(initialPageSize)
  const paginatorRef = ref(null)

  const totalPages = computed(() => {
    return Math.ceil(items.value.length / pageSize.value)
  })

  const total = computed(() => {
    return items.value.length
  })

  // 当前页的数据
  const currentPageData = computed(() => {
    const start = (pageNum.value - 1) * pageSize.value
    const end = start + pageSize.value
    return items.value.slice(start, end)
  })

  // 分页改变触发
  const handlePageChange = (event) => {
    const page = event.page + 1
    pageNum.value = page
  }

  // 改变分页
  const handleChangePage = ({ page }) => {
    pageNum.value = page + 1
    if (paginatorRef.value) {
      paginatorRef.value.changePage(page)
    }
  }

  // 重置分页
  const resetPagination = () => {
    pageNum.value = 1
  }

  return {
    pageNum,
    pageSize,
    totalPages,
    total,
    currentPageData,
    paginatorRef,
    handlePageChange,
    handleChangePage,
    resetPagination
  }
}
