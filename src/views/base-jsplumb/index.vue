<template>
  <div>
    base-jsplum
    <!-- 菜单 -->
    <div class="flow-menu">
      <div v-for="(item,index) in menuList" :key="index" class="menu-item" draggable="true">
        <div>{{ item.name }}</div>
      </div>
    </div>
    <!-- 操作区 -->
    <div class="flow-detail">
      <div
        id="flowContent"
        ref="flowContent"
        @drop="drop($event)"
        @dragover="allowDrop($event)"
      >
        <div ref="node1" class="node1" draggable="true">www</div>
        <div id="item_left" class="item" />
        <div id="item_right" class="item" style="margin-left:50px;" />
      </div>
    </div>
  </div>
</template>

<script>
import { jsPlumb } from 'jsplumb'
export default {
  data() {
    return {
      currentItem: {},
      menuList: [
        {
          type: 1,
          name: '起点'
        }
      ],
      jsPlumb: null
    }
  },
  mounted() {
    this.jsPlumb = jsPlumb.getInstance()
    this.$nextTick(() => {
      this.initPlumb()
    })
  },
  methods: {
    initPlumb() {
      this.jsPlumb.ready(function() {
        this.jsPlumb.connect({
          source: 'item_left',
          target: 'item_right',
          endpoint: 'Dot'
        })
      })
    },
    drop(event) {
      // event.preventDefault();
      // const _obj = this.$refs.flowContent
      // debugger
      var temp = {
        id: this.getUUID(),
        label: this.currentItem.name,
        top: event.offsetY + 'px',
        left: event.offsetX + 'px',
        Type: this.currentItem.type
      }
      // debugger
      console.log('temp', temp)
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
    }
  }
}
</script>

<style lang="scss" scoped>
.flow-detail{
  height: 40vh;
  margin: 4vh 2vw;
  border: 1px solid #333;
  box-sizing: border-box;
  #flowContent {
    width: 100%;
    height: 100%;
    position: relative;
  }
}

</style>
