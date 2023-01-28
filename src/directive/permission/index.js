import actionpermission from './actionpermission'

const install = function(Vue) {
  Vue.directive('actionpermission', actionpermission)
}

if (window.Vue) {
  window['actionpermission'] = actionpermission
  // eslint-disable-next-line no-undef
  Vue.use(install)
}

actionpermission.install = install
export default actionpermission

