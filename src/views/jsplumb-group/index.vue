<template>
  <div class="demo2">
    <div class="block">
      <span class="demonstration">起始日期时刻为 12:00:00</span>
      <el-date-picker
        v-model="value1"
        type="datetimerange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :default-time="['12:00:00']"
        @change="a"
      />
    </div>
    <!-- 菜单 -->
    <div class="flow-menu">
      <div v-for="(item,index) in menuList" :key="index" class="menu-item" draggable="true">
        <div>{{ item.name }}</div>
      </div>
    </div>
    <!-- 操作区 -->
    <div id="flowContent">
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
        <div :id="`menu-${item.nodeId}`" class="node-item-sub">mebu</div>
      </div>
    </div>

  </div>
</template>

<script>
import { InstanceSetting, NodeSetting } from './config.js'
export default {
  data() {
    return {
      value1: '',
      jsPlumb: null,
      menuList: [
        {
          type: 1,
          name: '起点'
        }
      ],
      nodeList: [
        { name: '省公司虚拟专家组', nodeId: 'processDefineDiv_node_3', x: 200, y: 20 },
        { name: '分公司咨询组', nodeId: 'processDefineDiv_node_5', x: 100, y: 220 },
        { name: '咨询组', nodeId: 'processDefineDiv_node_6', x: 300, y: 220 },
        { name: 'sub咨询组', nodeId: 'processDefineDiv_node_7', x: 400, y: 420 }
      ],
      connList: [
        { sourceNodeId: 'processDefineDiv_node_3', targetNodeId: 'processDefineDiv_node_5' },
        { sourceNodeId: 'processDefineDiv_node_3', targetNodeId: 'processDefineDiv_node_6' },
        { sourceNodeId: 'processDefineDiv_node_6', targetNodeId: 'processDefineDiv_node_7' },
        { sourceNodeId: 'processDefineDiv_node_3', targetNodeId: 'processDefineDiv_node_7' }
      ]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initPlumb()
    })
  },
  methods: {
    a(res) { console.log('res', res) },
    initPlumb() {
      // 初始化实例
      this.jsPlumb = this.$jsPlumb.getInstance({
        ...InstanceSetting,
        Container: 'flowContent' // 选择器id
      })
      const ins = this.jsPlumb
      ins.getAllConnections() // 获取全部连线
      ins.batch(() => {
        this.nodeList.forEach((item) => {
          this.initNode(item)
        })
        this.connectionAll()
      })
    },
    // 初始化节点
    initNode(item) {
      const { nodeId } = item || {}
      this.setEnterPoint(`drop-${nodeId}`)
      this.addDraggable(`${nodeId}`)
      this.setExitPoint(`menu-${nodeId}`)
    },
    addDraggable(id) {
      this.jsPlumb.draggable(id, {
        containment: 'parent'
      })
    },
    setEnterPoint(id) {
      const elem = document.getElementById(id)
      const conf = { ...NodeSetting, isTarget: true, isSource: false, maxConnections: -1 }
      this.jsPlumb.addEndpoint(id, {
        anchor: ['Top', 'Bottom'],
        anchors: ['Top', 'Bottom'],
        uuid: id + '-in'
      }, conf)
      console.log(id + '-in')
    },
    setExitPoint(id) {
      const elem = document.getElementById(id)
      const conf = { ...NodeSetting, isTarget: false, isSource: true, maxConnections: -1 }
      this.jsPlumb.addEndpoint(id, {
        anchors: 'Right',
        uuid: id + '-out'
      }, conf)
      console.log(id + '-out')
    },
    connectionAll() {
      const ins = this.jsPlumb
      ins.ready(() => { // 入口
      // 导入默认配置
        ins.importDefaults({ ...InstanceSetting,
          Container: 'flowContent' })
        // 完成连线前的校验
        ins.bind('beforeDrop', evt => {
          console.log('beforeDrop', evt)
          const res = () => { } // 此处可以添加是否创建连接的校验， 返回 false 则不添加；
          return res
        })

        for (let i = 0; i < this.connList.length; i++) {
          const conn = this.connList[i]
          const from = 'drop-' + conn.sourceNodeId + '-in'
          const to = 'menu-' + conn.targetNodeId + '-out'
          console.log(from, to)
          const connection = ins.connect({
            uuids: [from, to]
            // source: 'drop-' + conn.sourceNodeId,
            // target: 'menu-' + conn.targetNodeId
            // source: conn.sourceNodeId,
            // target: conn.targetNodeId
            // overlays: [['Arrow', { width: 12,
            //   length: 10,
            //   location: 1,
            //   paintStyle: {
            //     stroke: '#496def',
            //     fill: '#496def'
            //   }}
            // ]]
          })
          // connection.setPaintStyle({ stroke: '#496def', strokeWidth: 2 })
          connection.setLabel({
            label: 'aaa',
            cssClass: `linkLabel`
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
.demo2{
  .line-lable{
    background: #fff;
  }
  .flow-menu{
    position: relative;
    .menu-item{
      display: inline-block;
      margin-right: 30px;
      cursor: pointer;
    }
  }
  #flowContent{
    height: 60vh;
    margin: 4vh 2vw;
    border: 1px solid #333;
    box-sizing: border-box;
    position: relative;
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
    .linkLabel{
      background: rgb(115, 211, 214);
      padding: 4px 10px;
      border: 1px solid #ccc;
      border-radius: 6px;
      text-align: center;
    }
  }
}

</style>

