import axios from 'axios'
import { getToken, removeToken } from '@/utils/auth'
import { MessageBox, Message } from 'element-ui'

let messageBoxFlag = 0

// create an axios instance
const service = axios.create({
  baseURL: '',
  timeout: 5000,
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    const token = getToken()
    if (token) {
      config.headers['X-Token'] = token
    }
    return config
  },
  error => {
    // do something with request error
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 0, it is judged as an error.
    if (res.code !== 0) {
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      
      return Promise.reject(new Error(res || 'Error'))
    } else {
      return res
    }
  },
  error => {
    // console.log('err' + error) // for debug
    if (error.response.status === 401) {
      if (messageBoxFlag === 0) {
        messageBoxFlag = 1
        // to re-login
        MessageBox.confirm('您的登录状态已失效，请重新登录', '提示', {
          type: 'warning',
          showCancelButton: false,
          showClose: false,
          closeOnClickModal: false,
          distinguishCancelAndClose: true,
          confirmButtonText: '重新登录'
        }).then(() => {
          removeToken()
          location.reload()
        })
      }
    } else {
      Message({
        message: (error.response.data && error.response.data.msg) || error.message || 'Error',
        type: 'error',
        duration: 5 * 1000,
        showClose: true
      })
    }
    return Promise.reject(error)
  }
)

export function get(url = '', params = {}) {
  return service.get(url, { params })
}

export function post(url = '', data = {}, isForm = true) {
  if (isForm) {
    const form = new FormData()
    for (const key in data) {
      form.append(key, data[key])
    }
    data = form
  }
  return service.post(url, data)
}

export default service
