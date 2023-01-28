/*
 * @Description:
 * @Date: 2021-12-07 10:30:40
 * @LastEditTime: 2021-12-10 15:30:25
 */
import actions from '@/shared/actions'

export default {
  inserted(el, binding) {
    const { value } = binding
    const all_permission = '*:*:*'

    let permissions = ['*:*:*']
    const userInfo = actions.getUserInfo()

    if (userInfo) {
      const { resources } = userInfo
      permissions = resources
    }

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value

      const hasPermissions = permissions.some(permission => {
        return all_permission === permission || permissionFlag.includes(permission)
      })

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`请设置操作权限标签值`)
    }
  }
}
