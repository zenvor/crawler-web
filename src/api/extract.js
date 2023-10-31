import request from '@/utils/request'

export function extractions(url) {
  return request({
    url: '/extractions',
    method: 'post',
    data: {
      url
    }
  })
}

export function downloadMultiple(imageIds) {
  return request({
    url: '/download/multiple',
    method: 'post',
    responseType: 'blob',
    data: {
      imageIds
    }
  })
}

export function downloadSingle(imageId) {
  return request({
    url: '/download/single',
    method: 'post',
    responseType: 'blob',
    data: {
      imageId
    }
  })
}