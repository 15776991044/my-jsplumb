<template>
  <div class="demo3">
    <ToolsMenu ref="ToolsMenu" class="tools-menu" @setDragMenu="setDragMenu">
      <div class="tool-item" :class="{active:!isConnect}">
        <div class="tool-item-icon" title="鼠标工具" @click="isConnect=false"><i class="el-icon-rank " /></div>
      </div>
      <div class="tool-item" :class="{active:isConnect}">
        <i class="el-icon-sort tool-item-icon" title="连线工具" @click="isConnect=true" />
      </div>
    </ToolsMenu>
    <!-- 操作区 -->
    <div v-if="easyFlowVisible" class="draw-area">
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
    <!-- 编辑区 -->
    <div class="attr-panel">
      <div>
        <el-button style="width:40%" type="primary" @click="undo"> 撤销{{ undoStack.length }}</el-button>
        <el-button style="width:40%" type="primary" @click="redo"> 恢复{{ redoStack.length }}</el-button>
        <el-button type="primary" :disabled="!easyFlowVisible" @click="removeAll">清空</el-button>
        <el-button type="primary" :disabled="easyFlowVisible" @click="loadJson()">绘制</el-button>
        <el-button type="primary" @click="baseUnbind">baseUnbind</el-button>
        <el-button type="primary" @click="baseBind">baseBind</el-button>

      </div>
      <div class="attr-from">
        编辑节点 <br>
        <div v-for="(item,key) in selectNode" :key="key">
          <span class="item-label">{{ key }} ：</span>
          <!-- {{ item }} -->
          <el-input v-model="selectNode[key]" :disabled="key=='nodeId'" @input="handleEditNodeLabel(key)" />
        </div>
        <!-- <el-button @click="handleCancelEditNode">取消</el-button> -->
        <!-- <el-button type="primary" @click="handleEditNode">暂存编辑</el-button> -->
      </div>
      <div class="attr-from">
        编辑连线 <br>
        <div v-for="(item,key) in selectLine" :key="key">
          <span class="item-label">{{ key }} ：</span>
          <!-- {{ item }} -->
          <el-input v-if="key=='label'" v-model="selectLine[key]" @input="handleEditLineLabel" />
          <el-input v-else v-model="selectLine[key]" :disabled="true" />
        </div>
        <!-- <el-button @click="handleCancelEditLine">取消</el-button> -->
        <!-- <el-button type="primary" @click="handleEditLine">暂存编辑</el-button> -->
      </div>
    </div>
  </div>
</template>

<script>
import ToolsMenu from './components/ToolsMenu.vue'
import NodeItem from './components/NodeItem.vue'
import { InstanceSetting, NodeSetting, getUUID, connectorPaintStyle } from './config.js'
const defaultTempData = {
  nodeList: [],
  connList: [],
  currentConnect: null,
  loadEasyFlowFinish: false
}
export default {
  components: { ToolsMenu, NodeItem },
  data() {
    return {
      easyFlowVisible: true, // 控制画布销毁,重绘要销毁，要不bind事件会重复
      undoStack: [], // 撤销栈
      redoStack: [], // 恢复栈
      isConnect: false, // 连线/移动
      jPIns: {}, // jsPlumb实例
      loadEasyFlowFinish: false, // 是否加载完毕
      nodeList: [
        { name: '省公司虚拟专家组', nodeId: 'processDefineDiv_node_3', x: 80, y: 200 },
        { name: '分公司咨询组', nodeId: 'processDefineDiv_node_5', x: 500, y: 400 },
        { name: '咨询组', nodeId: 'processDefineDiv_node_6', x: 380, y: 100 },
        { name: '咨询组', nodeId: 'processDefineDiv_node_7', x: 600, y: 100 }
      ],
      connList: [
        { sourceNodeId: 'processDefineDiv_node_3', targetNodeId: 'processDefineDiv_node_5', label: 'ceshi' },
        { sourceNodeId: 'processDefineDiv_node_3', targetNodeId: 'processDefineDiv_node_6' }
      ],
      currentConnect: null, // 选中的线，jsPlumb对象
      selectLine: {}, // 选中的数组中的线
      curDragMenu: {}, // 背选中拖拽的菜单
      selectNode: {}, // 被选中的节点
      tempData: {} // 暂存当前，deepclone
    }
  },
  watch: {
    isConnect() {
      this.togDragConn()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initPlumb()
    })
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
        // 重置currentConnect、selectLine、selectNode
        this.resetSelect()
        // 切换拖拽和连线
        this.togDragConn()
      })
    },
    resetSelect() {
      this.nodeList.map((conn) => {
        const { nodeId } = conn || {}
        if (this.selectNode.nodeId == nodeId) {
          this.selectNode = this.$deepClone({ ...conn })
        }
      })
      this.connList.map((line) => {
        const { sourceNodeId, targetNodeId } = line || {}
        if (this.selectLine.sourceNodeId == sourceNodeId && this.selectLine.targetNodeId == targetNodeId) {
          this.selectLine = this.$deepClone({ ...line })
          this.currentConnect = this.getLineConn(sourceNodeId, targetNodeId)
        }
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
      const ins = this.jPIns || {}
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
      this.addUndo()
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
        this.addUndo()
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
    async removeAll() {
      return new Promise((resolve) => {
        this.tempData = this.$deepClone(this.getCurrentFlow())
        this.loadEasyFlowFinish = false
        const ins = this.jPIns
        // 真不明白，为什么这个时候不行，事件重复
        // this.nodeList.forEach((node) => {
        //   const nodeId = node.nodeId
        //   ins.unmakeSource(nodeId)
        //   ins.unmakeTarget(nodeId)
        // })
        const ins_conn_ist = ins.getConnections()
        ins_conn_ist.map((conn) => {
          ins.deleteConnection(conn)
        })
        this.isConnect = false

        // 不知道为啥，必须改为移动模式，否则beforeDrop事件重复
        this.$nextTick(() => {
          this.easyFlowVisible = false
          this.nodeList = []
          this.connList = []
          this.jPIns = {}
          resolve()
        })

      // this.$nextTick(() => {
      //   this.easyFlowVisible = true
      //   for (const key in tempData) {
      //     this[key] = this.$deepClone(tempData[key])
      //   }
      // })
      })
    },
    getCurrentFlow() {
      console.log(this.undoStack)
      const nodeList = [...this.$deepClone(this.nodeList)]
      const connList = [...this.$deepClone(this.connList)].filter(item => {
        const from = item.sourceNodeId
        const to = item.targetNodeId
        return this.hasLine(from, to)
      })
      const tempData = {
        currentConnect: null,
        loadEasyFlowFinish: false,
        nodeList,
        connList }
      return tempData
    },
    // 绘制
    loadJson(tempData) {
      this.$nextTick(() => {
        tempData = tempData || this.tempData
        console.log(this.tempData)
        if (tempData) {
          this.easyFlowVisible = true
          for (const key in tempData) {
            this[key] = this.$deepClone(tempData[key])
          }
        }
        this.$nextTick(() => {
          this.easyFlowVisible = true
          this.loadEasyFlowFinish = false
          this.initPlumb()
        })
      })
    },
    // 编辑区
    // 更改label同步到流程图里
    handleEditLineLabel() {
      const { label } = this.selectLine
      this.addUndo()
      this.connList = this.connList.map(line => {
        const { sourceNodeId, targetNodeId } = line || {}
        if (this.selectLine.sourceNodeId == sourceNodeId && this.selectLine.targetNodeId == targetNodeId) {
          line = this.$deepClone({ ...line, label })
        }
        return this.$deepClone({ ...line })
      })
      this.currentConnect && this.currentConnect.setLabel({
        label: label,
        cssClass: `linkLabel`
      })
      // 更改线样式，恢复还给改回来
      this.currentConnect && this.currentConnect.setPaintStyle({ stroke: '#0a0', outlineStroke: '#FCFD3C' })
    },
    // 保存编辑线
    handleEditLine() {
      if (this.currentConnect) {
        this.currentConnect.setPaintStyle({ ...connectorPaintStyle })
      }
      console.log('线', this.jPIns.getConnections())
    },
    // 取消编辑线
    handleCancelEditLine() {
      if (this.currentConnect) {
        this.currentConnect.setPaintStyle({ ...connectorPaintStyle })
      }
      this.currentConnect = null
      this.selectLine = {}
    },
    // 更改node同步到流程图里
    handleEditNodeLabel(prop) {
      this.addUndo()

      this.nodeList = this.nodeList.map((item) => {
        const { nodeId } = item || {}
        item = this.$deepClone({ ...item })
        if (this.selectNode.nodeId == nodeId) {
          item[prop] = this.selectNode[prop]
        }
        return this.$deepClone({ ...item })
      })
      this.$nextTick(() => {
        const ins = this.jPIns
        ins.repaintEverything()
      })
    },
    editNode({ nodeId, x, y }) {
      // 重复点击同一元素
      if (this.selectNode.nodeId == nodeId) {
        this.selectNode = { ...this.selectNode, x, y }
        return
      }
      let selectNode = {}
      this.nodeList.forEach(node => {
        if (node.nodeId == nodeId) {
          selectNode = { ...node, x, y }
        }
      })
      console.log('selectNode', nodeId, x, y, selectNode)

      this.selectNode = selectNode
    },
    deleteNode({ nodeId, x, y }) {
      this.editNode({ nodeId, x, y })
      this.$confirm('确定删除选节点吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.addUndo()
        const ins = this.jPIns
        // 点线通过jsPlumb的removeAllEndpoints方法注销
        // ins.removeAllEndpoints(nodeId)
        // 节点通过数据删掉
        this.nodeList.forEach((item, index) => {
          if (item.nodeId === nodeId) {
            this.nodeList.splice(index, 1)
          }
        })
        // 删除关于nodeId的节点、端点、线
        ins.remove(nodeId)
        this.selectNode = {}
      }).catch(() => {
      })
    },
    changeNodeSite({ nodeId, x, y }) {
      console.log('changeNodeSite', x, y)
      // this.editNode({ nodeId, x, y })
      // 点线通过jsPlumb的removeAllEndpoints方法注销
      // ins.removeAllEndpoints(nodeId)
      // 节点通过数据删掉
      let addUndoFlag = false
      const nodeList = this.nodeList.map((item, index) => {
        if (item.nodeId === nodeId) {
          if (x != item.x || y != item.y) {
            addUndoFlag = true
            item = this.$deepClone({ ...item, x, y })
          }
        }
        return this.$deepClone({ ...item })
      })
      if (addUndoFlag) {
        this.addUndo()
        this.nodeList = nodeList
      }
      // this.$nextTick(() => {
      // })
    },
    addUndo() {
      this.undoStack.push(this.$deepClone(this.getCurrentFlow()))
    },
    // 撤销
    async undo() {
      if (this.undoStack.length < 1) { return }
      this.loadEasyFlowFinish = false
      this.redoStack.push(this.$deepClone(this.getCurrentFlow()))
      console.log('this.redoStack', this.redoStack)
      await this.removeAll()
      this.loadJson(this.undoStack.pop())
    },
    // 恢复
    async redo() {
      if (this.redoStack.length < 1) { return }
      this.loadEasyFlowFinish = false
      this.addUndo()
      await this.removeAll()
      this.loadJson(this.redoStack.pop())
    },
    drop(event) {
      this.addUndo()
      const temp = {
        nodeId: getUUID(),
        name: '新元素',
        y: event.offsetY,
        x: event.offsetX
      }
      this.nodeList.push(temp)
      this.$nextTick(() => {
        this.initNode(temp)
      })
    },
    allowDrop(event) {
      event.preventDefault()
    },
    // 初始化节点
    initNode(item) {
      const ins = this.jPIns || {}
      const { nodeId } = item || {}
      ins.draggable(nodeId, {
        containment: 'parent'
      })
      if (!this.isConnect) {
        ins.unmakeSource(nodeId)
        ins.unmakeTarget(nodeId)
      } else {
        ins.makeSource(nodeId, NodeSetting)
        ins.makeTarget(nodeId, NodeSetting)
        ins.toggleDraggable(nodeId, {
          containment: 'parent'
        })
      }
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
