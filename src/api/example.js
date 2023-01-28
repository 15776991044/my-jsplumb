import request, { get, post } from '@/utils/request'

export function example1(data) {
  return request({
    url: '/apis/example1',
    method: 'post',
    data
  })
}

export function example2(params) {
  return get('/apis/example2', params)
}

export function example3(data) {
  return post('/apis/example3', data, false)
}