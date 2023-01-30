import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './App.vue'
import routes from './router'
import actions from './shared/actions'
import permission from './directive/permission'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css' // �� index.html ��ͨ�� link ��ǩ������

Vue.use(ElementUI)
Vue.use(permission)

import jsPlumb from 'jsplumb'

Vue.prototype.$jsPlumb = jsPlumb.jsPlumb

Vue.config.productionTip = false

let instance = null
let router = null

function render(props) {
  let container

  if (props) {
    container = props.container
    actions.setActions(props)
  }

  router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? '/jsplumb' : '/child/jsplumb',
    mode: 'history',
    routes
  })

  instance = new Vue({
    router,
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}

if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() {
  // console.log('[vue] vue app bootstraped')
}

export async function mount(props) {
  // console.log('[vue] props from main framework', props)
  render(props)
}

export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
  router = null
}
