import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'

export function useClipboard() {
  const toast = useToast()

  const copyMultipleLoading = ref(false)
  const copyTextSingleImageId = ref('')

  function copyTextToClipboardFallback(text) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  async function copyTextToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      } else {
        copyTextToClipboardFallback(text)
      }
      toast.add({ severity: 'success', summary: 'Copy successfully', group: 'bc', life: 3000 })
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Copy failure', group: 'bc', life: 3000 })
      throw error
    }
  }

  async function copySingleUrl(url, imageId) {
    try {
      copyTextSingleImageId.value = imageId
      await copyTextToClipboard(url)
    } finally {
      setTimeout(() => {
        copyTextSingleImageId.value = ''
      }, 1000)
    }
  }

  async function copySelectedUrls(urls) {
    if (!Array.isArray(urls) || urls.length === 0) return
    try {
      copyMultipleLoading.value = true
      await copyTextToClipboard(urls.join(','))
    } finally {
      setTimeout(() => {
        copyMultipleLoading.value = false
      }, 1000)
    }
  }

  return {
    copyMultipleLoading,
    copyTextSingleImageId,
    copyTextToClipboard,
    copySingleUrl,
    copySelectedUrls,
  }
}