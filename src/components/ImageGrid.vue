<script setup>
import ImageCard from '@/components/ImageCard.vue'
import Paginator from 'primevue/paginator'
import Skeleton from 'primevue/skeleton'

const props = defineProps({
  currentPageData: Array,
  total: Number,
  totalPages: Number,
  pageSize: Number,
  websiteDomainName: String,
  imagesCloneLength: Number,
  isInvertBackground: Boolean,
  copyTextSingleImageId: String,
  downloadSingleImageId: String,
  matchTheOriginalImageLoading: Boolean,
  listShow: Boolean
})

const emit = defineEmits([
  'itemClick',
  'imageLoad',
  'imageError',
  'copyUrl',
  'download',
  'openInNewTab',
  'pageChange',
  'changePage'
])

const paginatorRef = defineModel('paginatorRef')

const parseLink = (link) => {
  if (!link) return
  let urlObj = new URL(link)
  let domain = urlObj.hostname
  return domain
}
</script>

<template>
  <div class="flex-1">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-5">
      <div class>
        Showing {{ currentPageData.length }} of {{ imagesCloneLength }} images from
        <strong>{{ parseLink(websiteDomainName) }}</strong>
      </div>
      <div class="flex items-center mt-2 sm:mt-0 sm:ml-auto space-x-8">
        <div class="flex space-x-0 select-none items-center">
          <div v-for="(item, index) in totalPages" :key="index">
            <button
              @click="$emit('changePage', { page: index })"
              :class="[
                { '!font-bold': item == index + 1 },
                { 'text-gray-600': item != index + 1 },
                'px-1.5 py-0.5 rounded hover:bg-gray-200 transition tabular-nums font-medium',
              ]"
            >
              {{ item }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentPageData.length" class="relative">
      <div v-if="listShow" class="list w-full grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ImageCard
          v-for="(item, index) in currentPageData"
          :key="index"
          :item="item"
          :isInvertBackground="isInvertBackground"
          :copyTextSingleImageId="copyTextSingleImageId"
          :downloadSingleImageId="downloadSingleImageId"
          @click="$emit('itemClick', item)"
          @imageLoad="$emit('imageLoad', $event)"
          @imageError="$emit('imageError', $event)"
          @copyUrl="$emit('copyUrl', $event, item.id)"
          @download="$emit('download', $event)"
          @openInNewTab="$emit('openInNewTab', $event)"
        />
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
        @page="$emit('pageChange', $event)"
        ref="paginatorRef"
        template="PrevPageLink PageLinks NextPageLink"
      ></Paginator>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 347px) {
  .list {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  .size {
    display: none;
  }
}
</style>
