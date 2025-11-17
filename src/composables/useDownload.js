import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { downloadMultiple, downloadSingle } from '@/api/extract'

export function useDownload() {
  const toast = useToast()

  const downloadMultipleLoading = ref(false)
  const downloadSingleImageId = ref('')

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

  async function downloadSingleById(extractionId, imageId) {
    if (!imageId || !extractionId) return
    let filename
    try {
      downloadSingleImageId.value = imageId
      const response = await downloadSingle(extractionId, imageId)
      filename = extractFilenameFromHeaders(response.headers) || 'download'
      triggerBrowserDownload(response.data, filename)
      toast.add({ severity: 'success', summary: 'File downloaded', detail: `Filename: ${filename}`, group: 'bc', life: 3000 })
    } catch (error) {
      toast.add({ severity: 'error', summary: 'File download failed', detail: filename ? `Filename: ${filename}` : undefined, group: 'bc', life: 3000 })
    } finally {
      setTimeout(() => {
        downloadSingleImageId.value = ''
      }, 500)
    }
  }

  async function downloadSelectedByIds(extractionId, imageIds) {
    if (!Array.isArray(imageIds) || imageIds.length === 0 || !extractionId) return
    let filename
    try {
      downloadMultipleLoading.value = true
      let response
      if (imageIds.length > 1) {
        response = await downloadMultiple(extractionId, imageIds)
      } else {
        response = await downloadSingle(extractionId, imageIds[0])
      }
      filename = extractFilenameFromHeaders(response.headers) || 'download'
      triggerBrowserDownload(response.data, filename)
      toast.add({ severity: 'success', summary: 'File downloaded', detail: `Filename: ${filename}`, group: 'bc', life: 3000 })
    } catch (error) {
      toast.add({ severity: 'error', summary: 'File download failed', detail: filename ? `Filename: ${filename}` : undefined, group: 'bc', life: 3000 })
    } finally {
      setTimeout(() => {
        downloadMultipleLoading.value = false
      }, 500)
    }
  }

  return {
    downloadMultipleLoading,
    downloadSingleImageId,
    downloadSingleById,
    downloadSelectedByIds,
  }
}