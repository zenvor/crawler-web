<script setup>
import { computed } from 'vue'
import TypeLabel from '@/components/TypeLabel.vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import ToggleButton from 'primevue/togglebutton'

const props = defineProps({
  sortOptions: Array,
  selectionSortBy: String,
  firstText: String,
  lastText: String,
  allTypes: Object,
  selectionType: String,
  searchQuery: String,
  isInvertBackground: Boolean,
  isMatchTheOriginalImage: Boolean,
  matchTheOriginalImageLoading: Boolean,
  selectAllDisabled: Boolean,
  deselectAllDisabled: Boolean,
  selectedCount: Number,
  downloadMultipleLoading: Boolean,
  copyMultipleLoading: Boolean
})

const emit = defineEmits([
  'update:selectionSortBy',
  'update:searchQuery',
  'update:isInvertBackground',
  'update:isMatchTheOriginalImage',
  'toggleSortOrder',
  'typeLabelClick',
  'searchQueryUpdate',
  'selectAll',
  'deselectAll',
  'download',
  'copyUrl'
])

const handleSortByUpdate = (value) => {
  emit('update:selectionSortBy', value)
}

const handleSearchQueryUpdate = (event) => {
  emit('update:searchQuery', event.target.value)
  emit('searchQueryUpdate', event)
}

const handleTypeLabelClick = (key) => {
  emit('typeLabelClick', key)
}

const handleToggleSortOrder = () => {
  emit('toggleSortOrder')
}
</script>

<template>
  <div class="md:w-[300px] shrink-0 md:mr-12 mb-12 md:mb-0">
    <div class="sticky space-y-8 top-24">
      <div>
        <div class="space-y-6">
          <div>
            <div>
              <div class="relative" data-headlessui-state>
                <div class="flex items-center justify-between mb-1">
                  <label id="headlessui-listbox-label-1" data-headlessui-state class="font-medium">Sort images</label>
                  <div class="space-x-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                    <button @click="handleToggleSortOrder" class="flex items-center">
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
                  :modelValue="selectionSortBy"
                  @update:modelValue="handleSortByUpdate"
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
                  :modelValue="searchQuery"
                  @input="handleSearchQueryUpdate"
                  class="w-full px-3.5 placeholder-gray-400 transition rounded"
                  placeholder="Type to search..."
                />

                <div class="absolute flex gap-2 -translate-y-1/2 right-4 top-1/2"></div>
              </div>
            </div>
            <div class="mt-1.5 leading-tight text-xs text-gray-500">Find by URL, name, type and width/height.</div>
          </div>
          <div>
            <label class="flex items-start cursor-pointer">
              <Checkbox
                :modelValue="isInvertBackground"
                @update:modelValue="$emit('update:isInvertBackground', $event)"
                :binary="true"
                class="translate-y-1"
              />
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
                  :modelValue="isMatchTheOriginalImage"
                  @update:modelValue="$emit('update:isMatchTheOriginalImage', $event)"
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
              @click="$emit('selectAll')"
              class="whitespace-nowrap !text-base w-[50%]"
            />
            <Button
              size="small"
              :disabled="deselectAllDisabled"
              type="button"
              label="Deselect all"
              icon="pi pi-circle"
              @click="$emit('deselectAll')"
              class="whitespace-nowrap !text-base w-[50%]"
            />
          </div>
          <div class="mt-6">
            <button
              @click="$emit('download', 'multiple')"
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
              @click="$emit('copyUrl', 'multiple')"
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
                  <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
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
    </div>
  </div>
</template>
