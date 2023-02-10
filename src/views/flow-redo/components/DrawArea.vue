<template>
  <div class="draw-area">
    <div
      id="flowContent"
      @drop="drop($event)"
      @dragover="allowDrop($event)"
    >
      <NodeItem
        v-for="item in nodeList"
        :id="`${item.nodeId}`"
        :key="item.nodeId"
        :select-node="selectNode"
        :node="item"
        :style="{
          top: item.y + 'px',
          left: item.x + 'px'
        }"
        @editNode="editNode"
        @deleteNode="deleteNode"
        @changeNodeSite="changeNodeSite"
      />
    </div>
  </div>
</template>

<script>
import NodeItem from './NodeItem.vue'
import { InstanceSetting, NodeSetting, getUUID, connectorPaintStyle } from '../config'
export default {
  components: { NodeItem },
  props: {
    isConnect: {
      type: Boolean,
      default: false
    },
    nodeList: {
      type: Array,
      default() { return [] }
    },
    connList: {
      type: Array,
      default() { return [] }
    }
  },
  data() {
    return {
      jPIns: null, // jsPlumb实例
      loadEasyFlowFinish: false, // 是否加载完毕
      currentConnect: null, // 选中的线，jsPlumb对象
      selectLine: {}, // 选中的数组中的线
      curDragMenu: {}, // 背选中拖拽的菜单
      selectNode: {}, // 被选中的节点
      tempData: {} // 暂存当前，deepclone
    }
  },
  mounted() {
  },
  methods: {
    // jsPlumb实例创建
    initPlumb() {
      this.jPIns = this.$jsPlumb.getInstance({
        ...InstanceSetting,
        Container: 'flowContent' // 选择器id
      })
      this.$nextTick(() => {
        // 初始化连线
        this.connectionAll()
        // 切换拖拽和连线
        this.togDragConn()
      })
    },
    baseUnbind() {
      const ins = this.jPIns
      ins.unbind('beforeDrop', this.handleBeforeDrop)
      // 点击线
      ins.unbind('click', this.handleSelectLine)
      // 双击线
      ins.unbind('dblclick', this.selectDeleLine)
      // 连线,监听所有的连接事件
      ins.unbind('connection', this.addLine)
      // 删除连线
      ins.unbind('connectionDetached', this.handleConnectionDetached)
    },
    baseBind() {
      const ins = this.jPIns
      ins.bind('beforeDrop', this.handleBeforeDrop)
      // 点击线
      ins.bind('click', this.handleSelectLine)
      // 双击线
      ins.bind('dblclick', this.selectDeleLine)
      // 连线,监听所有的连接事件
      ins.bind('connection', this.addLine)
      // 删除连线
      ins.bind('connectionDetached', this.handleConnectionDetached)
    },
    // 初始化节点
    loadFlowNode() {
      const ins = this.jPIns

      this.nodeList.forEach((item) => {
        const { nodeId } = item || {}
        ins.makeSource(nodeId, NodeSetting)
        ins.makeTarget(nodeId, NodeSetting)
        ins.draggable(nodeId, {
          containment: 'parent'
        })
      })
    },
    // 初始化连线
    connectionAll() {
      const ins = this.jPIns
      ins.ready(() => { // 入口
        // 导入默认配置
        ins.importDefaults({
          ...InstanceSetting,
          Container: 'flowContent'
        })
        // 会使整个jsPlumb立即重绘。
        ins.setSuspendDrawing(false, true)
        console.log('add--beforeDrop')
        // 增加移动事件

        // 增加移动事件
        ins.bind('beforeDrop', this.handleBeforeDrop)
        // 点击线
        ins.bind('click', this.handleSelectLine)
        // 双击线
        ins.bind('dblclick', this.selectDeleLine)
        // 连线,监听所有的连接事件
        ins.bind('connection', this.addLine)
        // 删除连线
        ins.bind('connectionDetached', this.handleConnectionDetached)

        // 初始化节点
        this.loadFlowNode()
        for (let i = 0; i < this.connList.length; i++) {
          const conn = this.connList[i]
          const { sourceNodeId, targetNodeId, label } = conn || {}
          const connection = ins.connect({
            source: sourceNodeId,
            target: targetNodeId
          })
          if (label) {
            connection.setLabel({
              label: label,
              cssClass: `linkLabel`
            })
          }
        }
        this.$nextTick(function() {
          this.loadEasyFlowFinish = true
        })
      })
    },
    // 初始化是拖拽还是连线
    togDragConn() {
      const ins = this.jPIns
      const isConnect = this.isConnect
      this.nodeList.forEach((item) => {
        const { nodeId } = item || {}
        // 切换连线
        if (!isConnect) {
          ins.unmakeSource(nodeId)
          ins.unmakeTarget(nodeId)
        } else {
          ins.makeSource(nodeId, NodeSetting)
          ins.makeTarget(nodeId, NodeSetting)
        }
        let isDrag = ins.toggleDraggable(nodeId)
        if (isDrag && isConnect) {
          isDrag = ins.toggleDraggable(nodeId)
        }
        if (!isDrag && !isConnect) {
          isDrag == ins.toggleDraggable(nodeId)
        }
      })
    },
    handleBeforeDrop(evt) {
      console.log('handleBeforeDrop', evt)
      const from = evt.sourceId
      const to = evt.targetId
      if (from === to) {
        this.$message.error('不能连接自己')
        return false
      } if (this.hasLine(from, to)) {
        this.$message.error('不能重复连线')
        return false
      }
      // 回环没控制
      return true
    },
    // 是否具有该线
    hasLine(from, to) {
      const ins = this.jPIns
      const ins_conn_ist = ins.getConnections()
      return ins_conn_ist.some((item) => {
        const { sourceId, targetId } = item
        return (from == sourceId && to == targetId)
      })
    },
    // 点击连线
    handleSelectLine(conn) {
      console.log('click', conn)
      this.selectLine = this.getLineItem(conn)
      if (this.currentConnect) {
        this.currentConnect.setPaintStyle({ ...connectorPaintStyle })
      }
      this.currentConnect = conn
    },
    // 选择要删除的连线
    selectDeleLine(conn) {
      const ins = this.jPIns
      this.selectLine = this.getLineItem(conn)
      this.currentConnect = conn
      this.$nextTick(() => {
        this.currentConnect.setPaintStyle({ stroke: '#0a0', outlineStroke: '#FCFD3C' })
      })
      this.$confirm('确定删除所点击的线吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleCancelEditLine()
        ins.deleteConnection(conn)
      }).catch(() => {
      })
    },
    // 返回线的数组的对应项
    getLineItem(conn) {
      const { sourceId, targetId } = conn || {}
      let selectLine = {}
      this.connList.forEach(line => {
        const { sourceNodeId, targetNodeId } = line || {}
        const from = sourceNodeId
        const to = targetNodeId
        if (sourceId == from && targetId == to) {
          selectLine = { ...line, label: line.label || '' }
        }
      })
      return selectLine
    },
    // 返回线的流程图对象conn
    getLineConn(from, to) {
      const ins = this.jPIns
      const ins_conn_ist = ins.getConnections()
      return ins_conn_ist.find((item) => {
        const { sourceId, targetId } = item
        return (from == sourceId && to == targetId)
      })
    },
    // 取消编辑线
    handleCancelEditLine() {
      if (this.currentConnect) {
        this.currentConnect.setPaintStyle({ ...connectorPaintStyle })
      }
      this.currentConnect = null
      this.selectLine = {}
    },
    // 连线事件
    addLine(evt) {
      console.log('addLine', evt)
      if (!this.loadEasyFlowFinish) return
      const { sourceId, targetId } = evt || {}
      const temp = {
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        label: '' }
      this.connList.push(temp)
      this.$nextTick(() => {
        const conn = this.getLineConn(sourceId, targetId)
        if (conn) {
          this.handleSelectLine(conn)
        }
      })
    },
    // 删除线事件
    handleConnectionDetached(evt) {
      console.log('handleConnectionDetached', evt)
    },
    // 清空
    removeAll() {
      this.loadEasyFlowFinish = false
      const ins = this.jPIns
      for (let i = 0, len = this.nodeList.length; i < len; i++) {
        const nodeId = this.nodeList[i].nodeId
        ins.remove(nodeId)
      }
      const tempData = this.getCurrentFlow()
      this.easyFlowVisible = false
      this.nodeList = []
      this.connList = []
      this.jPIns = null
      this.$nextTick(() => {
        this.easyFlowVisible = true
        for (const key in tempData) {
          this[key] = this.$deepClone(tempData[key])
        }
      })
    },
    getCurrentFlow() {
      const nodeList = this.$deepClone(this.nodeList)
      const connList = this.$deepClone(this.connList)
      const tempData = { ...this.$deepClone(defaultTempData), nodeList, connList }
      return tempData
    },
    // 绘制
    loadJson() {
      this.$nextTick(() => {
        this.easyFlowVisible = true
        this.loadEasyFlowFinish = false
        this.initPlumb()
      })
    }
  }
}
</script>
<style lang="scss">
.linkLabel{
  background: rgb(115, 211, 214);
  padding: 4px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  text-align: center;
  &.active{
  background: #f56c6c;

  }
}

</style>
<style scoped lang="scss">
.demo3{
  height: 90vh;
  display: flex;
  flex-wrap: nowrap;
  margin-top:3vh;
  background-color: #eeeeee;
}
.tools-menu{
  width: 15%;
  height: 100%;
  margin-right:2%;
  margin-left:2%;
}
.draw-area{
  width: 60%;
  height: 100%;
  border: 1px solid gray;
  overflow: hidden;
  margin-right:2%;
}
.attr-panel{
  width: 20%;
  height: 100%;
  border: 1px solid gray;
  margin-right:2%;
}
#flowContent{
  width: 100%;
  height:100%;
  overflow: scroll;
  box-sizing: border-box;
  position: relative;
}
.attr-from{
  height:40vh;
  padding: 10px;
  box-sizing: border-box;
}
.item-label{
  display: inline-block;
  min-width: 130px;
}
</style>
