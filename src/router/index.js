import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Home from '@/views/home'
import BaseJsplumb from '@/views/base-jsplumb'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/base-jsplumb',
    name: 'BaseJsplumb',
    component: BaseJsplumb
  }
]

export default routes
