import WebGLContext from './webgl-core.js'

// Leaves emitter inside the welcome background.
export default class WebGLBackground {
	static #instance

	constructor(container = '#tree-bg-video') {
		if (WebGLBackground.#instance) return WebGLBackground.#instance

		this.context = new WebGLContext(container, { alpha: true, antialias: true })
		this.program = null

		// particle system
		this.particles = []
		this.maxParticles = 10
		// we'll use instanced rendering: 4 vertices per instance (triangle strip)
		this.verticesPerParticle = 4
		this.vertexCount = 0

		// emitter rectangle as fraction of canvas: x,y,w,h
		// start area: x from 0.65 -> 0.95, y from 0.5 -> 0.6
		this.emitter = { x: 0.65, y: 0.5, w: 0.3, h: 0.1 }

		this.lastTime = 0

		// size controls: multiplier and base range (baseSize in [baseSizeMin, baseSizeMax])
		this.sizeScale = 1.0
		this.baseSizeMin = 10
		this.baseSizeMax = 25

		// wind controlled by pointer horizontal position (-1..1)
		this.mouseWind = 0
		this.rotationScale = 1.0
		this.rotationDelta = 0.3 // controllable randomness amount (0 = synchronized, 1 = max randomness)
		this.maxParticleLifetime = 2.0 // maximum lifetime for particles in seconds
		this._onPointerMove = this._onPointerMove.bind(this)
		// listen to global pointer so wind responds to viewport mouse position
		window.addEventListener('mousemove', this._onPointerMove)

		WebGLBackground.#instance = this
	}

	static getInstance() {
		if (!WebGLBackground.#instance)
			WebGLBackground.#instance = new WebGLBackground()
		return WebGLBackground.#instance
	}

	async init() {
		// load shaders from external files (so browsers can cache and dev tools can show them)
		try {
			this.program = await this.context.createProgram(
				'leaves',
				'./js/shaders/leaves.vert',
				'./js/shaders/leaves.frag'
			)

			this._initParticles()
			this._createBuffers()
			// load leaf texture
			this.leafImage = await new Promise((res, rej) => {
				const img = new Image()
				img.src = './assets/leaf.png'
				img.onload = () => res(img)
				img.onerror = rej
			})
			this.leafTexture = this.context.createTexture(this.leafImage, {
				generateMipmap: false
			})
			// optional global coordinate (pixels) passed to shader
			this.globalCoord = [0, 0]
			this._setupResizeHandler()
			setTimeout(
				() => this.context.startRenderLoop((t) => this._render(t / 1000)),
				4000
			)
		} catch (err) {
			console.warn('WebGLBackground init failed:', err)
		}
	}

	_initParticles() {
		const W = this.context.canvas.width
		const H = this.context.canvas.height
		const e = this.emitter
		const ew = Math.max(1, Math.floor(W * e.w))
		const eh = Math.max(1, Math.floor(H * e.h))
		const ex = Math.floor(W * e.x)
		const ey = Math.floor(H * e.y)

		this.particles = []
		for (let i = 0; i < this.maxParticles; i++) {
			const px = ex + Math.random() * ew
			const py = ey + Math.random() * eh
			const baseSize =
				(this.baseSizeMin +
					Math.random() * (this.baseSizeMax - this.baseSizeMin)) *
				this.sizeScale
			// Removed size oscillation parameters
			const velX = (Math.random() - 0.5) * 20
			const velY = 30 + Math.random() * 60
			// initial rotation and rotational speed
			const rotation = (Math.random() * 2 - 1) * ((15 * Math.PI) / 180) // ±15°
			const rotationVelocity = (Math.random() - 0.5) * 2
			// p.size will be computed per-frame from baseSize
			// give each particle a randomized spawnTime in the recent past so they
			// don't all appear simultaneously on first frame
			const ageOffset = Math.random() * this.maxParticleLifetime
			const now = performance.now() / 1000
			this.particles.push({
				x: px,
				y: py,
				spawnX: px,
				spawnY: py,
				velX,
				velY,
				baseSize,
				size: baseSize,
				rotation,
				rotationVelocity,
				// randomized spawnTime so particles are distributed on first frame
				spawnTime: now - ageOffset
			})
		}
	}

	_createBuffers() {
		this.vertexCount = this.maxParticles * this.verticesPerParticle

		// per-instance arrays (one entry per particle)
		this.instancePositions = new Float32Array(this.maxParticles * 2)
		this.instanceVelocities = new Float32Array(this.maxParticles * 2)
		this.instanceSizes = new Float32Array(this.maxParticles)
		this.instanceRotations = new Float32Array(this.maxParticles)
		this.instanceRotationVel = new Float32Array(this.maxParticles)
		this.instanceParticleIds = new Float32Array(this.maxParticles)
		this.instanceSpawnTimes = new Float32Array(this.maxParticles)

		// static per-vertex corner buffer data (-1..1 quad)
		this.cornerBufferData = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
	}

	_setupResizeHandler() {
		window.addEventListener('resize', () =>
			setTimeout(() => this._initParticles(), 50)
		)
	}

	_update(currentTime) {
		const W = this.context.canvas.width
		const H = this.context.canvas.height
		const e = this.emitter
		const ew = Math.max(1, Math.floor(W * e.w)) // emitter width
		const eh = Math.max(1, Math.floor(H * e.h)) // emitter height
		const ex = Math.floor(W * e.x) // emitter x
		const ey = Math.floor(H * e.y) // emitter y

		for (let i = 0, L = this.particles.length; i < L; i++) {
			const particle = this.particles[i]

			// initialize spawnTime on first update if it wasn't set during init
			if (!particle.spawnTime) particle.spawnTime = currentTime

			// Use spawn position and velocity to compute current position for bounds check
			const particleAge = currentTime - particle.spawnTime
			const currentX = particle.spawnX + particle.velX * particleAge
			const currentY = particle.spawnY + particle.velY * particleAge

			// size is fixed per-particle
			if (particle.baseSize !== undefined) particle.size = particle.baseSize

			// respawn when out of bottom or far horizontally
			if (
				currentY - particle.size > H ||
				currentX < -100 ||
				currentX > W + 100
			) {
				const newX = ex + Math.random() * ew
				const newY = ey + Math.random() * eh
				particle.spawnX = newX
				// respawn properties (color is no longer used by shader; skip allocation)
				particle.spawnTime = currentTime
			}
		}
	}

	_onPointerMove(e) {
		// Use global viewport X position. Map 0.8 (80%) -> 0.
		// Right 20% => positive 0..1, left 80% => negative -1..0
		const vx = e.clientX / (window.innerWidth || 1)
		let wind
		if (vx >= 0.8) {
			wind = (vx - 0.8) / 0.2 // 0..1
		} else {
			wind = -((0.8 - vx) / 0.8) // -1..0
		}
		// clamp and smooth
		wind = Math.max(-1, Math.min(1, wind))
		this.mouseWind = this.mouseWind * 0.92 + wind * 0.08
	}

	_buildVertexData() {
		// populate per-instance arrays (one entry per particle)
		for (let i = 0, L = this.particles.length; i < L; i++) {
			const p = this.particles[i]
			const bi = i * 2
			this.instancePositions[bi] = p.spawnX
			this.instancePositions[bi + 1] = p.spawnY

			this.instanceVelocities[bi] = p.velX
			this.instanceVelocities[bi + 1] = p.velY

			this.instanceSizes[i] = p.size * 0.5
			this.instanceRotations[i] = p.rotation || 0
			this.instanceRotationVel[i] = p.rotationVelocity || 0
			this.instanceParticleIds[i] = i
			this.instanceSpawnTimes[i] = p.spawnTime || 0
		}
	}

	// --- size control API ---
	setSizeScale(scale) {
		this.sizeScale = Math.max(0.01, Number(scale) || 1)
		// update existing particles' baseSize to reflect new scale
		for (const particle of this.particles) {
			if (particle.baseSize !== undefined)
				particle.baseSize =
					(particle.baseSize / this.sizeScale) * this.sizeScale
		}
	}

	setBaseSizeRange(min, max) {
		if (min >= 0 && max > min) {
			this.baseSizeMin = Number(min)
			this.baseSizeMax = Number(max)
		}
	}

	// set the global coordinate (in pixels) passed to fragment shader
	setGlobalCoord(x, y) {
		this.globalCoord = [Number(x) || 0, Number(y) || 0]
	}

	setRotationScale(s) {
		this.rotationScale = Number(s) || 1.0
	}

	setRotationDelta(delta) {
		this.rotationDelta = Math.max(0, Math.min(1, Number(delta) || 0.3))
	}

	calculateAverageWindRotation() {
		// Calculate current wind rotation based on mouseWind
		return this.mouseWind * ((30 * Math.PI) / 180) // ±30° based on wind
	}

	_render(time) {
		if (!this.program) return
		// use render-supplied time (seconds) for all particle timing computations
		const dt = this.lastTime ? Math.min(0.05, time - this.lastTime) : 0.016
		this._update(time)
		this._buildVertexData()

		// efficiently upload dynamic attributes using Program helpers
		const program = this.context.programs.get('leaves') || this.program
		program.use()
		const canvas = this.context.canvas

		program.passUniforms([
			['u_resolution', [canvas.width, canvas.height]],
			['u_globalCoord', this.globalCoord],
			['u_rotationScale', this.rotationScale],
			// global tint used instead of per-vertex color (RGBA)
			['u_globalTint', [1.0, 1.0, 1.0, 1.0]],
			['u_time', time],
			['u_rotationDelta', this.rotationDelta],
			['u_windRotation', this.calculateAverageWindRotation()],
			['u_mouseWind', this.mouseWind]
		])

		// efficiently upload dynamic attributes using Program helpers
		// batch upload attributes (corner static + per-instance with divisor=1)
		program.passAttribDynamic([
			['a_corner', this.cornerBufferData, 2, undefined, 0],
			['a_position', this.instancePositions, 2, undefined, 1],
			['a_size', this.instanceSizes, 1, undefined, 1],
			['a_rotation', this.instanceRotations, 1, undefined, 1],
			['a_particleId', this.instanceParticleIds, 1, undefined, 1],
			['a_spawnTime', this.instanceSpawnTimes, 1, undefined, 1],
			['a_velocity', this.instanceVelocities, 2, undefined, 1],
			['a_rotationVelocity', this.instanceRotationVel, 1, undefined, 1]
		])

		// bind leaf texture using efficient helper (via program)
		program.bindTexture('u_texture', this.leafTexture)

		// draw instanced (Program helper handles fallback)
		const instanceCount = this.maxParticles
		program.drawInstanced(0, this.verticesPerParticle, instanceCount)

		this.lastTime = time
	}

	destroy() {
		// remove global pointer listener
		window.removeEventListener('pointermove', this._onPointerMove)
		this.context.destroy()
		WebGLBackground.#instance = null
	}
}
