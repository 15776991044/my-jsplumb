export const jsplumbSetting = {
  DragOptions: { cursor: 'pointer' }, // 拖动时鼠标停留在该元素上显示指针，通过css控制
  grid: [10, 10],
  // 动态锚点、位置自适应
  anchor: ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'],
  Container: 'flow',
  // 连线的样式 StateMachine、Flowchart,有四种默认类型：Bezier（贝塞尔曲线），Straight（直线），Flowchart（流程图），State machine（状态机）
  Connector: ['Flowchart', { cornerRadius: 5, alwaysRespectStubs: true, stub: 5 }],
  // 鼠标不能拖动删除线
  ConnectionsDetachable: false,
  // 删除线的时候节点不删除
  DeleteEndpointsOnDetach: false,
  // 连线的端点
  // Endpoint: ["Dot", {radius: 5}],
  Endpoint: [
    'Rectangle',
    {
      height: 10,
      width: 10
    }
  ],
  // 线端点的样式
  EndpointStyle: {
    fill: 'rgba(255,255,255,0)',
    outlineWidth: 1
  },
  LogEnabled: false, // 是否打开jsPlumb的内部日志记录
  // 绘制线
  PaintStyle: {
    stroke: '#409eff',
    strokeWidth: 2
  },
  HoverPaintStyle: { stroke: '#409eff' },
  // 绘制箭头
  Overlays: [
    [
      'Arrow',
      {
        width: 8,
        length: 8,
        location: 1
      }
    ]
  ],
  RenderMode: 'svg'
}
export const endpointStyle = {
  endpoint: 'Dot',
  // 将isSource和isTarget设置为true，可以在拖动时自动创建连接
  isSource: true,
  isTarget: true,
  connector: ['Flowchart', { cornerRadius: 10 }],
  // 默认情况下，maxConnections为1，表示一个端点只能有一条连线。设置为-1，不限制连线数量
  maxConnections: -1,
  // 端点样式
  paintStyle: {
    fill: 'rgba(54,54,54,0)'
  },

  // 鼠标悬浮端点样式
  hoverPaintStyle: {
    fill: 'rgba(64,54,54,0.5)'
  },

  // 拖拽连线样式
  connectorStyle: {
    stroke: 'rgba(54, 61, 63, 0.5)',
    strokeWidth: 3
  },
  connectorHoverStyle: {
    stroke: 'rgba(54, 61, 63, 0.5)',
    strokeWidth: 5
  },

  // 设置箭头
  connectorOverlays: [['Arrow', { width: 10, location: 1, id: 'arrow' }]]

}

// jsplumb连接参数
export const jsplumbConnectOptions = {
  isSource: true,
  isTarget: true,
  // 动态锚点、提供了4个方向 Continuous、AutoDefault
  anchor: ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle']
}

export const jsplumbSourceOptions = {
  filter: '.node-anchor', // 触发连线的区域
  /* "span"表示标签，".className"表示类，"#id"表示元素id*/
  filterExclude: false,
  anchor: ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'],
  allowLoopback: false
}

export const jsplumbTargetOptions = {
  filter: '.node-anchor',
  /* "span"表示标签，".className"表示类，"#id"表示元素id*/
  filterExclude: false,
  anchor: ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'],
  allowLoopback: false
}
