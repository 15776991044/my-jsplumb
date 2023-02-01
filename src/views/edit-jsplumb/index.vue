<template>
  <div class="demo2">
    <!-- 菜单 -->
    <div class="flow-menu">
      <div v-for="(item,index) in menuList" :key="index" class="menu-item" draggable="true">
        <div>{{ item.name }}</div>
      </div>
      <el-button type="primary" @click="handleEditLine">保存</el-button>

    </div>
    <!-- 操作区 -->
    <div id="flowContent">
      <div
        v-for="item in nodeList"
        :id="`${item.nodeId}`"
        :ref="`${item.nodeId}`"
        :key="item.nodeId"
        :style="{
          top: item.y + 'px',
          left: item.x + 'px'
        }"
        class="node-item"
        name="cell"
        @click.stop="editNode(item)"
        @mouseenter="showDelete(item)"
        @mouseleave="hideDelete(item)"
        @mouseup="changeNodeSite(item)"
      >

        <div :id="`drop-${item.nodeId}`" class="node-item-sub-main">{{ item.name }}</div>
        <div :id="`menu-${item.nodeId}`" class="node-item-sub">mebu</div>
        <div class="node-del" @click.stop="deleteNode(item)">
          <i v-if="hoverNode.nodeId==item.nodeId" class="el-icon-circle-close" />
        </div>
      </div>
    </div>
    <!-- 编辑区 -->
    <div class="editContent">
      编辑节点
      <div v-for="(item,key) in selectNode" :key="key">
        <span class="item-label">{{ key }} ：</span>
        {{ item }}
        <el-input v-model="selectNode[key]" :disabled="key=='nodeId'" />
      </div>
      <el-button @click="handleCancelEdit">取消</el-button>
      <el-button type="primary" @click="handleEdit">保存</el-button>
      编辑连线
      <div v-for="(item,key) in selectLine" :key="key">
        <span class="item-label">{{ key }} ：</span>
        {{ item }}
        <el-input v-if="key=='label'" v-model="selectLine[key]" @input="handleEditLineLabel" />
        <el-input v-else v-model="selectLine[key]" :disabled="true" />
      </div>
      <el-button @click="handleCancelEditLine">取消</el-button>
      <el-button type="primary" @click="handleEditLine">保存</el-button>
    </div>

  </div>
</template>

<script>
import { InstanceSetting, NodeSetting } from './config.js'
export default {
  data() {
    return {
      hoverNode: {}, // hover时，显示删除按钮
      selectNode: {},
      cloneNode: {},
      currentConnect: {}, // 线实例，编辑用
      selectLine: {},
      cloneLine: {},
      jsPlumb: null,
      // 是否加载完毕
      loadEasyFlowFinish: false,
      menuList: [
        {
          type: 1,
          name: '起点'
        }
      ],
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
  mounted() {
    this.$nextTick(() => {
      this.initPlumb()
    })
  },
  methods: {
    handleEditLine() {
      // 线的更新，最后一起保存
      console.log(this.jsPlumb.Defaults)
      console.log('线', this.jsPlumb.getConnections())
    },
    deleteNode(item) {
      const { nodeId } = item
      this.nodeList.forEach((item, index) => {
        if (item.nodeId === nodeId) {
          this.nodeList.splice(index, 1)
        }
      })

      this.$nextTick(() => {
        console.log('删除' + nodeId)
        const TPoint = `drop-${nodeId}`
        const FPoint = `menu-${nodeId}`
        this.jsPlumb.removeAllEndpoints(nodeId)
        this.jsPlumb.removeAllEndpoints(TPoint)
        this.jsPlumb.removeAllEndpoints(FPoint)
      })
    },
    // 鼠标进入
    showDelete(item) {
      this.hoverNode = item
    },
    // 鼠标离开
    hideDelete() {
      this.hoverNode = {}
    },
    changeNodeSite(item) {
      const { nodeId } = item
      const dom = this.$refs[nodeId][0] || {}
      const x = dom.offsetLeft
      const y = dom.offsetTop
      console.log(x, y)
      this.nodeList.map(node => {
        if (node.nodeId == nodeId) {
          node.x = x
          node.y = y
          item = node
          if (this.selectNode.nodeId == node.nodeId) {
            this.cloneNode = { ...this.cloneNode, x, y }
          }
          return node
        }
        return node
      })
    },
    handleEdit() {
      this.cloneNode = this.$deepClone({}, this.selectNode)
      console.log(this.cloneNode, this.selectNode)
    },
    handleCancelEdit() {
      const { nodeId } = this.cloneNode || {}
      const cloneNode = this.$deepClone({}, this.cloneNode)
      this.nodeList = this.nodeList.map(item => {
        if (item.nodeId == nodeId) {
          item = cloneNode
          this.selectNode = cloneNode
          return cloneNode
        }
        return item
      })
    },
    // 编辑节点
    editNode(item) {
      // 重复点击同一元素
      if (this.selectNode.nodeId == item.nodeId) return
      console.log(item.nodeId, this.cloneNode, this.selectNode)
      const isSame = this.$objIsEqual(this.cloneNode, this.selectNode)
      if (!isSame) {
        // 编辑元素尚未保存
        this.$confirm('检测到未保存的内容，是否在切换节点前保存修改？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '保存',
          cancelButtonText: '放弃修改'
        })
          .then(() => {
            this.handleEdit()
            this.editNode(item)
            this.$message({
              type: 'info',
              message: '保存修改,并离开当前节点'
            })
          })
          .catch(action => {
            if (action === 'cancel') {
              this.handleCancelEdit()
              this.editNode(item)
            }
            this.$message({
              type: 'info',
              message: action === 'cancel'
                ? '放弃保存,并离开当前节点'
                : '停留在当前节点'
            })
          })
        return
      }
      let selectNode = {}
      this.nodeList.forEach(node => {
        if (node.nodeId == item.nodeId) {
          selectNode = node
        }
      })
      const cloneNode = this.$deepClone({}, selectNode)
      this.$nextTick(function() {
        this.cloneNode = cloneNode
        this.selectNode = selectNode
      })
    },
    // 编辑连线
    editLine(conn) {
      console.log('click', conn)
      const { sourceId, targetId } = conn || {}
      let selectLine = {}
      console.log(sourceId, targetId)
      this.connList.forEach(line => {
        const { sourceNodeId, targetNodeId } = line || {}
        const from = 'menu-' + sourceNodeId
        const to = 'drop-' + targetNodeId
        console.log(from, to)
        if (sourceId == from && targetId == to) {
          selectLine = line
        }
      })
      this.currentConnect = conn
      this.cloneLine = this.$deepClone({}, selectLine)
      this.selectLine = selectLine
    },
    deleLine(conn) {
      this.jsPlumb.deleteConnection(conn)
    },
    addLine(evt) {
      console.log('addLine', this.loadEasyFlowFinish, evt)
      if (this.loadEasyFlowFinish) {
        const { sourceId, targetId } = evt
        this.connList.push({
          sourceNodeId: sourceId.replace('menu-', '').replace('drop-', ''),
          targetNodeId: targetId.replace('drop-', '').replace('menu-', ''),
          label: ''
        })
        console.log(this.connList)
      }
    },
    handleEditLineLabel() {
      const { label } = this.selectLine
      this.currentConnect.setLabel({
        label: label,
        cssClass: `linkLabel`
      })
    },
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
      this.setEnterPoint(`menu-${nodeId}`)
      this.addDraggable(`${nodeId}`)
      this.setExitPoint(`drop-${nodeId}`)
    },
    addDraggable(id) {
      this.jsPlumb.draggable(id, {
        containment: 'parent'
      })
    },
    setEnterPoint(id) {
      const elem = document.getElementById(id)
      const conf = { ...NodeSetting, isTarget: false, isSource: true, maxConnections: -1 }
      this.jsPlumb.addEndpoint(id, {
        anchor: ['Right', 'Left'],
        anchors: ['Right', 'Left'],
        uuid: id + '-in'
      }, conf)
    },
    setExitPoint(id) {
      const elem = document.getElementById(id)
      const conf = { ...NodeSetting, isTarget: true, isSource: false, maxConnections: -1, paintStyle: {
        stroke: '#67c23a',
        fill: '#67c23a'
      }}
      this.jsPlumb.addEndpoint(id, {
        anchor: ['Top'],
        anchors: ['Top'],
        uuid: id + '-out'
      }, conf)
    },
    connectionAll() {
      const ins = this.jsPlumb
      ins.ready(() => { // 入口
      // 导入默认配置
        ins.importDefaults({ ...InstanceSetting,
          Container: 'flowContent' })
        // 完成连线前的校验
        ins.bind('beforeDrop', evt => {
          const res = () => { } // 此处可以添加是否创建连接的校验， 返回 false 则不添加；
          return res
        })
        // 点击线
        ins.bind('click', this.editLine
        )
        ins.bind('click', (conn) => {
          console.log('click--2', conn)
        })
        // ins.unbind('click', this.editLine)
        // 双击线
        ins.bind('dblclick', (conn) => {
          this.deleLine(conn)
        })
        // 连线,监听所有的连接事件
        ins.bind('connection', (evt) => {
          this.addLine(evt)
        })
        // 删除连线
        ins.bind('connectionDetached', (evt) => {
          // this.deleLine(evt)
        })

        for (let i = 0; i < this.connList.length; i++) {
          const conn = this.connList[i]
          const from = 'menu-' + conn.sourceNodeId + '-in'
          const to = 'drop-' + conn.targetNodeId + '-out'
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
          const label = conn.label
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
.demo2{
  display: flex;
  flex-wrap: wrap;
  .point-dot{
    z-index: 1;
  }
  .line-lable{
    background: #fff;
  }
  .flow-menu{
    width: 100%;
    position: relative;
    .menu-item{
      display: inline-block;
      margin-right: 30px;
      cursor: pointer;
    }
  }
  #flowContent{
    width: 50vw;
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
    .node-del{
      position: absolute;
      left: 0;
      top: 0%;
      transform: translate(-50%, -50%);
      color: #333;
      font-size: 30px;
      font-weight: 600;
      cursor: auto;
        &:hover{
          color:red
        }
      }
    .node-item-sub{
      background: #fff;
      color: #333;
      padding: 4px 10px;

    }

    .node-item-sub-main{
      padding: 10px 20px;

    }
    .linkLabel{
      background: rgb(115, 211, 214);
      padding: 4px 10px;
      border: 1px solid #ccc;
      border-radius: 6px;
      text-align: center;
    }
  }
  .editContent{
    width: 40vw;
    font-size: 24px;
    line-height: 40px;
    .item-label{
      display: inline-block;
      min-width: 120px;
      text-align: right;
    }
  }
}

</style>

