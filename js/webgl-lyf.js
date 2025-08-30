import WebGLContext from './webgl-core.js'

export default class WebGLLyf {
	static #instance
	path = [
		{
			x: -1.37,
			y: 0.38
		},
		{
			x: -1.354,
			y: 0.1559999999999998
		},
		{
			x: -1.164,
			y: 0.11399999999999977
		},
		{
			x: -1.0459999999999998,
			y: 0.17199999999999982
		},
		{
			x: -0.9199999999999997,
			y: 0.11999999999999977
		},
		{
			x: -0.8079999999999996,
			y: 0.08199999999999974
		},
		{
			x: -0.6739999999999995,
			y: 0.07199999999999973
		},
		{
			x: -0.4579999999999993,
			y: 0.11399999999999977
		},
		{
			x: -0.19399999999999906,
			y: 0.1539999999999998
		},
		{
			x: 0.15200000000000122,
			y: 0.12399999999999978
		},
		{
			x: 0.2720000000000013,
			y: -0.06800000000000037
		},
		{
			x: 0.3720000000000014,
			y: -0.3860000000000006
		},
		{
			x: 0.3880000000000014,
			y: -0.6160000000000008
		},
		{
			x: 0.3820000000000014,
			y: -0.838000000000001
		}
	]

	constructor() {
		if (WebGLLyf.#instance) return WebGLLyf.#instance

		this.context = null
		this.program = null
		this.texture = null
		this.startTime = performance.now() / 1000

		// Game state
		this.worldOffset = { x: -1.37, y: 0.38 }
		this.moveSpeed = 0.002
		this.keys = { w: false, a: false, s: false, d: false }
		this.scrollProgress = 0 // 0 to 1, controls position along path
		this.isScrollLocked = false
		this.isManualControl = false
		this.canvasInView = false

		WebGLLyf.#instance = this
	}

	static getInstance() {
		return WebGLLyf.#instance || new WebGLLyf()
	}

	async init() {
		try {
			const container = document.querySelector('.lyf-canvas-container')
			if (!container) throw new Error('Canvas container not found')

			this.context = new WebGLContext(container)
			this.program = await this.context.createProgram(
				'lyf',
				'./shaders/lyf.vert',
				'./shaders/lyf.frag'
			)

			await this.loadTexture()
			this.setupQuad()
			this.setupControls()
			this.setupScrollLock()
			this.startRenderLoop()
		} catch (error) {
			console.warn('WebGL Lyf failed:', error)
		}
	}

	async loadTexture() {
		const image = new Image()
		return new Promise((resolve, reject) => {
			image.onload = () => {
				this.texture = this.context.createTexture(image)
				resolve()
			}
			image.onerror = () => reject(new Error('Failed to load lyf.png'))
			image.src = './assets/lyf.png'
		})
	}

	setupQuad() {
		const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
		const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])

		this.program.passAttrib([
			['a_position', positions, 2],
			['a_texCoord', texCoords, 2]
		])
	}

	setupControls() {
		// Keyboard controls
		document.addEventListener('keydown', (e) => {
			const key = e.key.toLowerCase()
			if (key in this.keys) {
				this.keys[key] = true
				this.isManualControl = true // Switch to manual control
				this.lockGlobalScroll() // Ensure scroll is locked
				e.preventDefault()
			}
		})

		document.addEventListener('keyup', (e) => {
			const key = e.key.toLowerCase()
			if (key in this.keys) {
				this.keys[key] = false
				const anyKeyPressed = Object.values(this.keys).some(
					(pressed) => pressed
				)
				if (!anyKeyPressed) {
					this.isManualControl = false
				}
				e.preventDefault()
			}
		})

		document.addEventListener(
			'wheel',
			(e) => {
				if (this.isManualControl || !this.canvasInView) return

				const delta = e.deltaY > 0 ? 0.02 : -0.02
				const newProgress = Math.max(
					0,
					Math.min(1, this.scrollProgress + delta)
				)

				if (this.scrollProgress > 0 && this.scrollProgress < 1) {
					e.preventDefault()
					this.scrollProgress = newProgress
					this.lockGlobalScroll()
				} else if (newProgress > 0 && newProgress < 1) {
					e.preventDefault()
					this.scrollProgress = newProgress
					this.lockGlobalScroll()
				} else {
					this.unlockGlobalScroll()
				}
			},
			{ passive: false }
		)

		// Mobile controls
		document.querySelectorAll('.lyf-dpad-button').forEach((btn) => {
			const key = btn.dataset.key

			btn.addEventListener('touchstart', (e) => {
				e.preventDefault()
				this.keys[key] = true
				this.isManualControl = true // Switch to manual control
				this.lockGlobalScroll() // Ensure scroll is locked
			})

			btn.addEventListener('touchend', (e) => {
				e.preventDefault()
				this.keys[key] = false
				const anyKeyPressed = Object.values(this.keys).some(
					(pressed) => pressed
				)
				if (!anyKeyPressed) {
					this.isManualControl = false
				}
			})
		})

		const actionBtn = document.querySelector('.lyf-action-button')
		if (actionBtn) {
			actionBtn.addEventListener('touchstart', () => {
				this.scrollProgress = 0
				this.isManualControl = false
				this.worldOffset = { x: this.path[0].x, y: this.path[0].y }
			})
		}
	}

	setupScrollLock() {
		const lyfSection = document.querySelector('#lyf')
		if (!lyfSection) return

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					this.canvasInView = entry.isIntersecting

					if (!this.isManualControl) {
						if (entry.isIntersecting) {
							if (this.scrollProgress > 0 && this.scrollProgress < 1) {
								this.lockGlobalScroll()
							}
						} else {
							this.unlockGlobalScroll()
						}
					}
				})
			},
			{ threshold: 0.6 }
		)

		observer.observe(lyfSection)
	}

	lockGlobalScroll() {
		if (this.isScrollLocked) return
		this.isScrollLocked = true
		document.body.style.overflow = 'hidden'
		document.documentElement.style.overflow = 'hidden'
	}

	unlockGlobalScroll() {
		if (!this.isScrollLocked) return
		this.isScrollLocked = false
		document.body.style.overflow = ''
		document.documentElement.style.overflow = ''
	}

	updateMovement() {
		if (this.keys.w) this.worldOffset.y += this.moveSpeed
		if (this.keys.s) this.worldOffset.y -= this.moveSpeed
		if (this.keys.a) this.worldOffset.x -= this.moveSpeed
		if (this.keys.d) this.worldOffset.x += this.moveSpeed
	}

	startRenderLoop() {
		this.context.startRenderLoop((time) => {
			if (this.isManualControl) {
				this.updateMovement()
			} else {
				this.updatePositionOnScroll()
			}

			const gl = this.context.gl
			gl.activeTexture(gl.TEXTURE0)
			gl.bindTexture(gl.TEXTURE_2D, this.texture)

			this.program.passUniforms([
				['iResolution', [this.context.width, this.context.height]],
				['iOffset', [this.worldOffset.x, this.worldOffset.y]],
				['iTexture', 0],
				['iTime', time / 1000 - this.startTime],
				['iProgress', this.scrollProgress]
			])

			this.program.draw(0, 4, gl.TRIANGLE_STRIP)
		})
	}

	updatePositionOnScroll() {
		const points = this.path
		const t = this.scrollProgress // 0 to 1

		// Calculate which segment we're in
		const totalSegments = points.length - 1
		const segmentIndex = Math.floor(t * totalSegments)
		const segmentT = (t * totalSegments) % 1

		// Clamp to valid indices
		const i = Math.min(segmentIndex, totalSegments - 1)
		const p0 = points[i]
		const p1 = points[Math.min(i + 1, points.length - 1)]

		// Interpolate between the two points
		this.worldOffset.x = p0.x + (p1.x - p0.x) * segmentT
		this.worldOffset.y = p0.y + (p1.y - p0.y) * segmentT
	}

	destroy() {
		this.unlockGlobalScroll()
		this.context?.destroy()
		WebGLLyf.#instance = null
	}
}
