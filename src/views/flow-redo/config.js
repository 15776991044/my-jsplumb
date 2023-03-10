const connType = ['Flowchart', { gap: 10, cornerRadius: 15, alwaysRespectStubs: true }]
export const InstanceSetting = {
  Anchor: ['Bottom', 'Top', 'Left', 'Right'], // 端点的定位点的位置声明（锚点）：left，top，bottom
  anchors: ['Bottom', 'Top', 'Left', 'Right'], // 端点的定位点的位置声明（锚点）：left，top，bottom
  ConnectionsDetachable: false, // 连线是否可用鼠标分离
  Endpoint: 'Dot',
  // Endpoints: [null, null],
  // EndpointOverlays: [],
  EndpointStyle: { fill: 'transparent', stroke: '#1565C0', radius: 4, strokeWidth: 1 },
  MaxConnections: -1,
  Connector: connType
}
// 基本连接线样式
export const connectorPaintStyle = {
  strokeWidth: 4,
  stroke: '#61B7CF',
  joinstyle: 'round',
  fill: 'transparent',
  outlineColor: '#333',
  outlineWidth: 10,
  // outlineStroke: '#FCFD3C',
  outlineStroke: 'transparent'
}

// 鼠标悬浮在连接线上的样式
const connectorHoverStyle = {
  stroke: 'red'
}
export const NodeSetting = {
  endpoint: ['Dot', {
    cssClass: 'point-dot',
    radius: 8,
    fill: 'pink'
  }], // 端点的形状
  connectorStyle: connectorPaintStyle, // 连接线的颜色，大小样式
  connectorHoverStyle: connectorHoverStyle,
  paintStyle: {
    stroke: 'pink',
    // strokeWidth: 2,
    fill: 'pink'
    // radius: 6
  },
  // 端点的颜色样式
  hoverPaintStyle: { fill: 'blue' },
  connector: connType, // 设置连线样式
  maxConnections: -1, // 设置连接点最多可以连接几条线
  connectorOverlays: [
    ['Arrow', {
      width: 10,
      length: 10,
      location: 1
    }],
    ['Label', {
      label: '',
      cssClass: 'line-lable',
      labelStyle: {
        color: 'red',
        font: '20px'
      },
      events: {
        click: function(labelOverlay, originalEvent) {
          console.log('click on label overlay for :' + labelOverlay.component)
          console.log(labelOverlay)
          console.log(originalEvent)
        }
      }
    }]
  ]
}

export function getUUID() {
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
