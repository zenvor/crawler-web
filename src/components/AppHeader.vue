<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
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
</style>
