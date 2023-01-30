<template>
  <div>
    base-jsplum
    <!-- 菜单 -->
    <div class="flow-menu">
      <div v-for="(item,index) in menuList" :key="index" class="menu-item" draggable="true">
        <div>{{ item.name }}</div>
      </div>
    </div>
    <!-- 操作区 -->
    <div class="flow-detail">
      <div
        id="flowContent"
        ref="flowContent"
        @drop="drop($event)"
        @dragover="allowDrop($event)"
        @dblclick="isConnect=!isConnect"
      >
        <div id="node1" ref="node1" draggable="true">www</div>
        <!-- <div id="item_left" class="item" />
        <div id="item_right" class="item" style="margin-left:50px;" /> -->
        <div id="col2" class="col2">
          <div
            v-for="item in nodeList"
            :id="`${item.nodeId}`"
            :key="item.nodeId"
            :style="{
              top: item.y + 'px',
              left: item.x + 'px'
            }"
            class="node-item"
            name="cell"
          >
            <div :id="`drop-${item.nodeId}`" class="node-item-sub-main">{{ item.name }}</div>
            <i class="el-icon-circle-close" @click.stop="deleteNode(item.nodeId)" />
            <div v-show="isConnect" class="drag-dom" />
            <div :id="`menu-${item.nodeId}`" class="node-item-sub">mebu</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { jsplumbSetting, endpointStyle } from './commonConfig'
import * as d3 from 'd3'
export default {
  data() {
    return {
      isConnect: false,
      currentItem: {},
      menuList: [
        {
          type: 1,
          name: '起点'
        }
      ],
      jsPlumb: null,
      nodeList: [
        { name: '省公司虚拟专家组', nodeId: 'processDefineDiv_node_3' },
        { name: '分公司咨询组', nodeId: 'processDefineDiv_node_5' },
        { name: '咨询组', nodeId: 'processDefineDiv_node_6' },
        { name: 'sub咨询组', nodeId: 'processDefineDiv_node_7' }
        // { name: 'other咨询组', nodeId: 'processDefineDiv_node_9' }
      ],
      connList: [
        { sourceNodeId: 'processDefineDiv_node_3', targetNodeId: 'processDefineDiv_node_5' },
        { sourceNodeId: 'processDefineDiv_node_3', targetNodeId: 'processDefineDiv_node_6' },
        { sourceNodeId: 'processDefineDiv_node_6', targetNodeId: 'processDefineDiv_node_7' },
        { sourceNodeId: 'processDefineDiv_node_3', targetNodeId: 'menu-processDefineDiv_node_7' }
      ]
    }
  },
  async mounted() {
    const Treelist = this.tranListToTreeData(this.nodeList, this.connList)
    const len = Treelist.length
    const con = d3.select('#col2').node()
    const width = con.offsetWidth
    const height = con.offsetHeight / len
    const nodeList = []
    Treelist.forEach((item, index) => {
      const data = d3.hierarchy(item)
      const treeData = d3.tree().size([width - 100, height - 60]).separation(function(a, b) {
        const n = Math.ceil(Math.random() * 10)
        console.log('ab', a, b, n)
        return n
      })(data)
      const nodes = treeData.descendants()
      nodes.forEach(el => {
        nodeList.push(Object.assign({}, el.data, { x: el.x + index * height, y: el.y }))
      })
    })

    this.nodeList = nodeList
    this.$nextTick(() => {
      this.initPlumb()
    })
  },
  methods: {
    tranListToTreeData(arr, connList) {
      const newArr = []
      const map = {}
      arr.forEach(item => {
        // 为了计算方便，统一添加children
        item.children = []
        item.pid = ''
        // 构建一个字典
        const key = item.nodeId
        map[key] = item
      })
      connList.forEach(item => {
        const child = map[item.targetNodeId]
        if (child) {
          //    如果它没有父级（pid:''）,直接添加到newArr
          child.pid = item.sourceNodeId
        }
      })
      for (const key in map) {
        const item = map[key]
        const parent = map[item.pid]
        if (parent) {
          (parent.children || (parent.children = [])).push(item)
        } else {
          newArr.push(item)
        }
      }

      // connList.forEach(item => {
      //   const child = map[item.targetNodeId]
      //   const parent = map[item.sourceNodeId]
      //   if (parent && child) {
      //     //    如果它有父级，把当前对象添加父级元素的children中
      //     parent.children.push(child)
      //     // delete map[item.targetNodeId]
      //   } else if (child) {
      //     //    如果它没有父级（pid:''）,直接添加到newArr
      //     newArr.push(child)
      //   }
      // })
      console.log('newArr,map', newArr, map)
      return newArr
    },
    initPlumb() {
      this.jsPlumb = this.$jsPlumb.getInstance({
        Container: 'flowContent', // 选择器id
        EndpointStyle: { radius: 0.11, fill: '#fff' } // 端点样式
      })
      const ins = this.jsPlumb
      ins.getAllConnections()
      ins.batch(() => {
        this.nodeList.forEach((item) => {
          this.initNode(item)
        })
        this.connectionAll()
      })
      // const elem = document.getElementsByName('cell')
      // ins.setSourceEnabled(elem, true)
      // ins.setTargetEnabled(elem, true)
      // ins.setDraggable(elem, true)
    },
    initNode(item) {
      const { nodeId } = item || {}
      const ins = this.jsPlumb
      const elem = document.getElementById(nodeId)
      console.log(ins, elem)
      ins.makeSource(elem, {
        filter: '.drag-dom',
        filterExclude: false,
        anchor: ['Perimeter', { anchorCount: 200, shape: 'Rectangle' }],
        allowLoopback: false,
        maxConnections: 3

      })
      ins.makeTarget(elem, {
        filter: '.drag-dom',
        filterExclude: false,
        anchor: ['Perimeter', { anchorCount: 200, shape: 'Rectangle' }],
        allowLoopback: false,
        maxConnections: 3

      })
      const subId = `menu-${item.nodeId}`
      const dropId = `drop-${item.nodeId}`
      const elem1 = document.getElementById(subId)
      console.log(ins, elem)
      ins.makeSource(elem1, {
        filter: '.drag-dom',
        filterExclude: false,
        anchor: ['Left', { anchorCount: 200, shape: 'Rectangle' }],
        allowLoopback: false,
        maxConnections: 3

      })
      ins.makeTarget(elem1, {
        filter: '.drag-dom',
        filterExclude: false,
        anchor: ['Left', { anchorCount: 200, shape: 'Rectangle' }],
        allowLoopback: false,
        maxConnections: 3

      })
      // ins.addEndpoint(
      //   nodeId, { anchors: 'TopCenter' }, endpointStyle
      // )

      ins.draggable(nodeId, { containment: 'parent' })
    },
    connectionAll() {
      const ins = this.jsPlumb
      ins.ready(() => { // 入口
      // 导入默认配置
        ins.importDefaults(jsplumbSetting)
        // 完成连线前的校验
        ins.bind('beforeDrop', evt => {
          console.log('beforeDrop', evt)
          const res = () => { } // 此处可以添加是否创建连接的校验， 返回 false 则不添加；
          return res
        })

        for (let i = 0; i < this.connList.length; i++) {
          const conn = this.connList[i]
          const connection = ins.connect({
            source: conn.sourceNodeId,
            target: conn.targetNodeId,
            overlays: [['Arrow', { width: 12,
              length: 10,
              location: 1,
              paintStyle: {
                stroke: '#496def',
                fill: '#496def'
              }}
            ]]
          })
          connection.setPaintStyle({ stroke: '#496def', strokeWidth: 2 })
          connection.setLabel({
            label: 'aaa',
            cssClass: `linkLabel`
          })
        }
      })
    },
    drop(event) {
      // event.preventDefault();
      // const _obj = this.$refs.flowContent
      // debugger
      const temp = {
        nodeId: this.getUUID(),
        name: '新元素',
        y: event.offsetY,
        x: event.offsetX
      }
      this.nodeList.push(temp)
      this.$nextTick(() => {
        this.initNode(temp)
      })
      // debugger
      console.log('temp', temp)
    },
    // 删除节点
    deleteNode(nodeId) {
      console.log(nodeId)
      this.nodeList.forEach((item, index) => {
        if (item.nodeId === nodeId) {
          this.nodeList.splice(index, 1)
        }
      })

      this.$nextTick(function() {
        console.log('删除' + nodeId)
        this.jsPlumb.removeAllEndpoints(nodeId)
      })
    },
    allowDrop(event) {
      event.preventDefault()
    },
    getUUID() {
      var s = []
      var hexDigits = '0123456789abcdef'
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
      }
      s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = '-'
      var uuid = s.join('')
      return uuid
    }
  }
}
</script>

<style lang="scss">
.drag-dom{
  position: absolute;
  left: 0;
  top:0;
  width:100%;
  height: 100%;
  cursor: crosshair;
}
.flow-menu{
  position: relative;
  .menu-item{
    display: inline-block;
    margin-right: 30px;
    cursor: pointer;
  }
}
.flow-detail{
  height: 60vh;
  margin: 4vh 2vw;
  border: 1px solid #333;
  box-sizing: border-box;
  #flowContent {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .col2,.col1{
    position: relative;
    width: 100%;
    height: 100%;

  }
  .node-item{
    line-height: 40px;
    background: #496def;
    position: absolute;
    color: #fff;
    border: 1px solid #ccc;
    border-radius: 10px;
    text-align: center;
    cursor: move;
  }
  .node-item-sub{
    background: #fff;
    color: #333;
    padding: 4px 10px;

  }
  .node-item-sub-main{}
  .linkLabel{
    background: rgb(115, 211, 214);
    padding: 4px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    text-align: center;
  }
}

</style>
