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
      <div class="attr-from">
        编辑节点 <br>
        <div v-for="(item,key) in selectNode" :key="key">
          <span class="item-label">{{ key }} ：</span>
          {{ item }}
          <el-input v-model="selectNode[key]" :disabled="key=='nodeId'" />
        </div>
        <el-button @click="handleCancelEdit">取消</el-button>
        <el-button type="primary" @click="handleEdit">保存</el-button>
      </div>
      <div class="attr-from">
        编辑连线 <br>
        <div v-for="(item,key) in selectLine" :key="key">
          <span class="item-label">{{ key }} ：</span>
          <!-- {{ item }} -->
          <el-input v-if="key=='label'" v-model="selectLine[key]" @input="handleEditLineLabel" />
          <el-input v-else v-model="selectLine[key]" :disabled="true" @input="handleEditLineLabel" />
        </div>
        <el-button @click="handleCancelEditLine">取消</el-button>
        <el-button type="primary" @click="handleEditLine">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import ToolsMenu from './components/ToolsMenu.vue'
import NodeItem from './components/NodeItem.vue'
import AttrPanel from './components/AttrPanel.vue'
import { InstanceSetting, NodeSetting, getUUID, connectorPaintStyle } from './config.js'

export default {
  components: { ToolsMenu, NodeItem },
  data() {
    return {
      isConnect: false, // 连线/移动
      jPIns: null, // jsPlumb实例
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
      selectLine: {},
      curDragMenu: {} // 背选中拖拽的菜单

    }
  },
  watch: {
    isConnect() {
      this.InitAllNode()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initPlumb()
    })
  },
  methods: {
    setDragMenu(menuItem) {
      this.curDragMenu = menuItem
    },
    drop(event) {
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
    initPlumb() {
      this.jPIns = this.$jsPlumb.getInstance({
        ...InstanceSetting,
        ...NodeSetting,
        Container: 'flowContent' // 选择器id
      })
      const ins = this.jPIns
      ins.batch(() => {
        this.nodeList.forEach((item) => {
          const { nodeId } = item || {}
          ins.makeSource(nodeId, NodeSetting)
          ins.makeTarget(nodeId, NodeSetting)
          ins.draggable(nodeId, {
            containment: 'parent'
          })
        })
        this.connectionAll()
        this.InitAllNode()
      })
    },
    InitAllNode() {
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
    // 初始化节点
    initNode(item) {
      const ins = this.jPIns
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
    // 点击连线
    handleSelectLine(conn) {
      console.log('click', conn)
      this.selectLine = this.getLineItem(conn)
      if (this.currentConnect) {
        this.currentConnect.setPaintStyle({ ...connectorPaintStyle })
      }
      this.currentConnect = conn
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
    // 更改label同步到流程图里
    handleEditLineLabel() {
      const { label } = this.selectLine
      this.currentConnect.setLabel({
        label: label,
        cssClass: `linkLabel`
      })
      // 更改线样式，恢复还给改回来
      this.currentConnect.setPaintStyle({ stroke: '#0a0', outlineStroke: '#FCFD3C' })
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
    // 是否具有该线
    hasLine(from, to) {
      const ins = this.jPIns
      const ins_conn_ist = ins.getConnections()
      console.log('ins_conn_ist', ins_conn_ist)
      return ins_conn_ist.some((item) => {
        const { sourceId, targetId } = item
        return (from == sourceId && to == targetId)
      })
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
      console.log('evt', evt)
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
    handleConnectionDetached(evt) {
      console.log('handleConnectionDetached', evt)
    },
    // 连线
    connectionAll() {
      const ins = this.jPIns
      ins.ready(() => { // 入口
        // 导入默认配置
        ins.importDefaults({ ...InstanceSetting, ...NodeSetting, Container: 'flowContent' })
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
