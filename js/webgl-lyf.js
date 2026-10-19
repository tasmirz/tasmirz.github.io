import WebGLContext from './webgl-core.js'
import { staticSpace } from './staticSpace.js'
export default class WebGLLyf {
	static #instance
	path = [
		{
			x: -1.37,
			y: 0.38,
			name: '20XX : Birth'
		},
		{
			x: -1.354,
			y: 0.1559999999999998,
			name: ''
		},
		{
			x: -1.164,
			y: 0.11399999999999977,
			name: ''
		},
		{
			x: -1.0459999999999998,
			y: 0.17199999999999982,
			name: ''
		},
		{
			x: -0.9199999999999997,
			y: 0.11999999999999977,
			name: ' '
		},
		{
			x: -0.8079999999999996,
			y: 0.08199999999999974,
			name: ' '
		},
		{
			x: -0.6739999999999995,
			y: 0.07199999999999973,
			name: ''
		},
		{
			x: -0.4579999999999993,
			y: 0.11399999999999977,
			name: ''
		},
		{
			x: -0.19399999999999906,
			y: 0.1539999999999998,
			name: "St. Gregory's High School"
		},
		{
			x: 0.15200000000000122,
			y: 0.12399999999999978,
			name: 'Senior Patrol Leader, Gregorian Scouts'
		},
		{
			x: 0.2720000000000013,
			y: -0.06800000000000037,
			name: 'KUET CSE'
		},
		{
			x: 0.3720000000000014,
			y: -0.3860000000000006,
			name: 'KRPC5 : 2nd Runner Up'
		},
		{
			x: 0.3880000000000014,
			y: -0.6160000000000008,
			name: ''
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
		staticSpace.navJump = false // Track when navigation is happening

		// Location tracking
		this.currentLocationIndex = 0
		this.locationTextElement = null

		// Progress tracker integration
		this.progressTracker = null

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

			// Initialize progress tracker integration
			try {
				const ProgressTracker = (await import('./progress-tracker.js')).default
				this.progressTracker = ProgressTracker.getInstance()
			} catch (error) {
				console.warn('Progress tracker not available:', error)
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
			this.setupNavigationListeners()
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
		this.setupKeyboardControls()
		this.setupWheelControls()
		this.setupMobileControls()
	}

	setupKeyboardControls() {
		const onKey = (e, pressed) => {
			// if not focused/has mouse over it return
			const container = document.querySelector('.lyf-canvas-container')
			const isHovered = container ? container.matches(':hover') : false
			const active = document.activeElement
			const isTyping =
				active &&
				(active.tagName === 'INPUT' ||
					active.tagName === 'TEXTAREA' ||
					active.isContentEditable)

			// Only handle keyboard when the canvas is in view or hovered, and no text input is focused
			if (!this.canvasInView && !isHovered) return
			if (isTyping) return

			if (!e) return
			// Prefer e.key when available, fall back to e.code (e.g. 'KeyW')
			let keyVal = null
			if (typeof e.key === 'string' && e.key.length) keyVal = e.key
			else if (typeof e.code === 'string' && e.code.length) keyVal = e.code
			if (!keyVal) return
			let k = keyVal.toLowerCase()
			// Normalize 'KeyW' -> 'w'
			if (k.startsWith('key') && k.length > 3) k = k.slice(3)
			if (!(k in this.keys)) return
			this.keys[k] = pressed
			if (pressed) {
				this.isManualControl = true
				this.lockGlobalScroll()
			} else {
				if (!Object.values(this.keys).some(Boolean)) {
					this.updateScrollProgressFromPosition()
					this.isManualControl = false
				}
			}
			e.preventDefault()
		}

		document.addEventListener('keydown', (e) => onKey(e, true))
		document.addEventListener('keyup', (e) => onKey(e, false))
	}

	setupWheelControls() {
		document.addEventListener(
			'wheel',
			(e) => {
				if (this.isManualControl || !this.canvasInView) return

				const delta = e.deltaY > 0 ? 0.015 : -0.015
				const newProgress = Math.max(
					0,
					Math.min(1, this.scrollProgress + delta)
				)

				if (this.shouldHandleScroll(newProgress)) {
					e.preventDefault()
					this.scrollProgress = newProgress
					this.lockGlobalScroll()
					this.notifyProgressTracker()
				} else {
					this.unlockGlobalScroll()
				}
			},
			{ passive: false }
		)
	}

	setupMobileControls() {
		document.querySelectorAll('.lyf-dpad-button').forEach((btn) => {
			const key = btn.dataset.key
			const handleTouch = (e, pressed) => {
				e.preventDefault()
				this.keys[key] = pressed
				if (pressed) {
					this.isManualControl = true
					this.lockGlobalScroll()
				} else if (!Object.values(this.keys).some(Boolean)) {
					this.updateScrollProgressFromPosition()
					this.isManualControl = false
				}
			}

			btn.addEventListener('touchstart', (e) => handleTouch(e, true))
			btn.addEventListener('touchend', (e) => handleTouch(e, false))
		})

		const actionBtn = document.querySelector('.lyf-action-button')
		if (actionBtn)
			actionBtn.addEventListener('touchstart', () => {
				this.scrollProgress = 0
				this.isManualControl = false
				this.worldOffset = { x: this.path[0].x, y: this.path[0].y }
				this.updateLocationText(0)
			})
	}

	shouldHandleScroll(newProgress) {
		return (
			(this.scrollProgress > 0 && this.scrollProgress < 1) ||
			(newProgress > 0 && newProgress < 1)
		)
	}

	setupScrollLock() {
		const lyfSection = document.querySelector('#lyf')
		if (!lyfSection) return

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					this.canvasInView = entry.isIntersecting

					if (staticSpace.navJump) return

					if (entry.isIntersecting) {
						this.scrollToSection(lyfSection)
					} else if (!this.isManualControl) {
						this.unlockGlobalScroll()
					}
				})
			},
			{ threshold: 0.5 }
		)

		observer.observe(lyfSection)
	}

	scrollToSection(section) {
		if (section) {
			section.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}

	setupNavigationListeners() {
		const navLinks = document.querySelectorAll('nav a[href^="#"]')
		navLinks.forEach((link) => {
			link.addEventListener('click', (e) => this.handleNavClick(link))
		})
	}

	handleNavClick(link) {
		const href = link.getAttribute('href')
		if (href === '#lyf') return

		staticSpace.navJump = true
		this.unlockGlobalScroll()

		const targetSection = document.querySelector(href)
		if (targetSection) {
			this.waitForScrollComplete(targetSection)
		} else {
			staticSpace.navJump = false
		}
	}

	waitForScrollComplete(targetSection) {
		const checkScrollComplete = () => {
			const rect = targetSection.getBoundingClientRect()
			const isInView = rect.top >= 0 && rect.top <= window.innerHeight * 0.1

			if (isInView) {
				staticSpace.navJump = false
			} else {
				requestAnimationFrame(checkScrollComplete)
			}
		}
		requestAnimationFrame(checkScrollComplete)
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
		const element = this.locationTextElement
		const parent = element.parentElement

		// Fade out
		element.style.opacity = '0'
		element.style.transform = 'translateY(-10px)'

		if (location.name.trim()) {
			parent.style.opacity = '1'
			element.textContent = location.name

			setTimeout(() => {
				element.style.opacity = '1'
				element.style.transform = 'translateY(0)'
				element.style.animation = 'none'
				element.offsetHeight // Trigger reflow
				element.style.animation = 'fadeInText 0.5s ease-out'
			}, 150)
		} else {
			parent.style.transition = 'opacity 0.5s ease-out'
			parent.style.opacity = '0'
		}

		this.currentLocationIndex = locationIndex
	}

	updateLocationBasedOnPosition() {
		let idx = 0
		let best = Infinity
		for (let i = 0; i < this.path.length; i++) {
			const p = this.path[i]
			const d = Math.hypot(p.x - this.worldOffset.x, p.y - this.worldOffset.y)
			if (d < best) {
				best = d
				idx = i
			}
		}
		if (best < 0.1 && idx !== this.currentLocationIndex)
			this.updateLocationText(idx)
	}

	updateScrollProgressFromPosition() {
		let closestSegmentProgress = 0
		let closestDistance = Infinity

		for (let i = 0; i < this.path.length - 1; i++) {
			const segmentProgress = this.getSegmentProgress(i)
			if (segmentProgress.distance < closestDistance) {
				closestDistance = segmentProgress.distance
				closestSegmentProgress = segmentProgress.progress
			}
		}

		this.scrollProgress = Math.max(0, Math.min(1, closestSegmentProgress))
		this.notifyProgressTracker()
	}

	getSegmentProgress(i) {
		const p0 = this.path[i],
			p1 = this.path[i + 1]
		const vx = p1.x - p0.x,
			vy = p1.y - p0.y
		const len2 = vx * vx + vy * vy
		if (!len2) return { progress: 0, distance: Infinity }
		const t = Math.max(
			0,
			Math.min(
				1,
				((this.worldOffset.x - p0.x) * vx + (this.worldOffset.y - p0.y) * vy) /
					len2
			)
		)
		const cx = p0.x + t * vx,
			cy = p0.y + t * vy
		const dist = Math.hypot(this.worldOffset.x - cx, this.worldOffset.y - cy)
		return { progress: (i + t) / (this.path.length - 1), distance: dist }
	}

	// Notify progress tracker of scroll changes
	notifyProgressTracker() {
		if (
			this.progressTracker &&
			typeof this.progressTracker.notifyProgressChange === 'function'
		) {
			this.progressTracker.notifyProgressChange()
		}
	}

	startRenderLoop() {
		this.context.startRenderLoop((time) => {
			if (this.isManualControl) {
				this.updateMovement()
			} else {
				this.updatePositionOnScroll()
			}

			const program = this.context.programs.get('lyf') || this.program
			program.use()
			// bind texture via Program helper
			program.bindTexture('iTexture', this.texture)

			program.passUniforms([
				['iResolution', [this.context.width, this.context.height]],
				['iOffset', [this.worldOffset.x, this.worldOffset.y]],
				['iTexture', 0],
				['iTime', time / 1000 - this.startTime],
				['iProgress', this.scrollProgress]
			])

			// draw using Program helper; pass GL mode constant via context.gl
			program.draw(0, 4, this.context.gl.TRIANGLE_STRIP)
		})
	}

	updatePositionOnScroll() {
		const t = this.scrollProgress
		const totalSegments = this.path.length - 1
		const segmentIndex = Math.floor(t * totalSegments)
		const segmentT = (t * totalSegments) % 1

		const i = Math.min(segmentIndex, totalSegments - 1)
		const p0 = this.path[i]
		const p1 = this.path[Math.min(i + 1, this.path.length - 1)]

		// Interpolate position
		this.worldOffset.x = p0.x + (p1.x - p0.x) * segmentT
		this.worldOffset.y = p0.y + (p1.y - p0.y) * segmentT

		// Update location text
		const newLocationIndex =
			segmentT < 0.5 ? i : Math.min(i + 1, this.path.length - 1)
		if (newLocationIndex !== this.currentLocationIndex) {
			this.updateLocationText(newLocationIndex)
		}
	}

	setupTouchScroll() {
		const lyfSection = document.querySelector('#lyf')
		if (!lyfSection) return

		let touchState = { startY: 0, startProgress: 0, isTouching: false }

		lyfSection.addEventListener('touchstart', (e) => {
			if (this.isManualControl || !this.canvasInView) return
			touchState = {
				startY: e.touches[0].clientY,
				startProgress: this.scrollProgress,
				isTouching: true
			}
		}, { passive: true })

		lyfSection.addEventListener(
			'touchmove',
			(e) => {
				if (
					!touchState.isTouching ||
					this.isManualControl ||
					!this.canvasInView
				)
					return

				const deltaY = e.touches[0].clientY - touchState.startY
				const deltaProgress = deltaY / lyfSection.clientHeight
				const newProgress = Math.max(
					0,
					Math.min(1, touchState.startProgress - deltaProgress)
				)

				this.scrollProgress = newProgress
			},
			{ passive: true }
		)

		const endTouch = () => {
			touchState.isTouching = false
			this.unlockGlobalScroll()
		}

		lyfSection.addEventListener('touchend', endTouch, { passive: true })
		lyfSection.addEventListener('touchcancel', endTouch, { passive: true })
	}

	destroy() {
		this.unlockGlobalScroll()
		this.context?.destroy()
		WebGLLyf.#instance = null
	}
}
