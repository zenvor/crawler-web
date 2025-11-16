import request from '@/utils/request'

export function extractions(requestMethod, params) {
  if (requestMethod == 'get') {
    return request({
      url: `/api/extractions/${params.id}`,
      method: 'get',
    })
  } else {
    return request({
      url: '/api/extractions',
      method: 'post',
      data: {
        url: params.url,
        mode: params.mode || 'advanced',
        ignoreInlineImages: params.ignoreInlineImages || false
      }
    })
  }
}

export function matchingMechanism(id, mechanism) {
  return request({
    url: `/matchingMechanism/${id}/${mechanism}`,
    method: 'get',
  })
}


export function downloadMultiple(extractionId, imageIds) {
  return request({
    url: '/api/downloads/multiple',
    method: 'post',
    responseType: 'blob',
    data: {
      extractionId,
      imageIds,
    },
  })
}

export function downloadSingle(extractionId, imageId) {
  return request({
    url: '/api/downloads/single',
    method: 'post',
    responseType: 'blob',
    data: {
      extractionId,
      imageId,
    },
  })
}
