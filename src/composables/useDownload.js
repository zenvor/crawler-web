import { ref, onBeforeUnmount } from 'vue'
import { useToast } from 'primevue/usetoast'
import { downloadApi } from '@/api/extract'

export function useDownload() {
  const toast = useToast()

  const downloadMultipleLoading = ref(false)
  const downloadSingleImageId = ref('')
  const timers = []

  function extractFilenameFromHeaders(headers) {
    const contentDisposition = headers?.['content-disposition']
    if (!contentDisposition) return undefined
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    const matches = filenameRegex.exec(contentDisposition)
    if (matches && matches[1]) {
      return matches[1].replace(/['"]/g, '')
    }
    return undefined
  }

  function triggerBrowserDownload(blob, filename) {
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    if (filename) link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // 提取公共的错误处理逻辑
  async function handleDownloadError(error) {
    let errorMessage = 'Unknown error'
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        const errorData = JSON.parse(text)
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        errorMessage = error.message || errorMessage
      }
    } else {
      errorMessage = error.response?.data?.error || error.message || errorMessage
    }

    toast.add({
      severity: 'error',
      summary: 'Download failed',
      detail: errorMessage,
      group: 'bc',
      life: 5000,
    })
  }

  async function downloadSingleById(extractionId, imageId) {
    if (!imageId || !extractionId) return
    try {
      downloadSingleImageId.value = imageId
      const response = await downloadApi.single(extractionId, imageId)
      const filename = extractFilenameFromHeaders(response.headers) || 'download'
      triggerBrowserDownload(response.data, filename)
      toast.add({
        severity: 'success',
        summary: 'Image downloaded successfully',
        detail: `${filename}`,
        group: 'bc',
        life: 3000,
      })
    } catch (error) {
      await handleDownloadError(error)
    } finally {
      const timer = setTimeout(() => {
        downloadSingleImageId.value = ''
      }, 500)
      timers.push(timer)
    }
  }

  async function downloadSelectedByIds(extractionId, imageIds) {
    if (!Array.isArray(imageIds) || imageIds.length === 0 || !extractionId) return
    try {
      downloadMultipleLoading.value = true
      const response =
        imageIds.length > 1
          ? await downloadApi.multiple(extractionId, imageIds)
          : await downloadApi.single(extractionId, imageIds[0])

      const filename = extractFilenameFromHeaders(response.headers) || 'download'
      triggerBrowserDownload(response.data, filename)

      const successMessage =
        imageIds.length > 1 ? `Successfully downloaded ${imageIds.length} images` : 'Image downloaded successfully'

      toast.add({
        severity: 'success',
        summary: successMessage,
        detail: `${filename}`,
        group: 'bc',
        life: 3000,
      })
    } catch (error) {
      await handleDownloadError(error)
    } finally {
      const timer = setTimeout(() => {
        downloadMultipleLoading.value = false
      }, 500)
      timers.push(timer)
    }
  }

  function cleanup() {
    timers.forEach(clearTimeout)
    timers.length = 0
  }

  onBeforeUnmount(cleanup)

  return {
    downloadMultipleLoading,
    downloadSingleImageId,
    downloadSingleById,
    downloadSelectedByIds,
    cleanup,
  }
}