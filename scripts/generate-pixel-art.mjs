import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../assets/projects')

// 16-Bit Dither Patterns (Bayer 4x4 matrix & 2x2 checkerboard in Gruvbox palette)
function createSvgWrapper(content, width = 600, height = 360) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" shape-rendering="crispEdges">
  <defs>
    <!-- Bayer 2x2 Checkerboard 50% -->
    <pattern id="dither-50" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="2" height="2" fill="#3c3836" />
      <rect x="2" y="2" width="2" height="2" fill="#3c3836" />
    </pattern>
    <!-- Light Dither 25% -->
    <pattern id="dither-25" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="2" height="2" fill="#504945" />
    </pattern>
    <!-- Green Accent Dither 50% -->
    <pattern id="dither-green" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="2" height="2" fill="#b8bb26" opacity="0.4" />
      <rect x="2" y="2" width="2" height="2" fill="#b8bb26" opacity="0.4" />
    </pattern>
    <!-- Amber Accent Dither 50% -->
    <pattern id="dither-amber" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="2" height="2" fill="#fabd2f" opacity="0.4" />
      <rect x="2" y="2" width="2" height="2" fill="#fabd2f" opacity="0.4" />
    </pattern>
    <!-- Aqua Accent Dither 50% -->
    <pattern id="dither-aqua" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="2" height="2" fill="#8ec07c" opacity="0.4" />
      <rect x="2" y="2" width="2" height="2" fill="#8ec07c" opacity="0.4" />
    </pattern>
    <!-- Purple Accent Dither 50% -->
    <pattern id="dither-purple" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="2" height="2" fill="#d3869b" opacity="0.4" />
      <rect x="2" y="2" width="2" height="2" fill="#d3869b" opacity="0.4" />
    </pattern>
    <!-- Pixel CRT Scanline filter -->
    <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="4" height="1" fill="#1d2021" opacity="0.3" />
    </pattern>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="${width}" height="${height}" fill="#282828" />

  ${content}

  <!-- Scanlines overlay -->
  <rect width="${width}" height="${height}" fill="url(#scanlines)" pointer-events="none" />
  <!-- Pixel Frame Border -->
  <rect x="8" y="8" width="${width - 16}" height="${height - 16}" fill="none" stroke="#3c3836" stroke-width="4" />
  <rect x="14" y="14" width="${width - 28}" height="${height - 28}" fill="none" stroke="#504945" stroke-width="2" />
</svg>`
}

// 1. jagoo-bahee: 16-Bit Isometric Data Tower & Retro Pulse Matrix
const jagooSvg = createSvgWrapper(`
  <!-- Dither Ground Plane -->
  <rect x="20" y="20" width="560" height="320" fill="url(#dither-50)" />
  
  <!-- Isometric Grid Base Lines -->
  <g stroke="#504945" stroke-width="2">
    ${Array.from({ length: 9 }).map((_, i) => `<line x1="${80 + i * 50}" y1="60" x2="${80 + i * 50}" y2="300" stroke-dasharray="4,8" />`).join('\n    ')}
    ${Array.from({ length: 7 }).map((_, i) => `<line x1="80" y1="${80 + i * 35}" x2="520" y2="${80 + i * 35}" stroke-dasharray="4,8" />`).join('\n    ')}
  </g>

  <!-- Isometric Pixel Towers (16-bit blocks) -->
  <!-- Tower 1 Left -->
  <g transform="translate(140, 110)">
    <polygon points="40,0 80,20 40,40 0,20" fill="#fabd2f" />
    <polygon points="0,20 40,40 40,110 0,90" fill="#d79921" />
    <polygon points="40,40 80,20 80,90 40,110" fill="#b57614" />
    <polygon points="0,20 40,40 40,110 0,90" fill="url(#dither-amber)" />
  </g>
  <!-- Tower 2 Center (Main High Tower) -->
  <g transform="translate(260, 60)">
    <polygon points="40,0 80,20 40,40 0,20" fill="#ebdbb2" />
    <polygon points="0,20 40,40 40,160 0,140" fill="#928374" />
    <polygon points="40,40 80,20 80,140 40,160" fill="#7c6f64" />
    <polygon points="0,20 40,40 40,160 0,140" fill="url(#dither-50)" />
    <!-- Pixel window slits -->
    <rect x="12" y="50" width="16" height="6" fill="#fabd2f" />
    <rect x="12" y="75" width="16" height="6" fill="#8ec07c" />
    <rect x="12" y="100" width="16" height="6" fill="#b8bb26" />
    <rect x="52" y="50" width="16" height="6" fill="#fabd2f" />
    <rect x="52" y="75" width="16" height="6" fill="#8ec07c" />
    <rect x="52" y="100" width="16" height="6" fill="#b8bb26" />
  </g>
  <!-- Tower 3 Right -->
  <g transform="translate(380, 130)">
    <polygon points="40,0 80,20 40,40 0,20" fill="#8ec07c" />
    <polygon points="0,20 40,40 40,90 0,70" fill="#689d6a" />
    <polygon points="40,40 80,20 80,70 40,90" fill="#427b58" />
    <polygon points="0,20 40,40 40,90 0,70" fill="url(#dither-aqua)" />
  </g>

  <!-- Pixel Conduit Buses -->
  <path d="M 180 180 L 260 220 L 380 200" fill="none" stroke="#fabd2f" stroke-width="4" stroke-dasharray="8,4" />
  <circle cx="180" cy="180" r="6" fill="#fabd2f" />
  <circle cx="260" cy="220" r="6" fill="#ebdbb2" />
  <circle cx="380" cy="200" r="6" fill="#8ec07c" />

  <!-- Pixel Badges -->
  <rect x="40" y="36" width="140" height="24" fill="#1d2021" stroke="#3c3836" stroke-width="2" />
  <text x="50" y="52" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#fabd2f">JAGOO-BAHEE // 16B</text>
`)

// 2. EyeWear: 16-Bit Cyber-Visor & Dithered OCR Scan Beam
const eyewearSvg = createSvgWrapper(`
  <rect x="20" y="20" width="560" height="320" fill="url(#dither-50)" />
  
  <!-- Retro Cyber Visor Frame -->
  <g transform="translate(110, 85)">
    <!-- Visor Shell -->
    <polygon points="20,0 360,0 380,20 380,100 360,120 20,120 0,100 0,20" fill="#1d2021" stroke="#504945" stroke-width="4" />
    
    <!-- Left Lens Screen with Dither -->
    <rect x="25" y="25" width="150" height="70" fill="#282828" stroke="#8ec07c" stroke-width="2" />
    <rect x="25" y="25" width="150" height="70" fill="url(#dither-aqua)" />
    
    <!-- Right Lens Screen with Dither -->
    <rect x="205" y="25" width="150" height="70" fill="#282828" stroke="#8ec07c" stroke-width="2" />
    <rect x="205" y="25" width="150" height="70" fill="url(#dither-aqua)" />

    <!-- OCR Pixel Crosshair In Left Screen -->
    <g transform="translate(60, 40)">
      <rect x="0" y="18" width="12" height="4" fill="#fabd2f" />
      <rect x="36" y="18" width="12" height="4" fill="#fabd2f" />
      <rect x="22" y="0" width="4" height="12" fill="#fabd2f" />
      <rect x="22" y="28" width="4" height="12" fill="#fabd2f" />
      <rect x="20" y="18" width="8" height="4" fill="#fb4934" />
    </g>
    <!-- Pixel OCR Text Blocks -->
    <rect x="110" y="45" width="50" height="6" fill="#ebdbb2" />
    <rect x="110" y="57" width="38" height="6" fill="#a89984" />
    <rect x="110" y="69" width="44" height="6" fill="#ebdbb2" />

    <!-- WebRTC Pixel Sine Wave In Right Screen -->
    <path d="M 220 60 H 240 L 250 40 L 260 80 L 270 45 L 280 75 L 290 60 H 340" fill="none" stroke="#fabd2f" stroke-width="4" />
  </g>

  <!-- HUD Status Bar -->
  <rect x="40" y="36" width="150" height="24" fill="#1d2021" stroke="#3c3836" stroke-width="2" />
  <text x="50" y="52" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#8ec07c">EYEWEAR // HUD-V01</text>
  
  <rect x="430" y="36" width="130" height="24" fill="#1d2021" stroke="#3c3836" stroke-width="2" />
  <text x="442" y="52" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#fb4934">● LIVE REC</text>
`)

// 3. lumina: 16-Bit Pixel Reader Grimoire with Dithered Illumination
const luminaSvg = createSvgWrapper(`
  <rect x="20" y="20" width="560" height="320" fill="url(#dither-50)" />

  <!-- Open Pixel Grimoire / Book -->
  <g transform="translate(150, 75)">
    <!-- Book Drop Shadow -->
    <rect x="10" y="10" width="280" height="170" fill="#1d2021" />

    <!-- Left Page -->
    <rect x="0" y="0" width="140" height="160" fill="#ebdbb2" stroke="#3c3836" stroke-width="3" />
    <rect x="0" y="0" width="140" height="160" fill="url(#dither-green)" />
    
    <!-- Left Page Text Pixels -->
    ${Array.from({ length: 7 }).map((_, i) => `<rect x="20" y="${30 + i * 16}" width="${70 + (i % 3) * 15}" height="6" fill="#504945" />`).join('\n    ')}

    <!-- Spine -->
    <rect x="135" y="0" width="10" height="160" fill="#7c6f64" />
    <!-- Ribbon Bookmark -->
    <polygon points="137,0 143,0 143,180 140,170 137,180" fill="#d6395b" />

    <!-- Right Page -->
    <rect x="140" y="0" width="140" height="160" fill="#fbf1c7" stroke="#3c3836" stroke-width="3" />
    <rect x="140" y="0" width="140" height="160" fill="url(#dither-amber)" />

    <!-- Right Page Text Pixels & Chapter Header -->
    <rect x="160" y="25" width="40" height="12" fill="#b8bb26" />
    ${Array.from({ length: 6 }).map((_, i) => `<rect x="160" y="${50 + i * 16}" width="${65 + ((i * 2) % 4) * 12}" height="6" fill="#504945" />`).join('\n    ')}
  </g>

  <!-- Floating 16-bit Pixel Sparkles / Runes -->
  <g fill="#fabd2f">
    <rect x="110" y="90" width="8" height="8" />
    <rect x="114" y="82" width="8" height="8" />
    <rect x="118" y="98" width="8" height="8" />

    <rect x="460" y="110" width="8" height="8" fill="#8ec07c" />
    <rect x="466" y="102" width="8" height="8" fill="#8ec07c" />
    <rect x="472" y="118" width="8" height="8" fill="#8ec07c" />
  </g>

  <!-- Header Badge -->
  <rect x="40" y="36" width="130" height="24" fill="#1d2021" stroke="#3c3836" stroke-width="2" />
  <text x="50" y="52" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#b8bb26">LUMINA // EPUB</text>
`)

// 4. Chirkut: 16-Bit Pixel Cipher Padlock & Dithered Shackle
const chirkutSvg = createSvgWrapper(`
  <rect x="20" y="20" width="560" height="320" fill="url(#dither-50)" />

  <g transform="translate(210, 60)">
    <!-- Padlock Shackle -->
    <path d="M 40 90 V 40 C 40 10 140 10 140 40 V 90" fill="none" stroke="#7c6f64" stroke-width="24" stroke-linecap="square" />
    <path d="M 40 90 V 40 C 40 10 140 10 140 40 V 90" fill="none" stroke="#ebdbb2" stroke-width="12" stroke-linecap="square" />
    <path d="M 40 90 V 40 C 40 10 140 10 140 40 V 90" fill="none" stroke="url(#dither-50)" stroke-width="12" stroke-linecap="square" />

    <!-- Padlock Main Body -->
    <rect x="10" y="80" width="160" height="130" rx="8" fill="#32302f" stroke="#504945" stroke-width="4" />
    <rect x="10" y="80" width="160" height="130" rx="8" fill="url(#dither-purple)" />

    <!-- Pixel Keyhole -->
    <g transform="translate(75, 120)">
      <circle cx="15" cy="15" r="14" fill="#1d2021" stroke="#d3869b" stroke-width="3" />
      <polygon points="12,25 18,25 21,45 9,45" fill="#1d2021" stroke="#d3869b" stroke-width="3" />
      <rect x="13" y="13" width="4" height="20" fill="#fabd2f" />
    </g>
  </g>

  <!-- Binary Data Strings Floating -->
  <g font-family="'Courier New', monospace" font-size="12" fill="#a89984" opacity="0.7">
    <text x="60" y="130">01000101 00110010</text>
    <text x="60" y="160">01000101 01000001</text>
    <text x="60" y="190">01010011 01000101</text>

    <text x="430" y="130">AES-256-GCM</text>
    <text x="430" y="160">E2EE // SHA</text>
    <text x="430" y="190">ZERO-KNOWLEDGE</text>
  </g>

  <rect x="40" y="36" width="140" height="24" fill="#1d2021" stroke="#3c3836" stroke-width="2" />
  <text x="50" y="52" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#d3869b">CHIRKUT // CRYPTO</text>
`)

// 5. cse3200: 16-Bit Retro Motherboard & Socket Architecture
const cse3200Svg = createSvgWrapper(`
  <rect x="20" y="20" width="560" height="320" fill="url(#dither-50)" />

  <!-- Green PCB Dither Base -->
  <rect x="40" y="40" width="520" height="280" fill="#1d2021" stroke="#3c3836" stroke-width="3" />
  <rect x="40" y="40" width="520" height="280" fill="url(#dither-green)" />

  <!-- Motherboard Traces in Gruvbox Copper/Amber -->
  <g stroke="#d79921" stroke-width="3" fill="none">
    <path d="M 60 80 H 180 L 220 120 H 250" />
    <path d="M 60 120 H 160 L 200 160 H 250" />
    <path d="M 60 160 H 250" />
    <path d="M 60 200 H 170 L 210 170 H 250" />
    <path d="M 60 240 H 190 L 230 180 H 250" />

    <path d="M 350 120 H 380 L 420 80 H 540" />
    <path d="M 350 160 H 540" />
    <path d="M 350 180 H 390 L 430 240 H 540" />
  </g>

  <!-- Gold Pixel Solder Pads -->
  <g fill="#fabd2f">
    <rect x="56" y="76" width="8" height="8" />
    <rect x="56" y="116" width="8" height="8" />
    <rect x="56" y="156" width="8" height="8" />
    <rect x="56" y="196" width="8" height="8" />
    <rect x="56" y="236" width="8" height="8" />

    <rect x="536" y="76" width="8" height="8" />
    <rect x="536" y="156" width="8" height="8" />
    <rect x="536" y="236" width="8" height="8" />
  </g>

  <!-- CPU Socket (Center Package) -->
  <g transform="translate(245, 110)">
    <rect x="0" y="0" width="110" height="110" fill="#32302f" stroke="#7c6f64" stroke-width="4" />
    <rect x="0" y="0" width="110" height="110" fill="url(#dither-50)" />
    <!-- Die core -->
    <rect x="25" y="25" width="60" height="60" fill="#282828" stroke="#8ec07c" stroke-width="2" />
    <text x="55" y="60" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#8ec07c" text-anchor="middle">CSE-3200</text>
    <text x="55" y="75" font-family="'Courier New', monospace" font-size="10" fill="#a89984" text-anchor="middle">SYS // LAB</text>
  </g>

  <!-- Header Badge -->
  <rect x="50" y="50" width="150" height="24" fill="#1d2021" stroke="#3c3836" stroke-width="2" />
  <text x="60" y="66" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#fabd2f">CSE3200 // OS-CORE</text>
`)

fs.writeFileSync(path.join(outDir, 'jagoo-bahee.svg'), jagooSvg, 'utf8')
fs.writeFileSync(path.join(outDir, 'eyewear.svg'), eyewearSvg, 'utf8')
fs.writeFileSync(path.join(outDir, 'lumina.svg'), luminaSvg, 'utf8')
fs.writeFileSync(path.join(outDir, 'chirkut.svg'), chirkutSvg, 'utf8')
fs.writeFileSync(path.join(outDir, 'cse3200.svg'), cse3200Svg, 'utf8')

console.log('Successfully generated retro 16-bit dithered pixel art SVGs!')
