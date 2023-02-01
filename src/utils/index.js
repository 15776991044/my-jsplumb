// 深拷贝
export function deepClone(newObj, sourceObj) {
  for (const k in sourceObj) {
    if (typeof sourceObj[k] === 'object') {
      newObj[k] = {}
      deepClone(newObj[k], sourceObj[k])
    } else {
      newObj[k] = sourceObj[k]
    }
  }
  return newObj
}

// 比较两个对象键值对是否相等
export function objIsEqual(obj1, obj2) {
  var o1 = obj1 instanceof Object
  var o2 = obj2 instanceof Object
  if (!o1 || !o2) {
    // 判断不是对象,数组也是对象
    return obj1 === obj2
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false
    // Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,例如：数组返回下表：let arr = ["a", "b", "c"];console.log(Object.keys(arr))->0,1,2;
  }

  for (var attr in obj1) {
    var t1 = obj1[attr] instanceof Object
    var t2 = obj2[attr] instanceof Object
    if (t1 && t2) {
      return objIsEqual(obj1[attr], obj2[attr])
    } else if (obj1[attr] !== obj2[attr]) {
      return false
    }
  }
  return true
}
