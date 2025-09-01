import WebGLContext from './webgl-core.js'

export default class WebGLLyf {
	static #instance
	path = [
		{
			x: -1.37,
			y: 0.38,
			name: 'Childhood Home'
		},
		{
			x: -1.354,
			y: 0.1559999999999998,
			name: 'Elementary School'
		},
		{
			x: -1.164,
			y: 0.11399999999999977,
			name: 'Local Library'
		},
		{
			x: -1.0459999999999998,
			y: 0.17199999999999982,
			name: 'First Computer Class'
		},
		{
			x: -0.9199999999999997,
			y: 0.11999999999999977,
			name: 'High School'
		},
		{
			x: -0.8079999999999996,
			y: 0.08199999999999974,
			name: 'Programming Club'
		},
		{
			x: -0.6739999999999995,
			y: 0.07199999999999973,
			name: 'First Project'
		},
		{
			x: -0.4579999999999993,
			y: 0.11399999999999977,
			name: 'University Days'
		},
		{
			x: -0.19399999999999906,
			y: 0.1539999999999998,
			name: 'Internship'
		},
		{
			x: 0.15200000000000122,
			y: 0.12399999999999978,
			name: 'First Job'
		},
		{
			x: 0.2720000000000013,
			y: -0.06800000000000037,
			name: 'Learning WebGL'
		},
		{
			x: 0.3720000000000014,
			y: -0.3860000000000006,
			name: 'Building Projects'
		},
		{
			x: 0.3880000000000014,
			y: -0.6160000000000008,
			name: 'Open Source'
		},
		{
			x: 0.3820000000000014,
			y: -0.838000000000001,
			name: 'Present Day'
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

		// Location tracking
		this.currentLocationIndex = 0
		this.locationTextElement = null

		WebGLLyf.#instance = this
	}

	static getInstance() {
		return WebGLLyf.#instance || new WebGLLyf()
	}

	async init() {
		try {
			const container = document.querySelector('.lyf-canvas-container')
			if (!container) throw new Error('Canvas container not found')

			// Initialize location text element
			this.locationTextElement = document.querySelector('.lyf-location-text')
			if (this.locationTextElement) {
				this.updateLocationText(0) // Start with first location
			}

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
			this.setupTouchScroll()
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
					// Update scroll progress to match current manual position before switching modes
					this.updateScrollProgressFromPosition()
					this.isManualControl = false
				}
				e.preventDefault()
			}
		})

		document.addEventListener(
			'wheel',
			(e) => {
				if (this.isManualControl || !this.canvasInView) return

				const delta = e.deltaY > 0 ? 0.015 : -0.015
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
					// Update scroll progress to match current manual position before switching modes
					this.updateScrollProgressFromPosition()
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
				this.updateLocationText(0) // Reset to starting location
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
					//jump to #lyf , within .5s

					if (entry.isIntersecting) {
						lyfSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
						setTimeout(() => {
							lyfSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
						}, 500)
					}

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
			{ threshold: 0.5 }
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

		// Update location based on manual movement
		this.updateLocationBasedOnPosition()
	}

	updateLocationText(locationIndex) {
		if (
			!this.locationTextElement ||
			locationIndex < 0 ||
			locationIndex >= this.path.length
		)
			return

		const location = this.path[locationIndex]

		// Add fade out effect before changing text
		this.locationTextElement.style.opacity = '0'
		this.locationTextElement.style.transform = 'translateY(-10px)'

		setTimeout(() => {
			this.locationTextElement.textContent = location.name
			this.locationTextElement.style.opacity = '1'
			this.locationTextElement.style.transform = 'translateY(0)'

			// Trigger the CSS animation
			this.locationTextElement.style.animation = 'none'
			this.locationTextElement.offsetHeight // Trigger reflow
			this.locationTextElement.style.animation = 'fadeInText 0.5s ease-out'
		}, 150)

		this.currentLocationIndex = locationIndex
	}

	updateLocationBasedOnPosition() {
		// Find the closest location to current position
		let closestIndex = 0
		let closestDistance = Infinity

		this.path.forEach((point, index) => {
			const dx = point.x - this.worldOffset.x
			const dy = point.y - this.worldOffset.y
			const distance = Math.sqrt(dx * dx + dy * dy)

			if (distance < closestDistance) {
				closestDistance = distance
				closestIndex = index
			}
		})

		// Only update if we're close enough to a location (threshold)
		if (closestDistance < 0.1 && closestIndex !== this.currentLocationIndex) {
			this.updateLocationText(closestIndex)
		}
	}

	updateScrollProgressFromPosition() {
		// Find the closest segment on the path to current position
		let closestSegmentProgress = 0
		let closestDistance = Infinity

		for (let i = 0; i < this.path.length - 1; i++) {
			const p0 = this.path[i]
			const p1 = this.path[i + 1]

			// Find the closest point on this segment
			const segmentVector = { x: p1.x - p0.x, y: p1.y - p0.y }
			const toCurrentPos = {
				x: this.worldOffset.x - p0.x,
				y: this.worldOffset.y - p0.y
			}

			// Project current position onto the segment
			const segmentLength = Math.sqrt(
				segmentVector.x * segmentVector.x + segmentVector.y * segmentVector.y
			)
			if (segmentLength === 0) continue

			const t = Math.max(
				0,
				Math.min(
					1,
					(toCurrentPos.x * segmentVector.x +
						toCurrentPos.y * segmentVector.y) /
						(segmentLength * segmentLength)
				)
			)

			const closestPointOnSegment = {
				x: p0.x + t * segmentVector.x,
				y: p0.y + t * segmentVector.y
			}

			const dx = this.worldOffset.x - closestPointOnSegment.x
			const dy = this.worldOffset.y - closestPointOnSegment.y
			const distance = Math.sqrt(dx * dx + dy * dy)

			if (distance < closestDistance) {
				closestDistance = distance
				closestSegmentProgress = (i + t) / (this.path.length - 1)
			}
		}

		this.scrollProgress = Math.max(0, Math.min(1, closestSegmentProgress))
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

		// Update location text based on current segment
		const newLocationIndex =
			segmentT < 0.5 ? i : Math.min(i + 1, points.length - 1)
		if (newLocationIndex !== this.currentLocationIndex) {
			this.updateLocationText(newLocationIndex)
		}
	}

	setupTouchScroll() {
		const lyfSection = document.querySelector('#lyf')
		if (!lyfSection) return

		let startY = 0
		let startScrollProgress = 0
		let isTouching = false

		lyfSection.addEventListener('touchstart', (e) => {
			if (this.isManualControl || !this.canvasInView) return

			startY = e.touches[0].clientY
			startScrollProgress = this.scrollProgress
			isTouching = true
		})

		lyfSection.addEventListener(
			'touchmove',
			(e) => {
				if (!isTouching || this.isManualControl || !this.canvasInView) return

				const deltaY = e.touches[0].clientY - startY
				const deltaProgress = deltaY / lyfSection.clientHeight
				let newProgress = startScrollProgress - deltaProgress
				newProgress = Math.max(0, Math.min(1, newProgress))

				// Directly set scrollProgress for boundary detection
				this.scrollProgress = newProgress

				if (newProgress > 0 && newProgress < 1) {
					e.preventDefault()
					this.lockGlobalScroll()
				} else {
					this.unlockGlobalScroll()
				}
			},
			{ passive: false }
		)

		lyfSection.addEventListener('touchend', () => {
			isTouching = false
			// Always release lock at boundaries
			if (this.scrollProgress === 0 || this.scrollProgress === 1) {
				this.unlockGlobalScroll()
			}
		})
	}

	destroy() {
		this.unlockGlobalScroll()
		this.context?.destroy()
		WebGLLyf.#instance = null
	}
}
