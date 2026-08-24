// dsh-rounded-panels —— 宿主侧（Node）半件。
// 本插件的全部能力都在浏览器半件（lib/client.js）；宿主行只需要一个可被
// Loader 导入的空挂载点，让名录行存在于组合树中，供 client-modules 扫描到
// 包清单里的 dsh.client 声明并把 /plugins/dsh-rounded-panels/client.js
// 喂给浏览器。

export const name = 'dsh-rounded-panels'

export function apply() {
  // 无宿主侧能力：纯客户端样式与设置行。
}
