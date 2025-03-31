import type MarkdownIt from 'markdown-it'
import type MarkdownItTabbarOptions from './types/container'
import type Member from './types/member'
import useTabbar from './scripts'

export const render: MarkdownIt.Renderer.RenderRule = (
  tokens: MarkdownIt.Token[],
  idx: number,
  _options: MarkdownIt.Options,
  _env: any,
  _slf: MarkdownIt.Renderer,
) => {
  const token = tokens[idx] as MarkdownIt.Token
  const nesting = token.nesting
  const tag = token.tag
  if (nesting === -1)
    return `</${tag}>`
  const titles = token.meta.titles as string[]
  const classes = titles?.map((title: string) => `markdown-tabbar-${title}`).join(' ')
  if (nesting === 1)
    return `<${tag} class="${classes}">`
  // nesting === 0
  if (token.meta.content)
    return `<${tag} class="${classes}">${token.meta.content}</${tag}>`
  else
    return `<${tag} class="${classes}" />`
}

const MarkdownItTabbar: MarkdownIt.PluginWithOptions<MarkdownItTabbarOptions> = (
  md: MarkdownIt,
  options?: MarkdownItTabbarOptions,
) => {
  const {
    mark = ':',
    min = 3,
    title = '@',
    name = 'tabbar',
  } = options ?? {}

  const tabbar: MarkdownIt.ParserBlock.RuleBlock = (state, startLine, endLine, silent) => {
    if (mark.length !== 1 || min < 1 || name.length < 1) {
      return false
    }

    let auto_closed = false

    let start = state.bMarks[startLine] + state.tShift[startLine]
    let max = state.eMarks[startLine]

    const bRegex = new RegExp(`^(${mark}{${min},})\\s*${name}\\s*$`)

    const line = state.src.slice(start, max)
    const match = line.match(bRegex)
    if (!match) {
      return false
    }
    const count = match[1].length
    if (silent) {
      return true
    }

    let nextLine = startLine
    const eRegex = new RegExp(`^(${mark}{${count}})\\s*$`)
    while (++nextLine < endLine) {
      start = state.bMarks[nextLine] + state.tShift[nextLine]
      max = state.eMarks[nextLine]

      if (start < max && state.sCount[nextLine] < state.blkIndent) {
        break
      }
      if (state.sCount[nextLine] - state.blkIndent >= 4) {
        continue
      }

      const line = state.src.slice(start, max)
      const match = line.match(eRegex)
      if (!match) {
        continue
      }

      auto_closed = true
      break
    }

    const token_o = state.push(`group_open`, 'div', 1)
    token_o.block = true
    token_o.meta = { titles: ['container'] }

    endLine = nextLine
    nextLine = startLine
    const tRegex = new RegExp(`^${title}\\s*(.+)$`)
    const group: Member[] = []
    while (++nextLine < endLine) {
      start = state.bMarks[nextLine] + state.tShift[nextLine]
      max = state.eMarks[nextLine]

      const line = state.src.slice(start, max)
      if (line.trim().length === 0) {
        continue
      }
      const match = line.match(tRegex)
      if (!match) {
        continue
      }
      group.length > 0 && (group[group.length - 1].end = nextLine)
      group.push({
        title: match[1],
        begin: nextLine,
        end: endLine,
      })
    }

    if (group.length > 0) {
      const token_tabs_o = state.push(`tabs_open`, 'div', 1)
      token_tabs_o.block = true
      token_tabs_o.meta = { titles: ['tabs'] }
      for (let i = 0; i < group.length; i++) {
        const member = group[i]
        const titles = ['tab']
        i === 0 && titles.push('active')
        const token_tab_input_o = state.push(`tab`, 'button', 0)
        token_tab_input_o.block = true
        token_tab_input_o.meta = { titles, content: member.title }
      }
      const token_tabs_c = state.push(`tabs_close`, 'div', -1)
      token_tabs_c.block = true

      const token_blocks_o = state.push(`blocks_open`, 'div', 1)
      token_blocks_o.block = true
      token_blocks_o.meta = { titles: ['blocks'] }
      for (let i = 0; i < group.length; i++) {
        const member = group[i]
        const titles = ['block']
        i === 0 && titles.push('active')
        const token_block_o = state.push(`block_open`, 'div', 1)
        token_block_o.block = true
        token_block_o.meta = { titles }
        state.md.block.tokenize(state, member.begin + 1, member.end)
        const token_block_c = state.push(`block_close`, 'div', -1)
        token_block_c.block = true
      }
      const token_blocks_c = state.push(`blocks_close`, 'div', -1)
      token_blocks_c.block = true
    }
    else {
      state.md.block.tokenize(state, startLine + 1, endLine)
    }

    const token_c = state.push(`group_close`, 'div', -1)
    token_c.block = true

    state.line = nextLine + (auto_closed ? 1 : 0)
    return true
  }

  md.block.ruler.before('paragraph', `tabbar`, tabbar)
  md.renderer.rules.group_open = render
  md.renderer.rules.group_close = render

  md.renderer.rules.tabs_open = render
  md.renderer.rules.tabs_close = render
  md.renderer.rules.blocks_open = render
  md.renderer.rules.blocks_close = render

  md.renderer.rules.block_open = render
  md.renderer.rules.block_close = render
  md.renderer.rules.tab = render
}

export { useTabbar }
export default MarkdownItTabbar
