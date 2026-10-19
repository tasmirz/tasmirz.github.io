import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../assets/projects')

// Gruvbox Palettes modeled directly after hackuet.github.io's DieArt system
export const GRUVBOX_HUES = ['gruvDark', 'gruvAqua', 'gruvAmber', 'gruvPurple', 'gruvGreen']

const PALETTES = {
  gruvDark: {
    base: '#282828',
    blocks: ['#3c3836', '#504945', '#665c54', '#7c6f64', '#928374', '#a89984'],
    pad: '#ebdbb2'
  },
  gruvAqua: {
    base: '#1d2021',
    blocks: ['#8ec07c', '#689d6a', '#458588', '#83a598', '#3c3836', '#504945'],
    pad: '#8ec07c'
  },
  gruvAmber: {
    base: '#282828',
    blocks: ['#d79921', '#fabd2f', '#d65d0e', '#fe8019', '#504945', '#665c54'],
    pad: '#fabd2f'
  },
  gruvPurple: {
    base: '#1d2021',
    blocks: ['#b16286', '#d3869b', '#928374', '#7c6f64', '#458588', '#3c3836'],
    pad: '#d3869b'
  },
  gruvGreen: {
    base: '#282828',
    blocks: ['#98971a', '#b8bb26', '#79740e', '#504945', '#665c54', '#8ec07c'],
    pad: '#b8bb26'
  }
}

const W = 600
const H = 360

function mulberry32(seed) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function getNameSeed(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (Math.imul(31, hash) + name.charCodeAt(i)) | 0
  }
  return (Math.abs(hash) % 10000) + 1
}

export function generateDieArtSvg(name, hue = 'gruvDark') {
  const seed = getNameSeed(name)
  const rand = mulberry32(seed * 7919 + 13)
  const palette = PALETTES[hue] || PALETTES.gruvDark
  const { base, pad, blocks: colours } = palette
  const id = `die-${hue}-${seed}`

  const blocks = []

  const split = (x, y, w, h, depth) => {
    const tooSmall = w < 85 || h < 65
    if (depth >= 5 || tooSmall || (depth > 1 && rand() < 0.16)) {
      blocks.push({
        x: x + 2,
        y: y + 2,
        w: w - 4,
        h: h - 4,
        fill: colours[Math.floor(rand() * colours.length)],
        opacity: 0.55 + rand() * 0.45,
        texture: Math.floor(rand() * 4)
      })
      return
    }
    const vertical = w / h > 1.15 ? true : h / w > 1.15 ? false : rand() < 0.5
    const ratio = 0.32 + rand() * 0.36
    if (vertical) {
      const w1 = Math.round(w * ratio)
      split(x, y, w1, h, depth + 1)
      split(x + w1, y, w - w1, h, depth + 1)
    } else {
      const h1 = Math.round(h * ratio)
      split(x, y, w, h1, depth + 1)
      split(x, y + h1, w, h - h1, depth + 1)
    }
  }

  split(28, 28, W - 56, H - 56, 0)

  const pads = []
  for (let x = 34; x <= W - 40; x += 16) {
    if (rand() > 0.12) pads.push({ x, y: 10 })
    if (rand() > 0.12) pads.push({ x, y: H - 17 })
  }
  for (let y = 34; y <= H - 40; y += 16) {
    if (rand() > 0.12) pads.push({ x: 10, y })
    if (rand() > 0.12) pads.push({ x: W - 17, y })
  }

  const padsSvg = pads
    .map(
      (p) =>
        `<rect x="${p.x}" y="${p.y}" width="7" height="7" fill="${pad}" opacity="0.6" rx="1"/>`
    )
    .join('\n    ')

  const blocksSvg = blocks
    .map((b) => {
      const tex =
        b.texture > 0
          ? `\n      <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="2" fill="url(#${id}-${b.texture})" />`
          : ''
      return `    <g>
      <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="2" fill="${b.fill}" opacity="${b.opacity.toFixed(2)}" />${tex}
    </g>`
    })
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <pattern id="${id}-1" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1.3" fill="${base}" opacity="0.38" />
    </pattern>
    <pattern id="${id}-2" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="1.3" height="4" fill="${base}" opacity="0.38" />
    </pattern>
    <pattern id="${id}-3" width="7" height="7" patternUnits="userSpaceOnUse">
      <rect width="3" height="3" fill="${base}" opacity="0.45" />
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${base}" />
  <g class="die-pads">
    ${padsSvg}
  </g>
  <g class="die-blocks">
${blocksSvg}
  </g>
</svg>`
}

// Generate patterns for projects that do not have screenshots
const targetProjects = [
  { file: 'jagoo-bahee.svg', name: 'jagoo-bahee', hue: 'gruvAmber' },
  { file: 'eyewear.svg', name: 'EyeWear', hue: 'gruvAqua' },
  { file: 'lumina.svg', name: 'lumina', hue: 'gruvGreen' },
  { file: 'chirkut.svg', name: 'Chirkut', hue: 'gruvPurple' },
  { file: 'cse3200.svg', name: 'cse3200', hue: 'gruvDark' }
]

targetProjects.forEach((proj) => {
  const svg = generateDieArtSvg(proj.name, proj.hue)
  fs.writeFileSync(path.join(outDir, proj.file), svg, 'utf8')
  console.log(`Generated procedural die pattern: ${proj.file} (${proj.hue})`)
})
