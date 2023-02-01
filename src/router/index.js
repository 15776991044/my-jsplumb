import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Home from '@/views/home'
import BaseJsplumb from '@/views/base-jsplumb'
import JsplumbGroup from '@/views/jsplumb-group'
import EditJsplumb from '@/views/edit-jsplumb'

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
  },
  {
    path: '/jsplumb-group',
    name: 'JsplumbGroup',
    component: JsplumbGroup
  },
  {
    path: '/edit-jsplumb',
    name: 'EditJsplumb',
    component: EditJsplumb
  }
]

export default routes
