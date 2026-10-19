import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envFile = path.resolve(__dirname, '../.env')

let token = process.env.SANITY_TOKEN
if (!token && fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8')
  const match = content.match(/SANITY_TOKEN=([^\r\n]+)/)
  if (match) token = match[1].trim()
}

if (!token) {
  console.error('Error: SANITY_TOKEN not found')
  process.exit(1)
}

const PROJECT_ID = 'ooipgfky'
const DATASET = 'production'
const API_VERSION = 'v2021-10-21'

const mutations = [
  // Profile Document
  {
    createOrReplace: {
      _id: 'profile',
      _type: 'profile',
      name: 'Tasmir Hossain Zihad',
      title: 'Studying CSE @ KUET',
      email: 'tasmirz@tuta.io',
      location: 'Khulna, Bangladesh',
      bio: 'Full-Stack Developer passionate about systems design, low-level architecture, and innovative computing.',
      about: 'I am a Computer Science and Engineering student at KUET passionate about full-stack development, systems design, and AI tooling.',
      aboutDescription: 'Always interested in new opportunities, open-source collaborations, and systems research. Feel free to reach out!',
      social: {
        github: 'https://github.com/tasmirz',
        linkedin: 'https://linkedin.com/in/tasmirz'
      },
      typewriterTexts: [
        'Tasmir Hossain Zihad',
        'Full-Stack Developer',
        'Systems Enthusiast',
        'Problem Solver'
      ]
    }
  },
  // Projects
  {
    createOrReplace: {
      _id: 'project-cse3200',
      _type: 'project',
      name: 'project-3200',
      title: 'Vehicle Telemetry Platform (Project 3200)',
      description: 'Enterprise fleet intelligence & automotive telemetry platform with ESP32 firmware, ThingsBoard MQTT, Apache Kafka, QuestDB, and real-time operations dashboard.',
      languages: ['Go', 'TypeScript', 'Next.js', 'Kafka', 'ESP32', 'QuestDB'],
      imageUrl: 'assets/projects/project-3200-hardware.jpg',
      images: [
        'assets/projects/project-3200-hardware.jpg',
        'assets/projects/project-3200.png',
        'assets/projects/project-3200-arch.png'
      ],
      githubUrl: 'https://github.com/cse3200/root',
      status: 'completed',
      order: 1
    }
  },
  {
    createOrReplace: {
      _id: 'project-jagoo-bahee',
      _type: 'project',
      name: 'jagoo-bahee',
      title: 'jagoo-bahee',
      description: 'High-performance TypeScript utility framework and tooling with over 160 GitHub stars.',
      languages: ['TypeScript', 'Node.js'],
      imageUrl: 'assets/projects/jagoo-bahee.svg',
      githubUrl: 'https://github.com/tasmirz/jagoo-bahee',
      status: 'completed',
      order: 2
    }
  },
  {
    createOrReplace: {
      _id: 'project-computer',
      _type: 'project',
      name: 'Computer',
      title: 'Computer Computer',
      description: 'A 29-bit, 5-stage pipelined RISC computer with dedicated assembler and instruction simulator.',
      languages: ['Jupyter Notebook', 'Verilog', 'Assembly'],
      imageUrl: 'assets/projects/computer.png',
      githubUrl: 'https://github.com/tasmirz/Computer',
      status: 'completed',
      order: 3
    }
  },
  {
    createOrReplace: {
      _id: 'project-terra',
      _type: 'project',
      name: 'Terra',
      title: 'Terra Geospatial Risk Engine',
      description: 'Interactive application synthesizing NASA landslide, real-time precipitation, slope, and terrain datasets to detect hazards.',
      languages: ['JavaScript', 'Leaflet', 'Node.js'],
      imageUrl: 'assets/projects/terra.png',
      githubUrl: 'https://github.com/tasmirz/Terra',
      status: 'completed',
      order: 4
    }
  },
  {
    createOrReplace: {
      _id: 'project-eyewear',
      _type: 'project',
      name: 'EyeWear',
      title: 'EyeWear',
      description: 'Assistive eyewear with optical character recognition and live WebRTC calling for visually impaired users. Identified via RSA challenge.',
      languages: ['Python', 'WebRTC', 'bbOCR'],
      imageUrl: 'assets/projects/eyewear.svg',
      githubUrl: 'https://github.com/tasmirz/EyeWear',
      status: 'completed',
      order: 5
    }
  },
  {
    createOrReplace: {
      _id: 'project-lumina',
      _type: 'project',
      name: 'lumina',
      title: 'lumina',
      description: 'Modern Android EPUB reader built with Kotlin, featuring fluid typography and reflowable rendering.',
      languages: ['Kotlin', 'Android'],
      imageUrl: 'assets/projects/lumina.png',
      githubUrl: 'https://github.com/tasmirz/lumina',
      status: 'completed',
      order: 6
    }
  },
  {
    createOrReplace: {
      _id: 'project-chirkut',
      _type: 'project',
      name: 'Chirkut',
      title: 'Chirkut',
      description: 'End-to-end encrypted anonymous messaging application with zero-knowledge verification.',
      languages: ['Java', 'Cryptography'],
      imageUrl: 'assets/projects/chirkut.svg',
      githubUrl: 'https://github.com/tasmirz/Chirkut',
      status: 'completed',
      order: 7
    }
  },
  // Skill Categories
  {
    createOrReplace: {
      _id: 'skill-languages',
      _type: 'skillCategory',
      name: 'Programming Languages',
      skills: ['C / C++', 'TypeScript', 'JavaScript', 'Python', 'Kotlin', 'Java', 'Assembly'],
      order: 1
    }
  },
  {
    createOrReplace: {
      _id: 'skill-frontend',
      _type: 'skillCategory',
      name: 'Frontend & Visual Computing',
      skills: ['HTML5 & CSS3', 'Gruvbox Styling', 'WebGL & Shaders', 'Vector SVG Art', 'Responsive Design'],
      order: 2
    }
  },
  {
    createOrReplace: {
      _id: 'skill-systems',
      _type: 'skillCategory',
      name: 'Systems & Infrastructure',
      skills: ['Linux (Arch)', 'Git & GitHub', 'Sanity CMS', 'WebRTC', 'Docker', 'Computer Architecture'],
      order: 3
    }
  }
]

async function seed() {
  const url = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/mutate/${DATASET}`
  console.log(`Seeding data to Sanity at ${url}...`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ mutations })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to seed Sanity data:', response.status, errorText)
    process.exit(1)
  }

  const result = await response.json()
  console.log('Successfully seeded data to Sanity!', JSON.stringify(result, null, 2))
}

seed()
