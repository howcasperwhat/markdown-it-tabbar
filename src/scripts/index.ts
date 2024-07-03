export default function useTabbar() {
  const client = typeof window !== 'undefined'
  if (client) {
    window.addEventListener('click', (e) => {
      const el = e.target as HTMLButtonElement
      if (el.matches('button.markdown-tabbar-tab')) {
        const parent = el.parentElement!
        const root = parent!.parentElement!
        const tabs = parent
        const tabList = Array.from(tabs.children)
        const blocks = root.querySelector('.markdown-tabbar-blocks')!
        const blockList = Array.from(blocks.children)
        const idx = Array.from(parent.children).indexOf(el)
        tabList.forEach((tab, i) => {
          tab.classList.toggle('markdown-tabbar-active', i === idx)
        })
        blockList.forEach((block, i) => {
          block.classList.toggle('markdown-tabbar-active', i === idx)
        })
      }
    })
  }
}
