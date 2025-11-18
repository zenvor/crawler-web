import { ref } from 'vue'
import { extractionApi } from '@/api/extract'
import { useToast } from 'primevue/usetoast'
import { useWebSocket } from './useWebSocket'

export function useImageExtraction() {
  const toast = useToast()
  const { connect, disconnect, status } = useWebSocket({
    maxReconnectAttempts: 3,
    reconnectDelay: 1000,
    maxReconnectDelay: 10000,
  })

  const id = ref('')
  const websiteDomainName = ref('')
  const images = ref([])
  const extractLoading = ref(false)
  const progress = ref(0)
  const message = ref('Waiting for browser...')
  const isMatchTheOriginalImage = ref(false)
  const matchTheOriginalImageLoading = ref(false)

  // 处理后端返回的图片数据,添加前端所需的字段
  const processImages = (images) => {
    return images.map((img) => ({
      ...img,
      name: img.name || 'Unknown',
      type: img.type || 'unknown',
      fileSize: img.size || 0,
      imageSize: (img.width || 0) * (img.height || 0),
    }))
  }

  // 提取图片
  const handleExtract = async (link, imageMode, onSuccess) => {
    reset()
    extractLoading.value = true

    try {
      const extraction = await extractionApi.createExtraction({
        url: link,
        mode: 'advanced',
        imageMode: imageMode,
      })
      id.value = extraction.id
      websiteDomainName.value = extraction.url

      // 使用 WebSocket 获取实时进度
      const wsUrl = import.meta.env.VITE_APP_BASE_WS_API
      const wsFullUrl = `${wsUrl}/?taskId=${id.value}`

      connect(wsFullUrl, {
        onMessage: async (event) => {
          const data = JSON.parse(event.data)

          try {
            if (data.type === 'progress') {
              message.value = data.message
              progress.value = data.progress
            } else if (data.type === 'complete') {
              disconnect()

              // 获取最终结果
              const response = await extractionApi.getExtraction(id.value)
              images.value = processImages(response.images || [])

              if (!images.value.length) {
                extractLoading.value = false
                return toast.add({
                  severity: 'error',
                  summary: 'No image was extracted',
                  group: 'bc',
                  life: 3000,
                })
              }

              extractLoading.value = false

              // 调用成功回调
              if (onSuccess) {
                onSuccess(images.value)
              }
            } else if (data.type === 'error') {
              disconnect()
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
            disconnect()
            extractLoading.value = false
          }
        },
        onError: () => {
          disconnect()
          extractLoading.value = false

          toast.add({
            severity: 'error',
            summary: 'Connection error',
            detail: 'Failed to connect to server',
            group: 'bc',
            life: 3000,
          })
        },
      })
    } catch (error) {
      extractLoading.value = false

      toast.add({
        severity: 'error',
        summary: 'Failed to create extraction task',
        group: 'bc',
        life: 3000,
      })
    }
  }

  // 匹配原图
  const handleMatchOriginal = async (onSuccess) => {
    const mechanism = isMatchTheOriginalImage.value ? 'original' : 'default'

    matchTheOriginalImageLoading.value = true

    const response = await extractionApi.matchOriginal(id.value, mechanism)

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

    images.value = processImages(response.images)

    if (onSuccess) {
      onSuccess(images.value)
    }

    setTimeout(() => {
      matchTheOriginalImageLoading.value = false
    }, 500)
  }

  // 重置参数
  const reset = () => {
    message.value = 'Waiting for browser...'
    progress.value = 0
    websiteDomainName.value = ''
    isMatchTheOriginalImage.value = false
    images.value = []

    // 清理旧的 WebSocket 连接
    disconnect()
  }

  // 清理 WebSocket 连接
  const cleanup = () => {
    disconnect()
  }

  return {
    id,
    websiteDomainName,
    images,
    extractLoading,
    progress,
    message,
    isMatchTheOriginalImage,
    matchTheOriginalImageLoading,
    handleExtract,
    handleMatchOriginal,
    reset,
    cleanup,
    processImages
  }
}
