<script setup>
import Skeleton from 'primevue/skeleton'
import TypeLabel from '@/components/TypeLabel.vue'

const props = defineProps({
  item: Object,
  isInvertBackground: Boolean,
  copyTextSingleImageId: String,
  downloadSingleImageId: String
})

const emit = defineEmits(['click', 'imageLoad', 'imageError', 'copyUrl', 'download', 'openInNewTab'])

const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return Math.round(bytes / 1024) + ' KB'
  } else {
    return Math.round(bytes / (1024 * 1024)) + ' MB'
  }
}

const formatImageSize = (pixels) => {
  if (pixels === 0) {
    return '0 MP'
  } else if (pixels < 1000000) {
    return (pixels / 1000).toFixed(1) + ' KP'
  } else {
    return (pixels / 1000000).toFixed(1) + ' MP'
  }
}

const handleItemClick = () => {
  emit('click', props.item)
}

const handleImageLoad = () => {
  emit('imageLoad', props.item.id)
}

const handleImageError = () => {
  emit('imageError', props.item.id)
}

const handleCopyUrl = (event) => {
  event.stopPropagation()
  emit('copyUrl', props.item.url, props.item.id)
}

const handleDownload = (event) => {
  event.stopPropagation()
  emit('download', props.item.id)
}

const handleOpenInNewTab = (event) => {
  event.stopPropagation()
  emit('openInNewTab', props.item.url)
}
</script>

<template>
  <div
    @click="handleItemClick"
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
      <!-- 右上角：分辨率 -->
      <div
        class="absolute top-0 right-0 py-0.5 px-1.5 text-xs font-semibold bg-white border border-t-0 border-r-0 border-gray-300 rounded-bl-md flex items-center shadow-sm text-gray-700"
      >
        {{ item.width }}
        <span class="text-gray-500 mx-0.5">x</span>
        {{ item.height }}
      </div>

      <!-- 左上角：图片尺寸 -->
      <div
        class="absolute top-0 left-0 py-0.5 px-1.5 text-xs font-semibold bg-emerald-50 border border-t-0 border-l-0 border-emerald-300 rounded-br-md flex items-center shadow-sm text-emerald-700"
        :title="'Image size: ' + item.imageSize + ' pixels'"
      >
        {{ formatImageSize(item.imageSize) }}
      </div>

      <img
        :src="item.url"
        class="object-contain object-center max-w-full max-h-full rounded-bl-md"
        loading="lazy"
        decoding="async"
        fetchpriority="low"
        @error="handleImageError"
        @load="handleImageLoad"
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
          <button class="underline hover:text-amber-900 transition" @click="handleDownload">Download</button>
          or
          <button class="underline hover:text-amber-900 transition" @click="handleOpenInNewTab">
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
            :title="'File size: ' + item.fileSize + ' bytes'"
          >
            {{ formatFileSize(item.fileSize) }}
          </div>
        </div>
        <div class="flex gap-2 sm:gap-1 items-center">
          <button
            @click="handleCopyUrl"
            type="submit"
            style="transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)"
            :class="[
              { 'opacity-50 pointer-events-none': item.id === copyTextSingleImageId },
              'relative inline-flex items-center justify-center font-medium transition border border-transparent rounded-md cursor-pointer select-none disabled:opacity-25 tabular-num h-7 text-sm w-6 text-gray-800 hover:text-emerald-600',
            ]"
          >
            <div v-show="item.id === copyTextSingleImageId">
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

            <div v-show="item.id !== copyTextSingleImageId">
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
                <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
              </svg>
            </div>
          </button>
          <button
            @click="handleDownload"
            type="submit"
            style="transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)"
            :class="[
              { 'opacity-50 pointer-events-none': item.id === downloadSingleImageId },
              'relative inline-flex items-center justify-center font-medium transition border border-transparent rounded-md cursor-pointer select-none disabled:opacity-25 tabular-num h-7 text-sm w-6 text-gray-800 hover:text-emerald-600',
            ]"
            data-test-id="download-image"
          >
            <div v-show="item.id === downloadSingleImageId" class="flex items-center justify-center overflow-hidden w-full">
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

            <div v-show="item.id !== downloadSingleImageId">
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
</template>
