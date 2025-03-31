import MarkdownIt from 'markdown-it'
// eslint-disable-next-line antfu/no-import-dist
import MarkdownItTabbar from '../dist'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  xhtmlOut: true,
})

md.use(MarkdownItTabbar)

export default md
