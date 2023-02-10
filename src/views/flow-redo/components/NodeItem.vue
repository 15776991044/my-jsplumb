<template>
  <div
    ref="node"
    class="node-item"
    :class="{active:isActive}"
    @mouseenter="mouseEnter = true"
    @mouseleave="mouseEnter = false"
    @mouseup="changeNodeSite"
    @click.stop="editNode()"
  >
    <div class="node-con">{{ node.name }}</div>
    {{ node.x }}/{{ node.y }}
    <div class="node-del" @click.stop="deleteNode">
      <i v-if="mouseEnter" class="el-icon-circle-close" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    node: {
      type: Object,
      default() { return {} }
    },
    selectNode: {
      type: Object,
      default() { return {} }
    }
  },
  data() {
    return {
      mouseEnter: false
    }
  },
  computed: {
    isActive() {
      return this.node.nodeId == this.selectNode.nodeId
    }
  },
  methods: {
    getCruTemp() {
      const dom = this.$refs.node
      const x = dom.offsetLeft
      const y = dom.offsetTop
      return {
        nodeId: this.node.nodeId, x, y
      }
    },
    // 删除节点
    deleteNode() {
      this.$emit('deleteNode', this.getCruTemp())
    },
    // 编辑节点
    editNode() {
      this.$emit('editNode', this.getCruTemp())
    },
    // 鼠标移动后抬起
    changeNodeSite() {
      this.$emit('changeNodeSite', this.getCruTemp())
    }
  }
}
</script>

<style lang="scss" scoped>
.node-item{
  padding:12px 10px;
  line-height: 24px;
  background: #496def;
  position: absolute;
  color: #fff;
  border: 1px solid #ccc;
  border-radius: 10px;
  text-align: center;
  cursor: move;
  width: 100px;
  user-select: none;
  word-break: break-all;
  &.active{
    background: #e6a23c;
  }
}
.node-con{
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
.linkLabel{
  background: rgb(115, 211, 214);
  padding: 4px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  text-align: center;
}

</style>

