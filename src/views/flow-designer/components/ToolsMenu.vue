<template>
  <div>
    <div class="tool-card">
      <div class="card-header">工具箱</div>
      <div class="card-body">
        <div class="tool-item">
          <div class="tool-item-icon" title="鼠标工具"><i class="el-icon-rank " /></div>
        </div>
        <div>
          <i class="el-icon-sort tool-item-icon" title="连线工具" />
        </div>
      </div>
    </div>
    <div class="tool-card">
      <div class="card-header">节点</div>
      <div v-for="(item,index) in nodeList" :key="index" class="card-body">
        <div class="tool-item">
          <div class="tool-item-icon" :title="item.title"><i class="el-icon-rank " /></div>
        </div>
        <div>
          <i class="el-icon-sort tool-item-icon" title="连线工具" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nodeList: [{
        class: '',
        img: '',
        icon: '',
        title: '开始',
        type: ''
      }]
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
}
.tool-item-icon{
  font-size: 50px;
}
</style>
