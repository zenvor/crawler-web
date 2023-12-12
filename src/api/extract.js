import request from '@/utils/request'

export function extractions(requestMethod, params) {
  if (requestMethod == 'get') {
    return request({
      url: `/extractions/${params.id}`,
      method: 'get',
    })
  } else {
    return request({
      url: '/extractions',
      method: 'post',
      data: {
        url: params.url
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


export function downloadMultiple(imageIds) {
  return request({
    url: '/download/multiple',
    method: 'post',
    responseType: 'blob',
    data: {
      imageIds,
    },
  })
}

export function downloadSingle(imageId) {
  return request({
    url: '/download/single',
    method: 'post',
    responseType: 'blob',
    data: {
      imageId,
    },
  })
}
