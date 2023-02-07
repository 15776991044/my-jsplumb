<template>
  <div class="demo3">
    <ToolsMenu ref="ToolsMenu" class="tools-menu">
      <div class="tool-item">
        <div class="tool-item-icon" title="鼠标工具" @click="isConnect=false"><i class="el-icon-rank " /></div>
      </div>
      <div class="tool-item">
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
    <AttrPanel ref="AttrPanel" class="attr-panel" />
  </div>
</template>

<script>
import ToolsMenu from './components/ToolsMenu.vue'
import NodeItem from './components/NodeItem.vue'
import AttrPanel from './components/AttrPanel.vue'
import { InstanceSetting, NodeSetting } from './config.js'

export default {
  components: { ToolsMenu, NodeItem, AttrPanel },
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
      ]
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
    drop(event) {
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
        console.log('isDrag', isDrag, isConnect)
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
    connectionAll() {
      const ins = this.jPIns
      ins.ready(() => { // 入口
        // 导入默认配置
        ins.importDefaults({ ...InstanceSetting, ...NodeSetting, Container: 'flowContent' })
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
  overflow: scroll;
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
</style>
