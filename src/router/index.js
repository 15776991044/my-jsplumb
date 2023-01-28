import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Home from '@/views/home'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
]

export default routes
