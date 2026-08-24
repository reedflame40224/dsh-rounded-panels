// dsh-rounded-panels —— 浏览器半件（手工工厂束，免构建）。
// 契约：window.__ModuleLoader__.load({ id, factory })；id 必须与 package.json
// 的 name 及 cordis.patch.yml 行名完全一致。factory 的 require 由加载器模块表
// 回答（react 属基线平台模块）；导出标准 Cordis 插件面 { name, inject, apply }。
window.__ModuleLoader__.load({ id: "dsh-rounded-panels", factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
var React = require("react");

var DEFAULTS = { radius: 10, gap: 8 };
var RAIL_TRACK = 56;    // ui-layout SIDEBAR_COLLAPSED：收起后的侧栏轨道宽度
var RAIL_CONTROL = 36;  // rail 图标盒（figma rail 规格）

// 可调状态：内存驻留，刷新回默认；样式表由 apply 生命周期持有。
var state = { radius: DEFAULTS.radius, gap: DEFAULTS.gap };
var styleEl = null;

function buildCss(r, g) {
  // 收起 rail 再居中：rail 把 36px 图标列左锚在 10px 处（为 56px 列设计）；
  // 卡片 margin+border 把列内容盒压到 (56 - g - 2)，两侧重算等量内边距保持居中。
  var railPad = Math.max(0, (RAIL_TRACK - g - 2 - RAIL_CONTROL) / 2);
  return `
/* === dsh-rounded-panels: VS Code 风格悬浮圆角面板 ===
   纯几何：不覆盖任何颜色 token，主题与美化插件保留全部颜色控制权。
   选择器走渲染器官方提供的 [data-slot] 锚点（动态样式的可寻址接缝）。 */

/* 框架：四边外圈缝隙（含侧边栏左侧）。框架是根 Slot 锚点的唯一子元素；
   box-sizing 保持 height:100% 精确，弹性中列吸收 padding；padding-left 与
   侧栏卡片右 margin 相等，拖拽手柄仍骑在视觉卡片边缘上。 */
[data-slot="root"] > div {
  box-sizing: border-box;
  padding: ${g}px;
}

div:has(> [data-slot="sidebar"]) {
  margin-right: ${g}px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: ${r}px;
  /* 历史条的实时锚点：跟随此卡片的视觉右缘（收起/展开/拖动逐帧跟踪）。 */
  anchor-name: --dsh-round-side;
}

/* 收起态 rail：36px 图标列在收窄卡片内重新居中。 */
[data-slot="root"] > div[data-sidebar-collapsed] [data-slot="sidebar"] > div {
  padding-left: ${railPad}px;
  padding-right: ${railPad}px;
}

/* 展开态侧栏：根元素内联宽度锁定为轨道宽 S（该内联宽度是收起动画"冻结
   布局"的机制），卡片内容盒只有 S-g-2，溢出全在右侧被裁剪，满宽内容
   （新会话按钮等）视觉偏右。左移一半溢出量，让两侧 padding 对称裁剪——
   内容本身位于根元素 12px 内边距之内，不会有任何像素被裁。收起/展开
   动画的冻结路径不受此规则影响。 */
[data-slot="root"] > div:not([data-sidebar-collapsed]) [data-slot="sidebar"] > div {
  margin-left: ${-(g + 2) / 2}px;
}

div:has(> [data-slot="conversation"]) {
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: ${r}px;
  /* 美化插件激活时尊重其聊天栏透明度旋钮，否则回落主题底色。 */
  background: var(--dsw-chat-surface, var(--dsw-alias-bg-base));
}

div:has(> [data-slot="details"]) {
  margin-left: ${g}px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: ${r}px;
}

/* 零宽收起详情列：不在右缘画出边框残线。 */
[data-slot="root"] > div[data-details-collapsed] > div:has(> [data-slot="details"]) {
  margin-left: 0;
  border: none;
}

/* 设置对话框：跟随同一个 Radius。借 settings.header 锚点限定，其他弹窗不动。 */
[role="dialog"][aria-modal="true"]:has([data-slot="settings.header"]) {
  border-radius: ${r}px;
}

/* ── 历史条（dsh-client-ui-custom）约束进主表面 ──
   历史条只在挂载时实测一次侧栏宽度（它的 ResizeObserver 盯框架整体尺寸，
   收起/展开不改变框架盒子），内联 left 随之过期。改为钉在侧栏卡片的实时
   右缘：相对 position:relative 的框架绝对定位（其祖先无定位，框架即包含块；
   overflow:hidden 的列都不是包含块，不会裁剪它），anchor() 跟踪，
   !important 盖过过期内联 left。浏览器不支持 anchor() 时整条声明作废，
   退化为原静态行为，不会更糟。 */
[data-slot="details"] [class*="_stripLeft"] {
  position: absolute;
  left: calc(anchor(--dsh-round-side right) + ${g + 12}px) !important;
}

/* 左侧 tooltip 经 portal 落到 body 且 fixed：anchor() 在视口坐标系解析，
   跟踪同一实时边缘（+ 条宽 60 + 间距 8）。 */
[class*="_tooltipLeft"] {
  left: calc(anchor(--dsh-round-side right) + ${g + 80}px) !important;
}

/* 右侧历史条锚在视口右缘：补回外圈缝隙，保持相对主表面右缘的原缩进。 */
[data-slot="details"] [class*="_stripRight"] {
  right: calc(12px + ${g}px);
}
[class*="_tooltip"]:not([class*="_tooltipDot"]):not([class*="_tooltipText"]):not([class*="_tooltipLeft"]) {
  right: calc(64px + ${g}px);
}
`;
}

function applyStyles() {
  if (styleEl === null) {
    styleEl = document.createElement("style");
    styleEl.dataset.plugin = "dsh-rounded-panels";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = buildCss(state.radius, state.gap);
}

function removeStyles() {
  if (styleEl !== null) {
    styleEl.remove();
    styleEl = null;
  }
}

var rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "12px",
  color: "var(--dsw-alias-label-secondary)",
};
var labelStyle = { flex: "none", width: "64px" };
var valueStyle = { flex: "none", width: "42px", textAlign: "right", fontVariantNumeric: "tabular-nums" };

function SliderRow(props) {
  return React.createElement("label", { style: rowStyle },
    React.createElement("span", { style: labelStyle }, props.label),
    React.createElement("input", {
      type: "range", min: 0, max: 24, step: 1, value: props.value,
      style: { flex: "1 1 auto", minWidth: 0, accentColor: "var(--dsw-alias-brand-primary)" },
      onChange: function (e) { props.onChange(Number(e.target.value)); },
    }),
    React.createElement("span", { style: valueStyle }, props.value + " px"),
  );
}

// 通用设置里的一行偏好：自绘标签与说明，右侧两个滑杆 + 重置。
function SettingsRow() {
  var radiusState = React.useState(state.radius);
  var radius = radiusState[0];
  var setRadius = radiusState[1];
  var gapState = React.useState(state.gap);
  var gap = gapState[0];
  var setGap = gapState[1];
  var update = function (nextRadius, nextGap) {
    state.radius = nextRadius;
    state.gap = nextGap;
    applyStyles();
    setRadius(nextRadius);
    setGap(nextGap);
  };
  return React.createElement("div", {
    style: { display: "flex", flexDirection: "column", gap: "8px", padding: "4px 0" },
  },
    React.createElement("div", null, "圆角面板"),
    React.createElement("div", {
      style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary)" },
    }, "侧边栏、主表面与详情列的卡片圆角与缝隙；实时生效。"),
    React.createElement(SliderRow, {
      label: "圆角 Radius", value: radius,
      onChange: function (v) { update(v, gap); },
    }),
    React.createElement(SliderRow, {
      label: "缝隙 Gap", value: gap,
      onChange: function (v) { update(radius, v); },
    }),
    React.createElement("div", { style: { display: "flex", justifyContent: "flex-end" } },
      React.createElement("button", {
        type: "button",
        style: {
          fontSize: "12px", padding: "2px 10px", cursor: "pointer",
          border: "1px solid var(--dsw-alias-border-l1)", borderRadius: "6px",
          background: "transparent", color: "var(--dsw-alias-label-secondary)",
        },
        onClick: function () { update(DEFAULTS.radius, DEFAULTS.gap); },
      }, "重置 10 / 8"),
    ),
  );
}

function apply(ctx) {
  ctx.effect(function () {
    applyStyles();
    return removeStyles;
  }, "dsh-rounded-panels: panel styles");

  ctx.slots.inject("settings.general.item", function () {
    return ctx.slots.register({
      name: "settings.general.item",
      id: "rounded-panels",
      order: 60,
      label: "圆角面板",
    }, SettingsRow);
  });
}

exports.name = "dsh-rounded-panels";
exports.inject = ["slots"];
exports.apply = apply;
return module.exports;
} });
