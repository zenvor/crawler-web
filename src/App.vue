<script setup>
import { ref, nextTick, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { extractions, matchingMechanism, downloadMultiple, downloadSingle } from '@/api/extract'
import _ from 'lodash'
import axios from 'axios'

// WebSocket 连接
let ws = null

import TypeLabel from '@/components/TypeLabel.vue'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import TriStateCheckbox from 'primevue/tristatecheckbox'
import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import ToggleButton from 'primevue/togglebutton'
import Paginator from 'primevue/paginator'
import Image from 'primevue/image'
import Skeleton from 'primevue/skeleton'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useClipboard } from '@/composables/useClipboard'
import { useDownload } from '@/composables/useDownload'
const toast = useToast()

const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  console.log('[Lifecycle] 组件已挂载')
  window.addEventListener('scroll', handleScroll)
})
onBeforeUnmount(() => {
  console.log('[Lifecycle] 组件即将卸载')
  window.removeEventListener('scroll', handleScroll)
  // 清理 WebSocket 连接
  if (ws) {
    console.log('[Lifecycle] 清理 WebSocket 连接')
    ws.close()
    ws = null
  }
})

const link = ref('')
const websiteDomainName = ref('')
const isInputFocus = ref(false)

const validateURL = (value) => {
  const urlRegex = /^(https?:\/\/\S+|file:\/\/\/[A-Za-z]:\/(\S+)|\/\S+)$/
  return urlRegex.test(value)
}

const disabled = ref(true)

// 使用 watch 监听 link
watch(
  link,
  (newVal) => {
    if (validateURL(newVal)) {
      // 链接通过验证，解除按钮禁用状态
      disabled.value = false
    } else {
      // 链接未通过验证，禁用按钮
      disabled.value = true
    }
  },
  { immediate: true }
)

const images = ref([])
const id = ref('')
const extractLoading = ref(false)
const progress = ref(0)
const message = ref('Waiting for browser...')
const total = ref(0)

watch(images, () => {
  total.value = images.value.length
})

const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return Math.round(bytes / 1024) + ' KB'
  } else {
    return Math.round(bytes / (1024 * 1024)) + ' MB'
  }
}

// 处理后端返回的图片数据,添加前端所需的字段
const processImages = (images) => {
  return images.map((img) => ({
    ...img,
    name: img.name || 'Unknown', // 为缺失的名称提供默认值
    type: img.type || 'unknown', // 为缺失的类型提供默认值
    fileSize: img.size || 0, // 后端返回的 size 字段(字节数)
    imageSize: (img.width || 0) * (img.height || 0), // 图片尺寸(像素总数)
  }))
}

const parseLink = (link) => {
  if (!link) return
  // 创建一个URL对象，传入链接字符串
  let urlObj = new URL(link)
  // 获取URL对象的hostname属性，即域名
  let domain = urlObj.hostname
  // 返回域名
  return domain
}

const sortOptions = ref([
  { label: 'Image size', value: 'imageSize' },
  { label: 'File size', value: 'fileSize' },
  { label: 'Width', value: 'width' },
  { label: 'Height', value: 'height' },
  { label: 'Type', value: 'type' },
  { label: 'Name', value: 'name' },
])

const firstText = ref('Big')
const lastText = ref('Small')
const isAscending = ref(false) // 是否是升序

const selectionSortBy = ref('imageSize')
const sortType = ref('desc')

const selectionType = ref('')

const listShow = ref(true)

const rerender = () => {
  listShow.value = false
  nextTick(() => (listShow.value = true))
}

// 点解类型标签触发
const handleTypeLabelClick = (key) => {
  if (Object.keys(allTypes.value).length < 2) return
  rerender()

  if (selectionType.value == key) return (selectionType.value = undefined)
  selectionType.value = key
}

const imagesClone = ref([])

const searchQuery = ref('')
// 判断一个字符串是否可以转化为数字
const isNumeric = (str) => {
  return !isNaN(str) && !isNaN(parseFloat(str))
}

// 根据输入的文本进行模糊搜索
const fuzzySearch = (images) => {
  const text = searchQuery.value
  if (text) {
    // 用于存放搜索结果
    let result = []
    // 判断输入的文本是否可以转化为数字
    if (isNumeric(text)) {
      // 如果可以转化为数字，就根据url, name, width, height进行搜索
      for (let i = 0; i < images.length; i++) {
        // 获取当前图片的信息
        let image = images[i]
        // 将图片的信息转化为字符串
        let imageStr = image.url + image.name + image.width + image.height
        // 判断图片的信息是否包含输入的文本
        if (imageStr.indexOf(text) != -1) {
          // 如果包含，就将图片添加到结果数组中
          result.push(image)
        }
      }
    } else {
      // 如果不可以转化为数字，就根据url, name, type进行搜索
      for (let i = 0; i < images.length; i++) {
        // 获取当前图片的信息
        let image = images[i]
        // 将图片的信息转化为字符串
        let imageStr = image.url + image.name + image.type
        // 判断图片的信息是否包含输入的文本
        if (imageStr.indexOf(text) != -1) {
          // 如果包含，就将图片添加到结果数组中
          result.push(image)
        }
      }
    }
    //返回结果数组
    return result
  } else {
    return images
  }
}

// 根据类型进行过滤
const filterByType = () => {
  const filterImages = imagesClone.value.filter((item) => {
    if (selectionType.value) {
      return item.type == selectionType.value
    } else {
      return item
    }
  })
  return filterImages
}

// 整理数据
const disposalData = () => {
  images.value = _.orderBy(fuzzySearch(filterByType()), [selectionSortBy.value], [sortType.value])
}

// 搜索框的输入触发
const handleSearchQueryUpdate = (event) => disposalData()

watch(isAscending, (newVal) => {
  if (newVal) {
    // Small => Big
    firstText.value = 'Small'
    lastText.value = 'Big'
    sortType.value = 'asc'
  } else {
    // Big => Small
    firstText.value = 'Big'
    lastText.value = 'Small'
    sortType.value = 'desc'
  }
  disposalData()
})

watch(selectionSortBy, () => disposalData())
watch(selectionType, () => disposalData())

// 图片背景反色
const isInvertBackground = ref(false)

const pageNum = ref(1)
const pageSize = ref(48)
const totalPages = ref(0)
const paginatorRef = ref(null)

// 当前页的数据
const currentPageData = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value
  const end = start + pageSize.value
  totalPages.value = Math.ceil(images.value.length / pageSize.value)
  return images.value.slice(start, end)
})

// 分页改变触发
const handlePageChange = (event) => {
  const page = event.page + 1
  pageNum.value = page

  // 重新渲染
  rerender()
}

// 改变分页
const handleChangePage = ({ page }) => {
  pageNum.value = page + 1
  paginatorRef.value.changePage(page)

  // 重新渲染
  rerender()
}

// 匹配原图
const isMatchTheOriginalImage = ref(false)
const matchTheOriginalImageLoading = ref(false)

watch(isMatchTheOriginalImage, async (newVal) => {
  const mechanism = newVal ? 'original' : 'default'

  matchTheOriginalImageLoading.value = true

  const response = await matchingMechanism(id.value, mechanism)

  if (!response.images.length) {
    extractLoading.value = false
    isMatchTheOriginalImage.value = false
    matchTheOriginalImageLoading.value = false

    return toast.add({
      severity: 'error',
      summary: 'No image was extracted',
      group: 'bc',
      life: 3000,
    })
  }

  allTypes.value = {}
  pageNum.value = 1
  pageSize.value = 48
  totalPages.value = 0

  images.value = processImages(response.images)
  imagesClone.value = _.cloneDeep(images.value)

  disposalData()

  // 重新渲染
  rerender()

  nextTick(() => {
    const offsetTop = extractionResultRef.value?.offsetTop || 0
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    })
  })

  findAllTypes()

  setTimeout(() => {
    matchTheOriginalImageLoading.value = false
  }, 500)
})

const allTypes = ref({})
const extractionResultRef = ref(null)

// 查找所有类型
const findAllTypes = () => {
  selectionType.value = undefined
  images.value.map((item) => {
    const type = item.type

    if (allTypes.value[type]) {
      allTypes.value[type]++
    } else {
      allTypes.value[type] = 1
    }
  })
}

// 点击卡片触发
const handleItemClick = (item) => {
  item.checked ? (item.checked = false) : (item.checked = true)
}

let selectAllDisabled = ref(false)
let deselectAllDisabled = ref(true)
let selectedCount = ref(0)

watch(
  images,
  (newVal) => {
    if (selectionType.value) newVal = newVal.filter((item) => item.type == selectionType.value)
    selectedCount.value = newVal.filter((item) => item.checked).length
    selectAllDisabled.value = newVal.every((item) => item.checked)
    deselectAllDisabled.value = !newVal.some((item) => item.checked)
  },
  { deep: true }
)

const selectAllOrDeselectAll = (array, boolean) => {
  array.forEach((item) => {
    if (selectionType.value) {
      if (item.type == selectionType.value) item.checked = boolean
    } else {
      item.checked = boolean
    }
  })
}

// 选中全部
const handleSelectAll = () => {
  selectAllOrDeselectAll(images.value, true)
  selectAllOrDeselectAll(imagesClone.value, true)
}

// 取消选中全部
const handleDeselectAll = () => {
  selectAllOrDeselectAll(images.value, false)
  selectAllOrDeselectAll(imagesClone.value, false)
}

const handleImageLoad = (id) => {
  for (let i = 0; i < images.value.length; i++) {
    const item = images.value[i]
    if (item.id == id) {
      item.imageLoaded = true
      break
    }
  }
}

const handleImageError = (id) => {
  for (let i = 0; i < images.value.length; i++) {
    const item = images.value[i]
    if (item.id == id) {
      item.imageLoaded = true
      item.imageError = true
      break
    }
  }
}

const { copyMultipleLoading, copyTextSingleImageId, copySingleUrl, copySelectedUrls } = useClipboard()
const { downloadMultipleLoading, downloadSingleImageId, downloadSingleById, downloadSelectedByIds } = useDownload()

const handleDownload = async (type, imageId) => {
  if (type === 'single') {
    return downloadSingleById(id.value, imageId)
  }
  const selectedImageIds = images.value.filter((item) => item.checked).map((item) => item.id)
  return downloadSelectedByIds(id.value, selectedImageIds)
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

const handleExtract = async () => {
  console.log('[Extract] ========== 开始新的提取任务 ==========')

  // pending
  reset()

  extractLoading.value = true
  console.log('[Extract] extractLoading 设置为 true')

  try {
    console.log('[Extract] 正在创建提取任务，URL:', link.value)
    const extraction = await extractions('post', { url: link.value, mode: 'advanced' })
    id.value = extraction.id
    websiteDomainName.value = extraction.url
    console.log('[Extract] 任务创建成功，taskId:', id.value)

    // 使用 WebSocket 获取实时进度
    const wsUrl = import.meta.env.VITE_APP_BASE_WS_API
    const wsFullUrl = `${wsUrl}/?taskId=${id.value}`
    console.log('[Extract] 正在建立 WebSocket 连接:', wsFullUrl)
    ws = new WebSocket(wsFullUrl)

    ws.onopen = () => {
      console.log('[WebSocket] ✅ 连接已建立')
    }

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      console.log('[WebSocket] 📨 收到消息:', data)

      try {
        if (data.type === 'connected') {
          console.log('[WebSocket] 🔗 连接确认:', data.message)
        } else if (data.type === 'progress') {
          console.log('[WebSocket] 📊 进度更新 - progress:', data.progress, 'message:', data.message)
          console.log('[WebSocket] 更新前 - progress.value:', progress.value, 'message.value:', message.value)
          message.value = data.message
          progress.value = data.progress
          console.log('[WebSocket] 更新后 - progress.value:', progress.value, 'message.value:', message.value)
        } else if (data.type === 'complete') {
          console.log('[WebSocket] ✅ 任务完成，images_count:', data.images_count)
          ws.close()
          ws = null

          // 获取最终结果
          console.log('[Extract] 正在获取最终结果...')
          const response = await extractions('get', { id: id.value })
          console.log('[Extract] 获取到', response.images?.length || 0, '张图片')

          images.value = processImages(response.images || [])

          if (!images.value.length) {
            console.log('[Extract] ❌ 没有提取到图片')
            extractLoading.value = false

            return toast.add({
              severity: 'error',
              summary: 'No image was extracted',
              group: 'bc',
              life: 3000,
            })
          }

          imagesClone.value = _.cloneDeep(images.value)

          disposalData()

          nextTick(() => {
            const offsetTop = extractionResultRef.value?.offsetTop || 0
            window.scrollTo({
              top: offsetTop - 100,
              behavior: 'smooth',
            })
          })

          findAllTypes()

          extractLoading.value = false
          console.log('[Extract] ========== 提取任务完成 ==========')
        } else if (data.type === 'error') {
          console.log('[WebSocket] ❌ 任务失败:', data.message)
          ws.close()
          ws = null
          extractLoading.value = false

          toast.add({
            severity: 'error',
            summary: 'Extraction failed',
            detail: data.message,
            group: 'bc',
            life: 3000,
          })
        }
      } catch (error) {
        console.error('[WebSocket] ❌ 处理消息时出错:', error)
        if (ws) {
          ws.close()
          ws = null
        }
        extractLoading.value = false
      }
    }

    ws.onerror = (error) => {
      console.error('[WebSocket] ❌ 连接错误:', error)
      if (ws) {
        ws.close()
        ws = null
      }
      extractLoading.value = false

      toast.add({
        severity: 'error',
        summary: 'Connection error',
        detail: 'Failed to connect to server',
        group: 'bc',
        life: 3000,
      })
    }

    ws.onclose = (event) => {
      console.log('[WebSocket] 🔌 连接已关闭 - code:', event.code, 'reason:', event.reason, 'wasClean:', event.wasClean)
      ws = null
    }
  } catch (error) {
    console.error('[Extract] ❌ 创建任务失败:', error)
    extractLoading.value = false

    toast.add({
      severity: 'error',
      summary: 'Failed to create extraction task',
      group: 'bc',
      life: 3000,
    })
  }
}

// 重置参数
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
    console.log('[Reset] 检测到旧的 WebSocket 连接，正在关闭...')
    ws.close()
    ws = null
  }

  console.log('[Reset] 重置完成，progress:', progress.value, 'message:', message.value)
}
</script>

<template>
  <div class="flex h-full flex-col min-h-screen bg-gray-100">
    <Toast position="bottom-center" group="bc" />

    <nav
      :class="[
        { 'bg-white !text-black shadow-md py-0': isScrolled },
        { 'bg-zinc-800': !isScrolled },
        'fixed inset-x-0 top-0 z-30 transition-all duration-200',
      ]"
    >
      <div class="mx-auto transition-all w-full max-w-7xl px-6 sm:px-6 lg:px-8">
        <div :class="[{ '!py-3': isScrolled }, { 'text-white py-6': !isScrolled }, 'grid grid-cols-3 transition-all']">
          <div class="flex items-center space-x-6">
            <div class="flex items-center shrink-0">
              <div href="/" class="flex">
                <a href="/">
                  <img src="@/assets/images/logo.svg" class="logo block w-auto h-9" />
                </a>
                <div class="ml-3 text-sm font-medium flex flex-col">
                  <a href="/">Image Extractor</a>
                  <a
                    :class="[
                      { 'text-emerald-700': isScrolled },
                      'text-xs mt-[2px] leading-none inline-block hover:underline font-semibold text-emerald-500',
                    ]"
                    href="/"
                    >0.1 Beta</a
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-center invisible space-x-4 md:visible">
            <a
              class="inline-flex items-center px-3 py-1.5 transition font-medium rounded-lg opacity-60 hover:opacity-100 !opacity-100"
              href
              >Extract</a
            >
          </div>

          <div class="flex items-center justify-end h-10">
            <div class="md:flex md:items-center">
              <img src="@/assets/images/vite.svg" class="frame-logo rounded block w-auto h-9" />
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="h-full">
      <div class="relative flex flex-col justify-center transition-all duration-300">
        <div class="absolute bg-zinc-800 h-[80%] pointer-events-none w-full top-0 inset-x-0"></div>
        <div class="py-12 relative z-10 pt-48">
          <div class="mx-auto transition-all w-full max-w-7xl px-6 sm:px-6 lg:px-8">
            <div class="flex flex-col justify-center transition-all duration-500">
              <div>
                <div class="text-center text-white">
                  <h1 class="mb-2 text-[3.25rem] leading-none font-extrabold">Extract images</h1>
                  <h2 class="text-xl text-gray-400">from any public website</h2>
                </div>

                <div
                  class="transition-all duration-200 relative w-full max-w-3xl mx-auto bg-white rounded-tl-none shadow-2xl mt-28 rounded-xl"
                >
                  <div
                    class="absolute top-0 left-0 right-0 flex items-end overflow-hidden text-sm -translate-y-full select-none"
                  >
                    <div
                      class="px-6 flex items-center font-semibold transition-all translate-y-0.5 bg-gray-300 cursor-pointer rounded-t-xl hover:bg-gray-200 !bg-white shadow-md !translate-y-0 z-10 !h-9"
                    >
                      Single Site
                    </div>
                    <div
                      class="px-6 h-8 flex items-center font-semibold transition-all translate-y-0.5 bg-gray-300 cursor-pointer rounded-t-xl hover:bg-gray-200"
                    >
                      Multiple Sites
                    </div>
                  </div>

                  <div
                    class="relative overflow-hidden"
                    style="
                      transition-duration: 200ms;
                      transition-property: height;
                      transition-timing-function: ease;
                      --duration: 200ms;
                    "
                  >
                    <div class="p-6">
                      <form class="flex flex-col sm:flex-row gap-3">
                        <div class="flex-1">
                          <span style="position: relative" class="relative p-input-icon-left w-full h-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              :style="{
                                'font-size': '1.4rem',
                                transition: 'all 200ms',
                                color: isInputFocus ? 'rgb(5, 150, 105)' : 'black',
                              }"
                              class="icon-tabler icon-tabler-link translate-x-1.5 -translate-y-1"
                              width="24px"
                              height="24px"
                              viewBox="0 0 24 24"
                              stroke-width="2"
                              stroke="currentColor"
                              fill="none"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                              <path d="M9 15l6 -6" />
                              <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
                              <path
                                d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"
                              />
                            </svg>
                            <InputText
                              @focus="isInputFocus = true"
                              @blur="isInputFocus = false"
                              size="large"
                              v-model="link"
                              class="pl-16 h-14 text-base w-full"
                              placeholder="Enter any URL, like google.com"
                            />
                          </span>
                        </div>
                        <Button
                          :disabled="disabled"
                          :loading="extractLoading"
                          @click="handleExtract"
                          label="Extract"
                          class="whitespace-nowrap !text-lg"
                        >
                          <template #loadingicon>
                            <div
                              :class="[
                                'w-6 h-6 opacity-100 scale-100 mr-2 -ml-2',
                                'flex items-center justify-center overflow-hidden w-0 opacity-0 scale-0 h-0',
                              ]"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="icon-tabler icon-tabler-loader animate-spin w-6"
                                width="24px"
                                height="24px"
                                viewBox="0 0 24 24"
                                stroke-width="2"
                                stroke="currentColor"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M12 6l0 -3" />
                                <path d="M16.25 7.75l2.15 -2.15" />
                                <path d="M18 12l3 0" />
                                <path d="M16.25 16.25l2.15 2.15" />
                                <path d="M12 18l0 3" />
                                <path d="M7.75 16.25l-2.15 2.15" />
                                <path d="M6 12l-3 0" />
                                <path d="M7.75 7.75l-2.15 -2.15" />
                              </svg>
                            </div>
                          </template>
                        </Button>
                      </form>
                    </div>
                  </div>
                  <!-- progress -->
                  <div
                    class="relative overflow-hidden"
                    :style="{
                      'transition-duration': '200ms',
                      'transition-property': 'height',
                      'transition-timing-function': 'ease',
                      '--duration': '200ms',
                      height: `${extractLoading ? '100' : '0'}px`,
                    }"
                  >
                    <transition name="fade" mode="out-in">
                      <div v-show="extractLoading" class="p-6 pt-0">
                        <div>
                          <div class="px-5 py-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                            <p class="mb-2 font-medium">{{ message }}</p>
                            <div class="relative h-2.5 overflow-hidden bg-gray-300 rounded-full">
                              <div
                                role="progressbar"
                                class="h-full rounded-full transition-all duration-500 bg-emerald-500"
                                :style="{
                                  width: `${progress}%`,
                                  'background-size': '1.25rem 1.25rem',
                                  'background-image': `linear-gradient(
                                      45deg,
                                      rgba(255, 255, 255, 0.15) 25%,
                                      transparent 25%,
                                      transparent 50%,
                                      rgba(255, 255, 255, 0.15) 50%,
                                      rgba(255, 255, 255, 0.15) 75%,
                                      transparent 75%,
                                      transparent
                                    )`,
                                  animation: '1000ms linear 0s infinite normal none running progress-stripes',
                                }"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </transition>
                  </div>

                  <!-- prompt -->
                  <div
                    v-show="false"
                    class="relative overflow-hidden"
                    style="
                      transition-duration: 200ms;
                      transition-property: height;
                      transition-timing-function: ease;
                      --duration: 200ms;
                    "
                  >
                    <div class="p-6 pt-0">
                      <div
                        class="flex items-start px-5 py-4 rounded-xl bg-opacity-10 base-alert bg-blue-500 text-blue-900"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="icon-tabler icon-tabler-info-circle-filled shrink-0 drop-shadow-md text-blue-500 w-6 h-6 mr-3"
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path
                            d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm0 9h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007v3l.007 .117a1 1 0 0 0 .876 .876l.117 .007h1l.117 -.007a1 1 0 0 0 .876 -.876l.007 -.117l-.007 -.117a1 1 0 0 0 -.764 -.857l-.112 -.02l-.117 -.006v-3l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007zm.01 -3l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z"
                            stroke-width="0"
                            fill="currentColor"
                          ></path>
                        </svg>
                        <div>
                          <div class="font-medium">
                            We are experiencing a high load of requests. Your extraction is still in the queue and
                            waiting to be picked up. Please wait a moment.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- error -->
                  <div
                    v-show="false"
                    class="relative overflow-hidden"
                    style="
                      transition-duration: 200ms;
                      transition-property: height;
                      transition-timing-function: ease;
                      --duration: 200ms;
                    "
                  >
                    <div class="p-6 pt-0">
                      <div
                        class="flex items-start px-5 py-4 rounded-xl bg-opacity-10 base-alert bg-red-500 text-red-900"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="icon-tabler icon-tabler-alert-circle-filled shrink-0 drop-shadow-md text-red-500 w-6 h-6 mr-3"
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                          <path
                            d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 -5.393 4.566 -9.72 9.996 -9.72zm.01 13l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z"
                            stroke-width="0"
                            fill="currentColor"
                          ></path>
                        </svg>
                        <div>
                          <div class="mt-1 mb-2 text-lg font-bold leading-none">Extraction failed</div>
                          <div class="font-medium">
                            <div class="whitespace-pre-line">
                              Something went wrong. Please check the website you provided and try again. If the problem
                              persists, please contact us or try again later.
                            </div>
                            <!---->
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 广告投放处 -->
      <!-- <div class="placeholder">
        <div class="mx-auto transition-all w-full max-w-screen-2xl px-6 sm:px-6 lg:px-8">
          <div class="w-full advertisement py-10" align="center">
            <Image alt="Image">
              <template #image>
                <img class="rounded-md" src="@/assets/images/IMG_20231030_183641.jpg" alt="image" />
              </template>
            </Image>
            <ins
              class="ads-by-google"
              data-ad-test="off"
              data-ad-client="ca-pub-9215090689604809"
              data-ad-slot="8623243556"
              data-ad-format="auto"
              data-full-width-responsive="true"
              style="display: block"
            ></ins>
          </div>
        </div>
      </div> -->

      <div ref="extractionResultRef" v-if="imagesClone.length" class="py-12" data-test-id="extraction-result">
        <div class="mx-auto transition-all w-full max-w-screen-2xl px-6 sm:px-6 lg:px-8">
          <div class="flex flex-col md:flex-row">
            <div class="md:w-[300px] shrink-0 md:mr-12 mb-12 md:mb-0">
              <div class="sticky space-y-8 top-24">
                <div>
                  <div class="space-y-6">
                    <div>
                      <div>
                        <div class="relative" data-headlessui-state>
                          <div class="flex items-center justify-between mb-1">
                            <label id="headlessui-listbox-label-1" data-headlessui-state class="font-medium"
                              >Sort images</label
                            >
                            <div class="space-x-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                              <button @click="isAscending = !isAscending" class="flex items-center">
                                {{ firstText }}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  class="icon-tabler icon-tabler-arrow-right h-[18px]"
                                  width="24px"
                                  height="24px"
                                  viewBox="0 0 24 24"
                                  stroke-width="2"
                                  stroke="currentColor"
                                  fill="none"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                >
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                  <path d="M5 12l14 0" />
                                  <path d="M13 18l6 -6" />
                                  <path d="M13 6l6 6" />
                                </svg>
                                {{ lastText }}
                              </button>
                            </div>
                          </div>
                          <Dropdown
                            ref="dropdownRef"
                            v-model="selectionSortBy"
                            :options="sortOptions"
                            optionLabel="label"
                            optionValue="value"
                            class="w-full md:w-14rem"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 class="mb-1 font-medium">Filter images by type</h5>
                      <div
                        style="border-width: 1px"
                        class="flex flex-wrap gap-2 p-3 bg-white hover:border-emerald-500 transition-all ease-linear border-gray-300 rounded-md shadow-sm min-h-[44px]"
                      >
                        <TypeLabel
                          @click="handleTypeLabelClick(key)"
                          v-for="(value, key) in allTypes"
                          :key="key"
                          :blur="selectionType ? key != selectionType : undefined"
                          :type="key"
                          :number="value"
                        />
                      </div>
                    </div>
                    <div>
                      <label class="block mb-1 font-medium">Search for images</label>
                      <div class="relative w-full">
                        <div class="relative">
                          <InputText
                            type="text"
                            v-model="searchQuery"
                            @input="handleSearchQueryUpdate"
                            class="w-full px-3.5 placeholder-gray-400 transition rounded"
                            placeholder="Type to search..."
                          />

                          <div class="absolute flex gap-2 -translate-y-1/2 right-4 top-1/2"></div>
                        </div>
                      </div>
                      <div class="mt-1.5 leading-tight text-xs text-gray-500">
                        Find by URL, name, type and width/height.
                      </div>
                    </div>
                    <div>
                      <label class="flex items-start cursor-pointer">
                        <Checkbox v-model="isInvertBackground" :binary="true" class="translate-y-1" />
                        <div class="ml-2">
                          <div class="font-medium select-none">Invert image preview background</div>
                          <div class="mt-1 text-xs text-gray-500">
                            Can't see some images? Change the image background to a dark color.
                          </div>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label class="block mb-1 font-medium">Try to match the original image</label>
                      <div class="relative w-full">
                        <div class="relative">
                          <ToggleButton
                            :disabled="matchTheOriginalImageLoading"
                            v-model="isMatchTheOriginalImage"
                            onLabel="original"
                            offLabel="default"
                            class="w-full"
                          />

                          <div class="absolute flex gap-2 -translate-y-1/2 right-4 top-1/2"></div>
                        </div>
                      </div>
                      <div class="mt-1.5 leading-tight text-xs text-gray-500">
                        Match the original image based on the thumbnail.
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 class="mb-2 font-bold uppercase text">Download</h4>
                  <div>
                    <div class="flex mb-2 space-x-2">
                      <Button
                        :disabled="selectAllDisabled"
                        type="button"
                        label="Select all"
                        icon="pi pi-check-circle"
                        @click="handleSelectAll"
                        class="whitespace-nowrap !text-base w-[50%]"
                      />
                      <Button
                        size="small"
                        :disabled="deselectAllDisabled"
                        type="button"
                        label="Deselect all"
                        icon="pi pi-circle"
                        @click="handleDeselectAll"
                        class="whitespace-nowrap !text-base w-[50%]"
                      />
                    </div>
                    <div class="mt-6">
                      <button
                        @click="handleDownload('multiple')"
                        type="submit"
                        :class="[
                          { 'opacity-50 pointer-events-none': downloadMultipleLoading },
                          'relative items-center flex justify-center font-medium transition border border-transparent rounded-md cursor-pointer select-none disabled:pointer-events-none disabled:opacity-25 tabular-num w-full disabled:!shadow-none h-14 text-lg px-6 bg-gray-800 hover:bg-gray-700 shadow active:bg-gray-900 text-white',
                        ]"
                        :disabled="deselectAllDisabled"
                      >
                        <div
                          :class="[
                            { 'w-6 h-6 opacity-100 scale-100 mr-2 -ml-2': downloadMultipleLoading },
                            'flex items-center justify-center overflow-hidden w-0 opacity-0 scale-0 h-0',
                          ]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon-tabler icon-tabler-loader animate-spin w-6"
                            width="24px"
                            height="24px"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 6l0 -3" />
                            <path d="M16.25 7.75l2.15 -2.15" />
                            <path d="M18 12l3 0" />
                            <path d="M16.25 16.25l2.15 2.15" />
                            <path d="M12 18l0 3" />
                            <path d="M7.75 16.25l-2.15 2.15" />
                            <path d="M6 12l-3 0" />
                            <path d="M7.75 7.75l-2.15 -2.15" />
                          </svg>
                        </div>

                        <div :class="[{ hidden: downloadMultipleLoading }, 'mr-2 -ml-2']">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="'icon-tabler icon-tabler-download w-6"
                            width="24px"
                            height="24px"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                            <path d="M7 11l5 5l5 -5" />
                            <path d="M12 4l0 12" />
                          </svg>
                        </div>
                        <span>
                          Download selected
                          <span v-show="selectedCount">({{ selectedCount }})</span>
                        </span>
                      </button>

                      <button
                        type="submit"
                        @click="handleCopyUrl('multiple')"
                        :class="[
                          { 'opacity-50 pointer-events-none': copyMultipleLoading },
                          'relative items-center flex justify-center font-medium transition border border-transparent rounded-md cursor-pointer select-none disabled:opacity-25 tabular-num w-full disabled:pointer-events-none disabled:!shadow-none h-10 text-[1rem] px-4 bg-white disabled:!border-gray-300 shadow hover:bg-gray-100 active:bg-gray-50 text-black mt-3',
                        ]"
                        :disabled="deselectAllDisabled"
                      >
                        <div :class="[{ hidden: !copyMultipleLoading }, 'mr-2 -ml-2']">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon-tabler icon-tabler-check w-5"
                            width="24px"
                            height="24px"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M5 12l5 5l10 -10" />
                          </svg>
                        </div>

                        <div :class="[{ hidden: copyMultipleLoading }, 'mr-2 -ml-2']">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon-tabler icon-tabler-clipboard-text w-5"
                            width="24px"
                            height="24px"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path
                              d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"
                            />
                            <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                            <path d="M9 12h6" />
                            <path d="M9 16h6" />
                          </svg>
                        </div>
                        <span class>{{ copyMultipleLoading ? 'Copied to clipboard' : 'Copy selected URLs' }}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="w-full advertisement !mt-16" align="center">
                  <ins
                    class="adsbygoogle"
                    data-adtest="off"
                    data-ad-client="ca-pub-9215090689604809"
                    data-ad-slot="7074848071"
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                    style="display: block"
                  ></ins>
                </div>
              </div>
            </div>

            <div class="flex-1">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-5">
                <div class>
                  Showing {{ currentPageData.length }} of {{ imagesClone.length }} images from
                  <strong>{{ parseLink(websiteDomainName) }}</strong>
                </div>
                <div class="flex items-center mt-2 sm:mt-0 sm:ml-auto space-x-8">
                  <div class="flex space-x-0 select-none items-center">
                    <div v-for="(item, index) in totalPages" :key="index">
                      <button
                        @click="handleChangePage({ page: index })"
                        :class="[
                          { '!font-bold': item == pageNum },
                          { 'text-gray-600': item != pageNum },
                          'px-1.5 py-0.5 rounded hover:bg-gray-200 transition tabular-nums font-medium',
                        ]"
                      >
                        {{ item }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="images.length" class="relative">
                <div v-if="listShow" class="list w-full grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div
                    v-for="(item, index) in currentPageData"
                    :key="index"
                    @click="handleItemClick(item)"
                    class="relative flex w-full p-3 sm:p-4 transition bg-white border-2 border-transparent shadow cursor-pointer rounded-xl hover:-translate-y-1 hover:shadow-lg group min-w-0 flex-col justify-between"
                  >
                    <div
                      :class="[
                        { 'scale-100': item.checked },
                        { 'scale-50 -rotate-45 opacity-0': !item.checked },
                        'absolute z-20 flex items-center justify-center text-white rounded-full shadow top-2 left-2 w-7 h-7 bg-emerald-500 transition',
                      ]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon-tabler icon-tabler-check h-5"
                        width="24px"
                        height="24px"
                        viewBox="0 0 24 24"
                        stroke-width="3"
                        stroke="currentColor"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>

                    <div
                      :class="[
                        { '!scale-50 !opacity-0': item.checked },
                        'transition absolute z-10 scale-50 border border-gray-300 rounded-full shadow opacity-0 bg-gray-50 group-hover:opacity-100 top-2 left-2 w-7 h-7 group-hover:scale-100',
                      ]"
                    ></div>

                    <div
                      :class="[
                        { 'bg-gray-900': isInvertBackground },
                        'relative flex items-center justify-center overflow-hidden transition border rounded-md select-none aspect-square shrink-0 w-full bg-gray-100 border-gray-200',
                      ]"
                    >
                      <div
                        class="absolute top-0 right-0 py-0.5 px-1.5 text-xs font-semibold bg-white border border-t-0 border-r-0 border-gray-300 rounded-bl-md flex items-center shadow-sm text-gray-700"
                      >
                        {{ item.width }}
                        <span class="text-gray-500 mx-0.5">x</span>
                        {{ item.height }}
                      </div>

                      <img
                        :src="item.url"
                        class="object-contain object-center max-w-full max-h-full rounded-bl-md"
                        loading="lazy"
                        @error="handleImageError(item.id)"
                        @load="handleImageLoad(item.id)"
                        referrerpolicy="no-referrer"
                      />

                      <Skeleton
                        v-if="!item.imageLoaded"
                        style="position: absolute; inset: 0"
                        class="absolute inset-0"
                        width="100%"
                        height="100%"
                      ></Skeleton>

                      <div
                        v-else-if="item.imageError"
                        class="absolute inset-0 bg-amber-100 flex flex-col items-center justify-center text-center p-5 text-sm text-amber-700 font-medium"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="icon-tabler icon-tabler-eye-off"
                          width="24px"
                          height="24px"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
                          <path
                            d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87"
                          />
                          <path d="M3 3l18 18" />
                        </svg>
                        <span class="mt-2">Image preview not available.</span>
                        <span class="text-xs mt-3">
                          <button
                            class="underline hover:text-amber-900 transition"
                            @click.stop="handleDownload('single', item.id)"
                          >
                            Download
                          </button>
                          or
                          <button
                            class="underline hover:text-amber-900 transition"
                            @click.stop="handleOpenInNewTab(item.url)"
                          >
                            open in new tab
                          </button>
                          to view.
                        </span>
                      </div>
                    </div>

                    <div class="flex-1 min-w-0 mt-3">
                      <div class="mb-2 text-sm font-semibold truncate">
                        <span v-if="item.name">{{ item.name }}</span>
                        <span v-else class="italic opacity-60">Unknown name</span>
                      </div>
                      <div class="flex justify-between flex-1">
                        <div class="flex items-center space-x-2">
                          <TypeLabel :type="item.type" />
                          <div
                            class="size text-sm whitespace-nowrap font-medium text-gray-500 border border-gray-300 rounded px-1.5 h-6 flex items-center"
                          >
                            {{ formatFileSize(item.fileSize) }}
                          </div>
                        </div>
                        <div class="flex gap-2 sm:gap-1 items-center">
                          <button
                            @click.stop="handleCopyUrl('single', item.url, item.id)"
                            type="submit"
                            style="transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)"
                            :class="[
                              { 'opacity-50 pointer-events-none': item.id == copyTextSingleImageId ? true : false },
                              'relative inline-flex items-center justify-center font-medium transition border border-transparent rounded-md cursor-pointer select-none disabled:opacity-25 tabular-num h-7 text-sm w-6 text-gray-800 hover:text-emerald-600',
                            ]"
                          >
                            <div v-show="item.id == copyTextSingleImageId ? true : false">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="icon-tabler icon-tabler-check"
                                width="24px"
                                height="24px"
                                viewBox="0 0 24 24"
                                stroke-width="2"
                                stroke="currentColor"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M5 12l5 5l10 -10" />
                              </svg>
                            </div>

                            <div v-show="item.id == copyTextSingleImageId ? false : true">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="icon-tabler icon-tabler-link"
                                width="24px"
                                height="24px"
                                viewBox="0 0 24 24"
                                stroke-width="2"
                                stroke="currentColor"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M9 15l6 -6" />
                                <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
                                <path
                                  d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"
                                />
                              </svg>
                            </div>
                            <span class></span>
                          </button>
                          <button
                            @click.stop="handleDownload('single', item.id)"
                            type="submit"
                            style="transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)"
                            :class="[
                              { 'opacity-50 pointer-events-none': item.id == downloadSingleImageId ? true : false },
                              'relative inline-flex items-center justify-center font-medium transition border border-transparent rounded-md cursor-pointer select-none disabled:opacity-25 tabular-num h-7 text-sm w-6 text-gray-800 hover:text-emerald-600',
                            ]"
                            data-test-id="download-image"
                          >
                            <div
                              v-show="item.id == downloadSingleImageId ? true : false"
                              class="flex items-center justify-center overflow-hidden w-full"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="icon-tabler icon-tabler-loader w-5 animate-spin w-full"
                                width="24px"
                                height="24px"
                                viewBox="0 0 24 24"
                                stroke-width="2"
                                stroke="currentColor"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M12 6l0 -3" />
                                <path d="M16.25 7.75l2.15 -2.15" />
                                <path d="M18 12l3 0" />
                                <path d="M16.25 16.25l2.15 2.15" />
                                <path d="M12 18l0 3" />
                                <path d="M7.75 16.25l-2.15 2.15" />
                                <path d="M6 12l-3 0" />
                                <path d="M7.75 7.75l-2.15 -2.15" />
                              </svg>
                            </div>

                            <div v-show="item.id == downloadSingleImageId ? false : true">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="icon-tabler icon-tabler-download"
                                width="24px"
                                height="24px"
                                viewBox="0 0 24 24"
                                stroke-width="2"
                                stroke="currentColor"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                                <path d="M7 11l5 5l5 -5" />
                                <path d="M12 4l0 12" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-show="matchTheOriginalImageLoading"
                  class="absolute inset-0 z-10 list w-full grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  <div
                    v-for="(item, index) in currentPageData"
                    :key="index"
                    class="relative flex w-full pointer-events-none p-3 sm:p-4 transition bg-white border-2 border-transparent cursor-pointer rounded-xl hover:-translate-y-0 group min-w-0 flex-col justify-between"
                  >
                    <div
                      class="relative flex items-center justify-center overflow-hidden transition border rounded-md select-none aspect-square shrink-0 w-full bg-gray-100 border-gray-200,"
                    >
                      <Skeleton width="100%" height="100%"></Skeleton>
                    </div>

                    <div class="flex-1 min-w-0 mt-3">
                      <div class="mb-2 text-sm font-semibold truncate">
                        <Skeleton width="5rem" height="1.077rem"></Skeleton>
                      </div>
                      <div class="flex justify-between flex-1">
                        <div class="flex items-center space-x-2">
                          <Skeleton width="3.5rem" height="1.5rem"></Skeleton>
                          <Skeleton width="3.5rem" height="1.5rem"></Skeleton>
                        </div>
                        <div class="flex gap-2 sm:gap-1 items-center">
                          <Skeleton shape="circle" borderRadius="50%" size="1.5rem"></Skeleton>
                          <Skeleton shape="circle" borderRadius="50%" size="1.5rem"></Skeleton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="flex flex-col items-center justify-center pt-32">
                <div class="mb-2 text-xl font-bold">No matching images found.</div>
                <div class="text-gray-500">
                  Try changing the filters or
                  <button class="underline">removing them</button>.
                </div>
              </div>

              <div
                v-show="total && totalPages > 1"
                :class="[{ 'pointer-events-none': matchTheOriginalImageLoading }, 'flex justify-center mt-10']"
              >
                <Paginator
                  :alwaysShow="false"
                  :rows="pageSize"
                  :totalRecords="total"
                  @page="handlePageChange"
                  ref="paginatorRef"
                  template="PrevPageLink PageLinks NextPageLink"
                ></Paginator>
              </div>

              <div class="w-full advertisement mt-16" align="center">
                <ins
                  class="adsbygoogle"
                  data-adtest="off"
                  data-ad-client="ca-pub-9215090689604809"
                  data-ad-slot="2533377261"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                  style="display: block"
                ></ins>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!images.length" class="py-12 mt-0">
        <div class="mx-auto transition-all w-full max-w-3xl px-6 sm:px-6 lg:px-8">
          <dl class="grid mx-auto gap-y-10 gap-x-8 lg:gap-y-16">
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900">
                <div class="absolute top-0 left-0 flex items-center justify-center rounded-lg w-11 h-11 bg-emerald-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon-tabler icon-tabler-zoom-in-area-filled w-6 h-6 text-white"
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path
                      d="M15 9a6 6 0 0 1 4.891 9.476l2.816 2.817a1 1 0 0 1 -1.32 1.497l-.094 -.083l-2.817 -2.816a6 6 0 0 1 -9.472 -4.666l-.004 -.225l.004 -.225a6 6 0 0 1 5.996 -5.775zm0 3a1 1 0 0 0 -.993 .883l-.007 .117v1h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h1v1l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-1h1l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007h-1v-1l-.007 -.117a1 1 0 0 0 -.993 -.883z"
                      stroke-width="0"
                      fill="currentColor"
                    />
                    <path
                      d="M3 14a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 0 .883 .993l.117 .007h1a1 1 0 0 1 .117 1.993l-.117 .007h-1a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-1a1 1 0 0 1 1 -1z"
                      stroke-width="0"
                      fill="currentColor"
                    />
                    <path
                      d="M3 9a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 1 1 -1z"
                      stroke-width="0"
                      fill="currentColor"
                    />
                    <path
                      d="M6 2a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 0 -.993 .883l-.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a3 3 0 0 1 2.824 -2.995l.176 -.005h1z"
                      stroke-width="0"
                      fill="currentColor"
                    />
                    <path
                      d="M11 2a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"
                      stroke-width="0"
                      fill="currentColor"
                    />
                    <path
                      d="M16 2a3 3 0 0 1 2.995 2.824l.005 .176v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 0 -.883 -.993l-.117 -.007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"
                      stroke-width="0"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h4 class="text-lg">Find Every Image</h4>
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600">
                We use many different methods and strategies to find all relevant images on an website. This includes
                background images, dynamically loaded or embedded images and SVG elements.
              </dd>
            </div>
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900">
                <div class="absolute top-0 left-0 flex items-center justify-center rounded-lg w-11 h-11 bg-emerald-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon-tabler icon-tabler-augmented-reality w-6 h-6 text-white"
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                    <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                    <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                    <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                    <path d="M12 12.5l4 -2.5" />
                    <path d="M8 10l4 2.5v4.5l4 -2.5v-4.5l-4 -2.5z" />
                    <path d="M8 10v4.5l4 2.5" />
                  </svg>
                </div>
                <h4 class="text-lg">Automatic Image Analysis</h4>
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600">
                Every discovered image is analysed to find its dimensions, type, size and name. With more advanced
                features to come in the future.
              </dd>
            </div>
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900">
                <div class="absolute top-0 left-0 flex items-center justify-center rounded-lg w-11 h-11 bg-emerald-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon-tabler icon-tabler-tool w-6 h-6 text-white"
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5" />
                  </svg>
                </div>
                <h4 class="text-lg">Useful Tools</h4>
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600">
                View all images in a grid or list, search for specific ones by name, filter by type and sort by width,
                height and other properties to find exactly what you are looking for.
              </dd>
            </div>
            <div class="relative pl-16">
              <dt class="text-base font-semibold leading-7 text-gray-900">
                <div class="absolute top-0 left-0 flex items-center justify-center rounded-lg w-11 h-11 bg-emerald-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon-tabler icon-tabler-download w-6 h-6 text-white"
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                    <path d="M7 11l5 5l5 -5" />
                    <path d="M12 4l0 12" />
                  </svg>
                </div>
                <h4 class="text-lg">Easy Download</h4>
              </dt>
              <dd class="mt-2 text-base leading-7 text-gray-600">
                Download invididual images or select the ones you want and download them all at once. Alternatively, you
                can also only copy the URLs to the clipboard.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="py-12 mt-20">
        <div class="mx-auto transition-all w-full max-w-7xl px-6 sm:px-6 lg:px-8">
          <div>
            <section>
              <h2 class="text-3xl md:text-4xl font-semibold mb-5">Frequently asked questions</h2>
              <p class="text-gray-700">
                If you can't find what you're looking for,
                <a href="mailto:luckxiaomi@gmail.com" class="underline">write us a message</a> and we'll get back to
                you.
              </p>
              <div class="grid lg:grid-cols-2 md:gap-x-16 gap-y-2 md:gap-y-3 mt-6">
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">What is Image Extractor?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    <span>
                      Image Extractor is an easy to use tool that allows you to extract, view and download images from any
                      public website. Simply paste the URL of the website into the input field and click "Extract" to
                      start the process. After a few seconds you will see most or even all of the images found on the
                      website.
                    </span>
                  </p>
                </article>
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">How can I find specific images?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    <span>
                      You can view the found images in a grid or list and explore them by <strong>sorting</strong> them
                      by name, type, dimensions, width, height or the actual file size. Additionally you can
                      <strong>search</strong> for images by their name, size or type/file format. This makes it really
                      easy to find exactly the images you need.
                    </span>
                  </p>
                </article>
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">What other tools are available?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    <span>
                      In case some images are very bright, you can <strong>switch to a dark background</strong> to make
                      them more visible. You can use the <strong>copy the URL</strong> of one or more images by clicking
                      the link icon or the <em>Copy selected URLs</em> button. You can also very easily
                      <strong>download</strong> indiviual images or <strong>multiple images</strong> at once by
                      selecting them and then downloading them all in a <strong>ZIP archive</strong>.
                    </span>
                  </p>
                </article>
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">Is it free?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    Yes, Image Extractor is <strong>free to use</strong> without creating an account! <br />
                    There is an hourly and daily limit on the number of extractions you can run to prevent abuse.
                    However, you can extend these limits by creating an account or subscribing to a premium plan.
                  </p>
                </article>
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">How can I download images?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    <span>
                      After the extraction process is finished you will find a list of all the images found on the
                      website you entered. You can then use the
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="icon-tabler icon-tabler-download inline-block h-5"
                        width="24px"
                        height="24px"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
                        <path d="M7 11l5 5l5 -5"></path>
                        <path d="M12 4l0 12"></path>
                      </svg>
                      button to download individual images.
                    </span>
                  </p>
                </article>
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">Can I download multiple images at once?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    <span>
                      Of course, you can select them by clicking the images and the use the "Download selected" button
                      on the left to download all selected images in a ZIP file.
                      <strong>This can take some time depending on how many images you selected.</strong> Note that
                      there is a chance that some images cannot be downloaded and won't be included in the ZIP file.
                    </span>
                  </p>
                </article>
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">The extraction does not work. Why?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    <span>
                      There are several reasons why the extraction might fail. The website you entered might be not be
                      publicly accessible or it might be protected by a login. Very slow or large websites might also
                      cause issues.
                    </span>
                    <span>
                      And sometimes there are a lot of people using Image Extractor at the same time which can cause
                      performance issues on our side. In this case you should try again later or try a different
                      website. We are continuously working on improving the performance of our service.
                    </span>
                  </p>
                </article>
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">The download does not work. Why?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    <span>
                      Sometimes other websites block the download of images from their website. In this case you can
                      right-click the images and press "Save image as..." or try to open the image in a new tab and
                      download it from there.
                    </span>
                    <span>
                      When trying to download multiple images at once, some images might not be included in the ZIP
                      file, because they could not be downloaded. In this case you can try to download them
                      individually. If the download does not work at all, please contact us.
                    </span>
                  </p>
                </article>
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">How does it work?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    <span>
                      Everytime you start the extraction process the website you entered is openend in a
                      <strong>Google Chrome</strong> browser. We then apply multiple different methods to find all the
                      images (and even SVG elements) on the website. After that the images are analyzed to show useful
                      information like type, name and size.
                    </span>
                  </p>
                </article>
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">Does it work with dynamic websites?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    <span>
                      Yes. Every website is viewed just like you view them in your browser. We use the latest version of
                      the Google Chrome browser to process the websites you provide. After loading your website we
                      execute JavaScript and wait for any requests to finish before starting the extraction process.
                    </span>
                  </p>
                </article>
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">How many images are extracted?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    <span>
                      After the server navigates to the website you provided, it <strong>scrolls down</strong> really
                      fast for a few seconds to find as many images as possible. Every image that the website loads in
                      those first ~10 seconds is then sent back to you. Tracking pixels and missing or invalid images
                      are automatically removed.
                    </span>
                  </p>
                </article>
                <article>
                  <h4 class="mt-10 text-lg font-semibold mb-3">What does "Image preview not available" mean?</h4>
                  <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                    This can have several reasons. The most common is that the webserver, the image is stored on, does
                    not allow the image to be loaded/shown on other websites. If that is the case, we cannot display the
                    image on the page. However, it is very likely that you are still able to
                    <strong>download the image</strong>. If that fails too, try to
                    <strong>open the image in a new tab</strong>.
                  </p>
                </article>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.logo,
.frame-logo {
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #1eb05c);
}

.frame-logo:hover {
  filter: drop-shadow(0 0 2em #916cfe);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* @media (max-width: 815px) {
  .list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .size {
    display: none;
  }
} */

/* @media (max-width: 767.5px) {
  .list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .size {
    display: block;
  }
} */

/* @media (max-width: 576px) {
  .list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .size {
    display: block;
  }
} */

/* @media (max-width: 467px) {
  .list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .size {
    display: block;
  }
} */

/* @media (max-width: 466.99px) {
  .list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .size {
    display: none;
  }
} */

@media (max-width: 347px) {
  .list {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .size {
    display: none;
  }
}

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
