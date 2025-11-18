import request from '@/utils/request'

/**
 * 图片提取 API
 */
export const extractionApi = {
  /**
   * 获取提取结果
   * @param {string} id - 提取任务 ID
   * @returns {Promise<Object>}
   */
  getExtraction(id) {
    return request({
      url: `/api/extractions/${id}`,
      method: 'get',
    })
  },

  /**
   * 创建提取任务
   * @param {Object} params
   * @param {string} params.url - 要提取的网站 URL
   * @param {string} [params.mode='advanced'] - 提取模式
   * @param {string} [params.imageMode='all'] - 图片模式：'all' | 'originals_only'
   * @param {boolean} [params.ignoreInlineImages=false] - 是否忽略内联图片
   * @returns {Promise<Object>}
   */
  createExtraction({ url, mode = 'advanced', imageMode = 'all', ignoreInlineImages = false }) {
    return request({
      url: '/api/extractions',
      method: 'post',
      data: {
        url,
        mode,
        imageMode,
        ignoreInlineImages,
      },
    })
  },

  /**
   * 匹配原图
   * @param {string} id - 提取任务 ID
   * @param {string} [mechanism='original'] - 匹配机制：'original' | 'default'
   * @returns {Promise<Object>}
   */
  matchOriginal(id, mechanism = 'original') {
    return request({
      url: `/matchingMechanism/${id}/${mechanism}`,
      method: 'get',
    })
  },
}

/**
 * 下载 API
 */
export const downloadApi = {
  /**
   * 批量下载图片
   * @param {string} extractionId - 提取任务 ID
   * @param {string[]} imageIds - 图片 ID 列表
   * @returns {Promise<Blob>}
   */
  multiple(extractionId, imageIds) {
    return request({
      url: '/api/downloads/multiple',
      method: 'post',
      responseType: 'blob',
      data: {
        extractionId,
        imageIds,
      },
    })
  },

  /**
   * 单个图片下载
   * @param {string} extractionId - 提取任务 ID
   * @param {string} imageId - 图片 ID
   * @returns {Promise<Blob>}
   */
  single(extractionId, imageId) {
    return request({
      url: '/api/downloads/single',
      method: 'post',
      responseType: 'blob',
      data: {
        extractionId,
        imageId,
      },
    })
  },
}

// 保留旧的导出以兼容现有代码
export function extractions(requestMethod, params) {
  if (requestMethod === 'get') {
    return extractionApi.getExtraction(params.id)
  } else {
    return extractionApi.createExtraction(params)
  }
}

export function matchingMechanism(id, mechanism) {
  return extractionApi.matchOriginal(id, mechanism)
}

export function downloadMultiple(extractionId, imageIds) {
  return downloadApi.multiple(extractionId, imageIds)
}

export function downloadSingle(extractionId, imageId) {
  return downloadApi.single(extractionId, imageId)
}
