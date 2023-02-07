<template>
  <div
    ref="node"
    class="node-item"
    @mouseenter="mouseEnter = true"
    @mouseleave="mouseEnter = false"
    @mouseup="changeNodeSite"
    @click.stop="editNode(item)"
  >
    <div class="node-con">{{ node.name }}</div>
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
    }
  },
  data() {
    return {
      mouseEnter: false
    }
  },
  methods: {
    // 删除节点
    deleteNode() {
      this.$emit('deleteNode', this.node.id)
    },
    // 编辑节点
    editNode() {
      this.$emit('editNode', this.node.id)
    },
    // 鼠标移动后抬起
    changeNodeSite() {
      const dom = this.$refs.node
      const x = dom.offsetLeft
      const y = dom.offsetTop
      console.log(x, y)
      this.$emit('changeNodeSite', {
        nodeId: this.node.id,
        x, y
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.node-item{
  line-height: 40px;
  background: #496def;
  position: absolute;
  color: #fff;
  border: 1px solid #ccc;
  border-radius: 10px;
  text-align: center;
  cursor: move;
  width: 100px;
  // user-select: none;
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

