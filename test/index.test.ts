/// <reference types="vite/client" />

import { describe, expect, it } from 'vitest'
import base from '../styles/base.css?raw'
import markdown from './markdown.css?raw'
import md from './markdown'

describe('index', () => {
  Object.entries(import.meta.glob(
    './input/*.md',
    { query: '?raw', import: 'default', eager: true },
  )).forEach(([path, content]) => {
    it(`render ${path}`, async () => {
      const rendered = [
        md.render(`${content}`),
        '<style>',
        markdown,
        base,
        '</style>',
        '<script type="module">',
        'import { useTabbar } from \'/dist/index.mjs\'',
        'useTabbar()',
        '</script>',
      ].join('\n').trim().replace(/\r\n/g, '\n')
      await expect(rendered)
        .toMatchFileSnapshot(
          path.replace('input', 'output').replace('.md', '.html'),
        )
    })
  })
})
