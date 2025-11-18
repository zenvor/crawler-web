import { ref } from 'vue'
import { extractions, matchingMechanism } from '@/api/extract'
import { useToast } from 'primevue/usetoast'

export function useImageExtraction() {
  const toast = useToast()

  const id = ref('')
  const websiteDomainName = ref('')
  const images = ref([])
  const extractLoading = ref(false)
  const progress = ref(0)
  const message = ref('Waiting for browser...')
  const isMatchTheOriginalImage = ref(false)
  const matchTheOriginalImageLoading = ref(false)

  let ws = null

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
    console.log('[Extract] ========== 开始新的提取任务 ==========')

    reset()
    extractLoading.value = true
    console.log('[Extract] extractLoading 设置为 true')

    try {
      console.log('[Extract] 正在创建提取任务，URL:', link)
      const extraction = await extractions('post', {
        url: link,
        mode: 'advanced',
        imageMode: imageMode
      })
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
            message.value = data.message
            progress.value = data.progress
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

            extractLoading.value = false
            console.log('[Extract] ========== 提取任务完成 ==========')

            // 调用成功回调
            if (onSuccess) {
              onSuccess(images.value)
            }
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

  // 匹配原图
  const handleMatchOriginal = async (onSuccess) => {
    const mechanism = isMatchTheOriginalImage.value ? 'original' : 'default'

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
    console.log('[Reset] 开始重置参数...')

    message.value = 'Waiting for browser...'
    progress.value = 0
    websiteDomainName.value = ''
    isMatchTheOriginalImage.value = false
    images.value = []

    // 清理旧的 WebSocket 连接
    if (ws) {
      console.log('[Reset] 检测到旧的 WebSocket 连接，正在关闭...')
      ws.close()
      ws = null
    }

    console.log('[Reset] 重置完成，progress:', progress.value, 'message:', message.value)
  }

  // 清理 WebSocket 连接
  const cleanup = () => {
    if (ws) {
      console.log('[Lifecycle] 清理 WebSocket 连接')
      ws.close()
      ws = null
    }
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
