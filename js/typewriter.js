export default class TypeWriter {
	constructor(element, texts, options = {}) {
		this.element = element
		this.texts = texts
		this.currentTextIndex = 0
		this.currentCharIndex = 0
		this.isDeleting = false
		this.options = {
			typingDelay: options.typingSpeed || 100,
			deletingDelay: options.deletingSpeed || 50,
			pauseBeforeDelete: options.pauseBeforeDelete || 2000,
			pauseBeforeType: options.pauseBeforeType || 500,
			loop: options.loop !== undefined ? options.loop : true
		}
		this.startTyping()
	}

	startTyping() {
		const currentText = this.texts[this.currentTextIndex]
		const typingDelay = this.isDeleting
			? this.options.deletingDelay
			: this.options.typingDelay

		if (this.isDeleting) {
			this.currentCharIndex--
		} else {
			this.currentCharIndex++
		}

		this.element.innerHTML = `${currentText.substring(
			0,
			this.currentCharIndex
		)}<span class="cursor">|</span>` // the last | cursor

		if (!this.isDeleting && this.currentCharIndex === currentText.length) {
			//reached end
			this.isDeleting = true
			setTimeout(() => this.startTyping(), this.options.pauseBeforeDelete)
		} else if (this.isDeleting && this.currentCharIndex === 0) {
			this.isDeleting = false
			this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length

			if (!this.options.loop && this.currentTextIndex === 0) {
				return
			}
			setTimeout(() => this.startTyping(), this.options.pauseBeforeType)
		} else {
			setTimeout(() => this.startTyping(), typingDelay)
		}
	}
}
