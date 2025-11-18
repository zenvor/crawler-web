<script setup>
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import { validateUrl } from '@/utils/validation'

const props = defineProps({
  extractLoading: Boolean,
  progress: Number,
  message: String
})

const emit = defineEmits(['extract'])

const link = ref('')
const isInputFocus = ref(false)
const imageMode = ref('all')
const showImageModeOptions = ref(false)
const disabled = ref(true)

watch(
  link,
  (newVal) => {
    const result = validateUrl(newVal)
    disabled.value = !result.valid
  },
  { immediate: true }
)

const handleExtract = () => {
  const result = validateUrl(link.value)
  if (result.valid) {
    emit('extract', result.url, imageMode.value)
  }
}
</script>

<template>
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
                  <form class="flex flex-col gap-4">
                    <div class="flex flex-col sm:flex-row gap-3">
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
                    </div>

                    <!-- Image Mode Selector -->
                    <div class="flex flex-col gap-2">
                      <div
                        @click="showImageModeOptions = !showImageModeOptions"
                        class="flex items-center justify-between cursor-pointer group"
                      >
                        <label class="text-sm font-medium text-gray-700 cursor-pointer">Advanced Options</label>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="transition-transform duration-200 text-gray-500 group-hover:text-gray-700"
                          :class="{ 'rotate-180': showImageModeOptions }"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          fill="none"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M6 9l6 6l6 -6" />
                        </svg>
                      </div>
                      <transition
                        enter-active-class="transition-all duration-200 ease-out"
                        leave-active-class="transition-all duration-200 ease-in"
                        enter-from-class="opacity-0 max-h-0"
                        enter-to-class="opacity-100 max-h-24"
                        leave-from-class="opacity-100 max-h-24"
                        leave-to-class="opacity-0 max-h-0"
                      >
                        <div v-show="showImageModeOptions" class="overflow-hidden">
                          <div class="pt-2 flex flex-col gap-2">
                            <label class="text-sm font-medium text-gray-600">Image Mode:</label>
                            <div class="flex flex-col sm:flex-row gap-3">
                              <div class="flex items-center gap-2">
                                <RadioButton v-model="imageMode" inputId="mode_all" name="imageMode" value="all" />
                                <label for="mode_all" class="cursor-pointer text-sm">All images</label>
                              </div>
                              <div class="flex items-center gap-2">
                                <RadioButton
                                  v-model="imageMode"
                                  inputId="mode_originals"
                                  name="imageMode"
                                  value="originals_only"
                                />
                                <label for="mode_originals" class="cursor-pointer text-sm">Original images only</label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </transition>
                    </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
  font-weight: 500;
}
</style>
