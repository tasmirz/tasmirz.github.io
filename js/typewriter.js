export default class TypeWriter {
	constructor(element, text, options = {}) {
		this.element = element
		this.text =
			typeof text === 'string'
				? text
				: Array.isArray(text) && text.length > 0
				? text[0]
				: 'Tasmir Hossain Zihad'
		this.currentCharIndex = 0
		this.timeoutId = null
		this.options = {
			typingDelay: options.typingDelay || options.typingSpeed || 90,
			autoStart: options.autoStart !== undefined ? options.autoStart : false
		}

		if (this.options.autoStart) {
			this.typeFromStart()
		} else {
			this.render()
		}
	}

	typeFromStart() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId)
			this.timeoutId = null
		}
		this.currentCharIndex = 0
		this.render()
		this.step()
	}

	step() {
		if (this.currentCharIndex < this.text.length) {
			this.currentCharIndex++
			this.render()
			this.timeoutId = setTimeout(() => this.step(), this.options.typingDelay)
		}
	}

	render() {
		const visibleText = this.text.substring(0, this.currentCharIndex)
		this.element.innerHTML = `${visibleText}<span class="cursor">|</span>`
	}

	showFull() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId)
			this.timeoutId = null
		}
		this.currentCharIndex = this.text.length
		this.render()
	}

	destroy() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId)
			this.timeoutId = null
		}
	}
}
