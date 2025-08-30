import WebGLContext from './webgl-core.js'

export default class WebGLBackground {
	static #instance

	constructor() {
		if (WebGLBackground.#instance) {
			return WebGLBackground.#instance
		}

		this.context = new WebGLContext('#welcome-background')
		this.program = null
		this.startTime = performance.now() / 1000
		this.frameCount = 0
		this.lastFrameTime = 0
		this.mouse = { x: 0, y: 0, clickX: 0, clickY: 0 }
		this.isMouseDown = false

		WebGLBackground.#instance = this
	}

	static getInstance() {
		if (!WebGLBackground.#instance) {
			WebGLBackground.#instance = new WebGLBackground()
		}
		return WebGLBackground.#instance
	}

	async init() {
		try {
			this.program = await this.context.createProgram(
				'background',
				'./shaders/background.vert',
				'./shaders/background.frag'
			)
			this.setupQuad()
			this.setupMouseEvents()
			this.startRenderLoop()
		} catch (error) {
			console.warn('WebGL background failed to initialize:', error)
			this.context.clear([0.0, 0.0, 0.0, 1.0])
		}
	}

	setupQuad() {
		const vertices = new Float32Array([
			-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0
		])
		this.program.passAttrib([['a_position', vertices, 2]])
	}

	setupMouseEvents() {
		const welcomeSection = document.querySelector('#welcome')
		if (!welcomeSection) return

		welcomeSection.addEventListener('mousemove', (e) => {
			const rect = welcomeSection.getBoundingClientRect()
			this.mouse.x = e.clientX - rect.left
			this.mouse.y = welcomeSection.offsetHeight - (e.clientY - rect.top)
		})

		welcomeSection.addEventListener('mousedown', (e) => {
			const rect = welcomeSection.getBoundingClientRect()
			this.isMouseDown = true
			this.mouse.clickX = e.clientX - rect.left
			this.mouse.clickY = welcomeSection.offsetHeight - (e.clientY - rect.top)
		})

		welcomeSection.addEventListener('mouseup', () => {
			this.isMouseDown = false
		})

		welcomeSection.addEventListener('mouseleave', () => {
			this.isMouseDown = false
			this.mouse.x = 0
			this.mouse.y = 0
		})

		welcomeSection.addEventListener('mouseenter', () => {
			this.mouse.clickX = 0
			this.mouse.clickY = 0
		})
	}

	updateUniforms(currentTime) {
		const deltaTime = currentTime - this.lastFrameTime
		const frameRate = deltaTime > 0 ? 1.0 / deltaTime : 60.0
		const now = new Date()
		const timeInSeconds =
			now.getHours() * 3600 +
			now.getMinutes() * 60 +
			now.getSeconds() +
			now.getMilliseconds() / 1000
		const canvas = this.context.canvas

		const uniforms = [
			[
				'iResolution',
				[canvas.width, canvas.height, canvas.width / canvas.height]
			],
			['iTime', currentTime - this.startTime],
			['iTimeDelta', deltaTime],
			['iFrameRate', frameRate],
			['iFrame', this.frameCount],
			[
				'iMouse',
				[this.mouse.x, this.mouse.y, this.mouse.clickX, this.mouse.clickY]
			],
			[
				'iDate',
				[now.getFullYear(), now.getMonth() + 1, now.getDate(), timeInSeconds]
			]
		]

		this.program.passUniforms(uniforms)
		this.lastFrameTime = currentTime
		this.frameCount++
	}

	startRenderLoop() {
		this.context.startRenderLoop((time) => {
			this.updateUniforms(time / 1000)
			this.program.draw(0, 4, this.context.gl.TRIANGLE_STRIP)
		})
	}

	destroy() {
		this.context.destroy()
		WebGLBackground.#instance = null
	}
}
