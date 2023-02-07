<template>
  <div class="demo3">
    <ToolsMenu ref="ToolsMenu" class="tools-menu" />
    <DrawArea ref="DrawArea" class="draw-area" />
    <AttrPanel ref="AttrPanel" class="attr-panel" />
  </div>
</template>

<script>
import ToolsMenu from './components/ToolsMenu.vue'
import DrawArea from './components/DrawArea.vue'
import AttrPanel from './components/AttrPanel.vue'
export default {
  components: { ToolsMenu, DrawArea, AttrPanel },
  data() {
    return {

    }
  }
}
</script>
<style scoped>
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
</style>
