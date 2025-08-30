export class Program {
	#program
	#gl
	#vertexShaderURL
	#fragmentShaderURL

	constructor(gl, vertexShaderURL, fragmentShaderURL) {
		this.#gl = gl
		this.#vertexShaderURL = vertexShaderURL
		this.#fragmentShaderURL = fragmentShaderURL
	}

	async init() {
		try {
			const vertexShaderSource = await (
				await fetch(this.#vertexShaderURL)
			).text()
			const fragmentShaderSource = await (
				await fetch(this.#fragmentShaderURL)
			).text()
			this.vertexShader = this._compileShader(
				vertexShaderSource,
				this.#gl.VERTEX_SHADER
			)

			this.fragmentShader = this._compileShader(
				fragmentShaderSource,
				this.#gl.FRAGMENT_SHADER
			)
			this.#program = this._linkProgram(this.vertexShader, this.fragmentShader)
		} catch (error) {
			console.log(error)
		}
		return this
	}

	_compileShader(source, type) {
		const shader = this.#gl.createShader(type)
		if (!shader) throw new Error('Failed to create shader')

		this.#gl.shaderSource(shader, source)
		this.#gl.compileShader(shader)

		if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
			const info = this.#gl.getShaderInfoLog(shader)
			this.#gl.deleteShader(shader)
			throw new Error(`Shader compile error: ${info}`)
		}
		return shader
	}

	_linkProgram(vs, fs) {
		const program = this.#gl.createProgram()
		if (!program) throw new Error('Failed to create program')

		this.#gl.attachShader(program, vs)
		this.#gl.attachShader(program, fs)
		this.#gl.linkProgram(program)

		if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
			const info = this.#gl.getProgramInfoLog(program)
			this.#gl.deleteProgram(program)
			throw new Error(`Program link error: ${info}`)
		}
		return program
	}
	use() {
		if (this.#program == null)
			throw Error('Shader not initialized, initialize with init()')
		if (this.#program === this.#gl.getParameter(this.#gl.CURRENT_PROGRAM))
			return
		this.#gl.useProgram(this.#program)
	}

	attribLocation(name) {
		return this.#gl.getAttribLocation(this.#program, name)
	}

	uniformLocation(name) {
		return this.#gl.getUniformLocation(this.#program, name)
	}
	passAttrib(passedData) {
		const gl = this.#gl
		if (this.#program !== gl.getParameter(gl.CURRENT_PROGRAM)) this.use()
		for (const [attribName, data, size] of passedData) {
			const attribLoc = this.attribLocation(attribName)
			if (attribLoc === -1) {
				throw new Error(`Attribute "${attribName}" not found in program.`)
			}

			const buffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
			gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

			gl.enableVertexAttribArray(attribLoc)
			gl.vertexAttribPointer(attribLoc, size, gl.FLOAT, false, 0, 0)
		}
	}

	passUniforms(passedData) {
		const gl = this.#gl
		if (this.#program !== gl.getParameter(gl.CURRENT_PROGRAM)) this.use()

		for (const [uniformName, data] of passedData) {
			const location = gl.getUniformLocation(this.#program, uniformName)
			if (location === null) {
				continue
			}

			if (typeof data === 'number') {
				gl.uniform1f(location, data)
			} else if (Number.isInteger(data)) {
				gl.uniform1i(location, data)
			} else if (Array.isArray(data)) {
				switch (data.length) {
					case 1:
						gl.uniform1fv(location, data)
						break
					case 2:
						gl.uniform2fv(location, data)
						break
					case 3:
						gl.uniform3fv(location, data)
						break
					case 4:
						gl.uniform4fv(location, data)
						break
					case 9:
						gl.uniformMatrix3fv(location, false, data)
						break
					case 16:
						gl.uniformMatrix4fv(location, false, data)
						break
					default:
						throw new Error(`Unsupported uniform data length: ${data.length}`)
				}
			} else {
				throw new Error(`Unsupported uniform data type for ${uniformName}`)
			}
		}
	}

	draw(s, n, mode = this.#gl.TRIANGLES) {
		this.#gl.drawArrays(mode, s, n)
	}

	clear(r, g, b, a) {
		const gl = this.#gl
		if (this.#program !== gl.getParameter(gl.CURRENT_PROGRAM)) this.use()
		gl.clearColor(r, g, b, a)
		gl.clear(gl.COLOR_BUFFER_BIT)
	}

	dispose() {
		if (this.#program) this.#gl.deleteProgram(this.#program)
		if (this.vertexShader) this.#gl.deleteShader(this.vertexShader)
		if (this.fragmentShader) this.#gl.deleteShader(this.fragmentShader)
	}
}

export default class WebGLContext {
	constructor(container, options = {}) {
		this.options = Object.assign(
			{
				width: null,
				height: null,
				alpha: true,
				antialias: true,
				preserveDrawingBuffer: false,
				stencil: false,
				depth: true,
				premultipliedAlpha: true,
				autoClear: true
			},
			options
		)
		this.container =
			typeof container === 'string'
				? document.querySelector(container)
				: container

		if (!this.container) {
			throw new Error('Container element not found')
		}

		this.canvas = document.createElement('canvas')
		this.container.appendChild(this.canvas)
		///console.log(this.container)

		this.width = this.options.width || this.container.clientWidth
		this.height = this.options.height || this.container.clientHeight
		this.canvas.width = this.width
		this.canvas.height = this.height

		this.gl =
			this.canvas.getContext('webgl2', {
				alpha: this.options.alpha,
				antialias: this.options.antialias,
				preserveDrawingBuffer: this.options.preserveDrawingBuffer,
				stencil: this.options.stencil,
				depth: this.options.depth,
				premultipliedAlpha: this.options.premultipliedAlpha
			}) || this.canvas.getContext('webgl2')

		if (!this.gl) {
			throw new Error('WebGL not supported')
		}

		this.programs = new Map()

		this._handleResize = this._handleResize.bind(this)
		window.addEventListener('resize', this._handleResize)

		this.gl.enable(this.gl.BLEND)
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)

		if (this.options.depth) {
			this.gl.enable(this.gl.DEPTH_TEST)
		}

		this.animationFrameId = null
	}

	_handleResize() {
		if (this.options.width === null || this.options.height === null) {
			this.width = this.options.width || this.container.clientWidth
			this.height = this.options.height || this.container.clientHeight
			this.canvas.width = this.width
			this.canvas.height = this.height
			this.gl.viewport(0, 0, this.width, this.height)
		}
	}

	async createProgram(name, vertexShaderUrl, fragmentShaderUrl) {
		if (this.programs.has(name)) {
			// prevent recompilation
			return this.programs.get(name)
		}

		const program = new Program(this.gl, vertexShaderUrl, fragmentShaderUrl)
		await program.init()
		this.programs.set(name, program)

		return program
	}

	createBuffer(target, data, usage = this.gl.STATIC_DRAW) {
		const gl = this.gl
		const buffer = gl.createBuffer()

		gl.bindBuffer(target, buffer)
		gl.bufferData(target, data, usage)

		return buffer
	}

	createVertexBuffer(data, usage = this.gl.STATIC_DRAW) {
		return this.createBuffer(this.gl.ARRAY_BUFFER, data, usage)
	}

	createIndexBuffer(data, usage = this.gl.STATIC_DRAW) {
		return this.createBuffer(this.gl.ELEMENT_ARRAY_BUFFER, data, usage)
	}

	createTexture(image, options = {}) {
		const gl = this.gl
		const texture = gl.createTexture()

		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_S,
			options.wrapS || gl.CLAMP_TO_EDGE
		)
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_T,
			options.wrapT || gl.CLAMP_TO_EDGE
		)
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			options.minFilter || gl.LINEAR
		)
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MAG_FILTER,
			options.magFilter || gl.LINEAR
		)

		if (options.generateMipmap !== false) {
			gl.generateMipmap(gl.TEXTURE_2D)
		}

		return texture
	}

	clear(color = [0, 0, 0, 0]) {
		const gl = this.gl
		gl.clearColor(...color)
		gl.clear(
			gl.COLOR_BUFFER_BIT | (this.options.depth ? gl.DEPTH_BUFFER_BIT : 0)
		)
	}

	startRenderLoop(renderCallback) {
		const animate = (time) => {
			if (this.options.autoClear) {
				this.clear()
			}

			renderCallback(time)
			this.animationFrameId = requestAnimationFrame(animate)
		}

		this.animationFrameId = requestAnimationFrame(animate)
	}

	stopRenderLoop() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId)
			this.animationFrameId = null
		}
	}

	destroy() {
		this.stopRenderLoop()
		window.removeEventListener('resize', this._handleResize)

		this.programs.forEach((program) => {
			program.dispose()
		})

		this.programs.clear()

		if (this.canvas.parentNode) {
			this.canvas.parentNode.removeChild(this.canvas)
		}
	}
}
