import MarkdownIt from 'markdown-it'
import MarkdownItTabbar from '../dist'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  xhtmlOut: true,
})

md.use(MarkdownItTabbar)

export default md
