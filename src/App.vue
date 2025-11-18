<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import orderBy from 'lodash/orderBy'
import cloneDeep from 'lodash/cloneDeep'
import Toast from 'primevue/toast'
import { useClipboard } from '@/composables/useClipboard'
import { useDownload } from '@/composables/useDownload'
import { useImageExtraction } from '@/composables/useImageExtraction'
import { useImageFilters } from '@/composables/useImageFilters'
import { useImageSort } from '@/composables/useImageSort'
import { usePagination } from '@/composables/usePagination'

// Import components
import AppHeader from '@/components/AppHeader.vue'
import ExtractionForm from '@/components/ExtractionForm.vue'
import SidebarControls from '@/components/SidebarControls.vue'
import ImageGrid from '@/components/ImageGrid.vue'
import FeaturesSection from '@/components/FeaturesSection.vue'
import FAQSection from '@/components/FAQSection.vue'

// ========== Composables ==========
const extraction = useImageExtraction()
const { copyMultipleLoading, copyTextSingleImageId, copySingleUrl, copySelectedUrls } = useClipboard()
const { downloadMultipleLoading, downloadSingleImageId, downloadSingleById, downloadSelectedByIds } = useDownload()

// ========== State Management ==========
const allImages = ref([])
const isInvertBackground = ref(false)
const listShow = ref(true)
const extractionResultRef = ref(null)
const imageGridRef = ref(null)

// Use composables
const filters = useImageFilters()
const sort = useImageSort()

// Filtered and sorted images (computed)
const images = computed(() => {
  const filteredImages = filters.applyFilters(allImages.value)
  return orderBy(filteredImages, [sort.selectionSortBy.value], [sort.sortType.value])
})

// Pagination
const pagination = usePagination(images)

// ========== Event Handlers ==========
// Extraction handlers
const handleExtract = async (link, imageMode) => {
  await extraction.handleExtract(link, imageMode, onExtractionSuccess)
}

const onExtractionSuccess = (extractedImages) => {
  allImages.value = cloneDeep(extractedImages)
  filters.findAllTypes(extractedImages)

  nextTick(() => {
    const offsetTop = extractionResultRef.value?.offsetTop || 0
    window.scrollTo({
      top: offsetTop - 100,
      behavior: 'smooth',
    })
  })
}

// Match original handler
watch(
  () => extraction.isMatchTheOriginalImage.value,
  async (newVal) => {
    if (newVal !== undefined) {
      await extraction.handleMatchOriginal(onMatchOriginalSuccess)
    }
  }
)

const onMatchOriginalSuccess = (matchedImages) => {
  filters.allTypes.value = {}
  pagination.resetPagination()

  allImages.value = cloneDeep(matchedImages)
  filters.findAllTypes(matchedImages)

  nextTick(() => {
    const offsetTop = extractionResultRef.value?.offsetTop || 0
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    })
  })
}

const handleTypeLabelClick = (key) => {
  if (Object.keys(filters.allTypes.value).length < 2) return

  if (filters.selectionType.value === key) {
    filters.selectionType.value = undefined
    return
  }
  filters.selectionType.value = key
}

// Image card handlers
const handleItemClick = (item) => {
  item.checked = !item.checked
}

// Image state map for O(1) lookup
const imageStates = new Map()

const handleImageLoad = (id) => {
  const image = allImages.value.find((item) => item.id === id)
  if (image) {
    image.imageLoaded = true
  }
}

const handleImageError = (id) => {
  const image = allImages.value.find((item) => item.id === id)
  if (image) {
    image.imageLoaded = true
    image.imageError = true
  }
}

// Download and copy handlers
const handleDownload = async (type, imageId) => {
  if (type === 'single') {
    return downloadSingleById(extraction.id.value, imageId)
  }
  const selectedImageIds = images.value.filter((item) => item.checked).map((item) => item.id)
  return downloadSelectedByIds(extraction.id.value, selectedImageIds)
}

const handleCopyUrl = (type, url, imageId) => {
  if (type === 'single') {
    return copySingleUrl(url, imageId)
  }
  const selectedImageUrl = images.value.filter((item) => item.checked).map((item) => item.url)
  return copySelectedUrls(selectedImageUrl)
}

const handleOpenInNewTab = (url) => {
  window.open(url)
}

// Selection handlers
const handleSelectAll = () => {
  allImages.value.forEach((item) => {
    if (filters.selectionType.value) {
      if (item.type === filters.selectionType.value) item.checked = true
    } else {
      item.checked = true
    }
  })
}

const handleDeselectAll = () => {
  allImages.value.forEach((item) => {
    if (filters.selectionType.value) {
      if (item.type === filters.selectionType.value) item.checked = false
    } else {
      item.checked = false
    }
  })
}

// Selection state (computed)
const selectedCount = computed(() => {
  const filteredImages = filters.selectionType.value
    ? images.value.filter((item) => item.type === filters.selectionType.value)
    : images.value
  return filteredImages.filter((item) => item.checked).length
})

const selectAllDisabled = computed(() => {
  const filteredImages = filters.selectionType.value
    ? images.value.filter((item) => item.type === filters.selectionType.value)
    : images.value
  return filteredImages.every((item) => item.checked)
})

const deselectAllDisabled = computed(() => {
  const filteredImages = filters.selectionType.value
    ? images.value.filter((item) => item.type === filters.selectionType.value)
    : images.value
  return !filteredImages.some((item) => item.checked)
})

// Pagination handlers
const handlePageChange = (event) => {
  pagination.handlePageChange(event)
}

const handleChangePage = ({ page }) => {
  pagination.handleChangePage({ page }, imageGridRef)
}

// Lifecycle
onBeforeUnmount(() => {
  extraction.cleanup()
})
</script>

<template>
  <div class="flex h-full flex-col min-h-screen bg-gray-100">
    <Toast position="bottom-center" group="bc" />

    <AppHeader />

    <main class="h-full">
      <ExtractionForm
        :extractLoading="extraction.extractLoading.value"
        :progress="extraction.progress.value"
        :message="extraction.message.value"
        @extract="handleExtract"
      />

      <div ref="extractionResultRef" v-if="allImages.length" class="py-12" data-test-id="extraction-result">
        <div class="mx-auto transition-all w-full max-w-screen-2xl px-6 sm:px-6 lg:px-8">
          <div class="flex flex-col md:flex-row">
            <SidebarControls
              :sortOptions="sort.sortOptions.value"
              v-model:selectionSortBy="sort.selectionSortBy.value"
              :firstText="sort.firstText.value"
              :lastText="sort.lastText.value"
              :allTypes="filters.allTypes.value"
              :selectionType="filters.selectionType.value"
              v-model:searchQuery="filters.searchQuery.value"
              v-model:isInvertBackground="isInvertBackground"
              v-model:isMatchTheOriginalImage="extraction.isMatchTheOriginalImage.value"
              :matchTheOriginalImageLoading="extraction.matchTheOriginalImageLoading.value"
              :selectAllDisabled="selectAllDisabled"
              :deselectAllDisabled="deselectAllDisabled"
              :selectedCount="selectedCount"
              :downloadMultipleLoading="downloadMultipleLoading"
              :copyMultipleLoading="copyMultipleLoading"
              @toggleSortOrder="sort.toggleSortOrder"
              @typeLabelClick="handleTypeLabelClick"
              @selectAll="handleSelectAll"
              @deselectAll="handleDeselectAll"
              @download="handleDownload"
              @copyUrl="handleCopyUrl"
            />

            <ImageGrid
              ref="imageGridRef"
              :currentPageData="pagination.currentPageData.value"
              :total="pagination.total.value"
              :totalPages="pagination.totalPages.value"
              :pageSize="pagination.pageSize.value"
              :websiteDomainName="extraction.websiteDomainName.value"
              :imagesCloneLength="allImages.length"
              :isInvertBackground="isInvertBackground"
              :copyTextSingleImageId="copyTextSingleImageId"
              :downloadSingleImageId="downloadSingleImageId"
              :matchTheOriginalImageLoading="extraction.matchTheOriginalImageLoading.value"
              :listShow="listShow"
              @itemClick="handleItemClick"
              @imageLoad="handleImageLoad"
              @imageError="handleImageError"
              @copyUrl="handleCopyUrl"
              @download="handleDownload"
              @openInNewTab="handleOpenInNewTab"
              @pageChange="handlePageChange"
              @changePage="handleChangePage"
            />
          </div>
        </div>
      </div>

      <FeaturesSection v-if="!extraction.images.value.length" />

      <FAQSection />
    </main>
  </div>
</template>

<style scoped>
:deep(.p-button-label) {
  font-weight: 500;
}

:deep(.p-input-icon-left > .p-inputtext) {
  padding-left: 3.1rem;
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-dropdown:enabled:focus) {
  box-shadow: 0 0 0 0.25rem #a7f3d0;
}

:deep(.p-inputtext.p-inputtext-lg) {
  font-size: 1.125rem;
}

:deep(.p-button) {
  justify-content: center;
}

:deep(.p-button-label) {
  flex: none;
}
</style>
