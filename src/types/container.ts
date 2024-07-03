export default interface MarkdownItTabbarOptions {
  // length === 1, default: ':'
  mark?: string
  // >= 1, default: 3
  min?: number
  // titleMark, default: '@'
  title?: string
  // containerName, default: 'tabbar'
  name?: string
}
