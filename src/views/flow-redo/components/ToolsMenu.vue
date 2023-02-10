<template>
  <div>
    <div class="tool-card">
      <div class="card-header">工具箱</div>
      <div class="card-body">
        <slot />
      </div>
    </div>
    <div class="tool-card">
      <div class="card-header">节点</div>
      <div class="card-body">
        <div v-for="(item,index) in nodeList" :key="index" draggable="true" class="tool-item" :class="[activeMenu.type==item.type?'active':'']" @dragstart="drag(item)">
          <div class="node-item" :class="[item.class]" />
          <div>{{ item.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    activeMenu: {
      type: Object,
      default() { return {} }
    }
  },
  data() {
    return {
      nodeList: [{
        class: 'is-start',
        img: '',
        icon: '',
        title: '开始',
        type: '1'
      }, {
        class: 'is-step',
        img: '',
        icon: '',
        title: '过程',
        type: '3'
      }]
    }
  },
  methods: {
    drag(item) {
      this.$emit('setDragMenu', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.tool-card{
  margin: 10px;
  background-color: #F2F2F2;
  border-radius: 2px;
  box-shadow: 0 1px 2px 0 rgba(0 ,0, 0 , 5%);
  user-select: none;
}
.card-header{
  height: 42px;
  line-height: 42px;
  padding: 0 15px;
  border-bottom: 1px solid #f6f6f6;
  color: #333;
  border-radius: 2px 2px 0 0;
  font-size: 14px;
}
.card-body{
  display: flex;
  flex-wrap: wrap;
}
.tool-item{
  width:50%;
  box-sizing: border-box;
  padding: 5px;
  width: 50%;
  cursor: pointer;
  text-align: center;
  display: inline-block;
  &.active{
    color: #409eff;
  }
}
.tool-item-icon{
  font-size: 50px;
}
.node-item{
  border: 2px solid #40AFFE;
  height: 30px;
  cursor: move;
  text-align: center;
  z-index: 26;
  line-height: 30px;

}

</style>
