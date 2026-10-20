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
		this.moveSpeed = 0.003
		this.keys = { w: false, a: false, s: false, d: false }
		this.scrollProgress = 0 // 0 to 1, controls position along path
		this.isScrollLocked = false
		this.isManualControl = false
		this.canvasInView = false
		staticSpace.navJump = false // Track when navigation is happening

		// Collision barrier
		this.barrierData = null
		this.barrierWidth = 0
		this.barrierHeight = 0

		// Location tracking
		this.currentLocationIndex = 0
		this.locationTextElement = null

		// Progress tracker integration
		this.progressTracker = null

		WebGLLyf.#instance = this
		window.__lyf = this
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
			await this.loadBarrier()
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

	async loadBarrier() {
		const img = new Image()
		return new Promise((resolve) => {
			img.onload = () => {
				const canvas = document.createElement('canvas')
				canvas.width = img.width
				canvas.height = img.height
				const ctx = canvas.getContext('2d', { willReadFrequently: true })
				ctx.drawImage(img, 0, 0)
				const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
				this.barrierData = imgData.data
				this.barrierWidth = canvas.width
				this.barrierHeight = canvas.height

				// Clear the bridge passage in the barrier data so the bridge is walkable
				// Bridge deck spans: px 415 to 545, py 530 to 570
				for (let y = 530; y <= 570; y++) {
					for (let x = 415; x <= 545; x++) {
						const idx = (y * this.barrierWidth + x) * 4
						this.barrierData[idx + 3] = 0 // clear alpha so bridge is unblocked
					}
				}
				resolve()
			}
			img.onerror = (err) => {
				console.warn('Failed to load barrier.png:', err)
				this.barrierData = null
				resolve()
			}
			img.src = './assets/barrier.png'
		})
	}

	isBlocked(worldX, worldY, radius = 8) {
		if (!this.barrierData) return false

		// Convert worldOffset to 2000x1200 pixel coordinates:
		// normX = 0.5 + worldX / 4.0
		// normY = 0.5 - worldY / 4.0
		const centerX = Math.round((0.5 + worldX / 4.0) * this.barrierWidth)
		const centerY = Math.round((0.5 - worldY / 4.0) * this.barrierHeight)

		const diagR = Math.round(radius * 0.707)
		const sampleOffsets = [
			[0, 0],
			[radius, 0],
			[-radius, 0],
			[0, radius],
			[0, -radius],
			[diagR, diagR],
			[-diagR, diagR],
			[diagR, -diagR],
			[-diagR, -diagR]
		]

		for (let i = 0; i < sampleOffsets.length; i++) {
			const px = centerX + sampleOffsets[i][0]
			const py = centerY + sampleOffsets[i][1]

			if (
				px < 0 ||
				px >= this.barrierWidth ||
				py < 0 ||
				py >= this.barrierHeight
			) {
				return true
			}

			const alpha = this.barrierData[(py * this.barrierWidth + px) * 4 + 3]
			if (alpha > 50) {
				return true
			}
		}

		return false
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

	stepProgress(delta) {
		const newProgress = Math.max(0, Math.min(1, this.scrollProgress + delta))
		this.scrollProgress = newProgress
		this.updatePositionOnScroll()
		this.notifyProgressTracker()
	}

	jumpToNextMilestone() {
		const totalSegments = this.path.length - 1
		const namedMilestones = []
		for (let i = 0; i < this.path.length; i++) {
			if (this.path[i].name && this.path[i].name.trim().length > 0) {
				namedMilestones.push({
					index: i,
					progress: i / totalSegments,
					name: this.path[i].name
				})
			}
		}

		if (namedMilestones.length === 0) return

		let target = namedMilestones.find(
			(m) => m.progress > this.scrollProgress + 0.02
		)
		if (!target) {
			target = namedMilestones[0]
		}

		this.isManualControl = false
		this.animateProgressTo(target.progress)
	}

	animateProgressTo(targetProgress, duration = 450) {
		const startProgress = this.scrollProgress
		const startTime = performance.now()
		const diff = targetProgress - startProgress

		const step = (now) => {
			const elapsed = now - startTime
			const t = Math.min(1, elapsed / duration)
			const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
			this.scrollProgress = Math.max(0, Math.min(1, startProgress + diff * ease))
			this.updatePositionOnScroll()
			this.notifyProgressTracker()

			if (t < 1) {
				requestAnimationFrame(step)
			}
		}
		requestAnimationFrame(step)
	}

	setupKeyboardControls() {
		const onKey = (e, pressed) => {
			const container = document.querySelector('.lyf-canvas-container')
			const isHovered = container ? container.matches(':hover') : false
			const active = document.activeElement
			const isTyping =
				active &&
				(active.tagName === 'INPUT' ||
					active.tagName === 'TEXTAREA' ||
					active.isContentEditable)

			if (!this.canvasInView && !isHovered) return
			if (isTyping) return
			if (!e) return

			const key = (e.key || '').toLowerCase()
			let dir = null
			if (key === 'w' || key === 'arrowup') dir = 'w'
			else if (key === 's' || key === 'arrowdown') dir = 's'
			else if (key === 'a' || key === 'arrowleft') dir = 'a'
			else if (key === 'd' || key === 'arrowright') dir = 'd'

			if (dir) {
				this.keys[dir] = pressed
				if (pressed) {
					this.isManualControl = true
					this.lockGlobalScroll()
				} else {
					const anyPressed = Object.values(this.keys).some(Boolean)
					if (!anyPressed) {
						this.isManualControl = false
					}
				}
				e.preventDefault()
			} else if ((key === ' ' || key === 'enter') && pressed) {
				this.jumpToNextMilestone()
				e.preventDefault()
			}
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
		const dpadButtons = document.querySelectorAll('.lyf-dpad-button')
		const actionBtn = document.querySelector('.lyf-action-button')

		const bindControl = (btn, onPress, onRelease) => {
			let isPressed = false

			const press = (e) => {
				if (e) {
					if (e.cancelable && e.type !== 'touchstart') e.preventDefault()
					e.stopPropagation()
				}
				if (isPressed) return
				isPressed = true
				btn.classList.add('is-pressed')
				if (typeof onPress === 'function') onPress()
			}

			const release = (e) => {
				if (!isPressed) return
				isPressed = false
				btn.classList.remove('is-pressed')
				if (typeof onRelease === 'function') onRelease()
			}

			btn.addEventListener('pointerdown', press)
			btn.addEventListener('pointerup', release)
			btn.addEventListener('pointercancel', release)
			btn.addEventListener('pointerleave', release)

			btn.addEventListener('touchstart', press, { passive: false })
			btn.addEventListener('touchend', release, { passive: false })
			btn.addEventListener('touchcancel', release, { passive: false })

			btn.addEventListener('mousedown', press)
			btn.addEventListener('mouseup', release)
			btn.addEventListener('mouseleave', release)
		}

		dpadButtons.forEach((btn) => {
			const key = btn.dataset.key
			if (key in this.keys) {
				bindControl(
					btn,
					() => {
						this.keys[key] = true
						this.isManualControl = true
						this.lockGlobalScroll()
					},
					() => {
						this.keys[key] = false
						const anyPressed = Object.values(this.keys).some(Boolean)
						if (!anyPressed) {
							this.isManualControl = false
						}
					}
				)
			}
		})

		if (actionBtn) {
			bindControl(
				actionBtn,
				() => this.jumpToNextMilestone(),
				null
			)
		}
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
			section.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
		let dx = 0
		let dy = 0

		if (this.keys.w) dy += this.moveSpeed
		if (this.keys.s) dy -= this.moveSpeed
		if (this.keys.a) dx -= this.moveSpeed
		if (this.keys.d) dx += this.moveSpeed

		if (dx === 0 && dy === 0) return

		// Normalize diagonal movement speed
		if (dx !== 0 && dy !== 0) {
			const invSqrt2 = 0.70710678
			dx *= invSqrt2
			dy *= invSqrt2
		}

		const newX = this.worldOffset.x + dx
		const newY = this.worldOffset.y + dy

		if (!this.isBlocked(newX, newY)) {
			this.worldOffset.x = newX
			this.worldOffset.y = newY
		} else {
			// Slide along unblocked axis if moving diagonally or against a barrier
			if (dx !== 0 && !this.isBlocked(newX, this.worldOffset.y)) {
				this.worldOffset.x = newX
			}
			if (dy !== 0 && !this.isBlocked(this.worldOffset.x, newY)) {
				this.worldOffset.y = newY
			}
		}

		// Update location based on manual movement
		this.updateLocationBasedOnPosition()
		this.updateScrollProgressFromPosition()
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
