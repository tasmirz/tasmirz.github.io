class QuoteRotator {
	constructor() {
		this.quotes = [
			{
				text: 'The best way to predict the future is to create it.',
				author: 'Peter Drucker'
			},
			{
				text: "Code is like humor. When you have to explain it, it's bad.",
				author: 'Cory House'
			},
			{
				text: 'First, solve the problem. Then, write the code.',
				author: 'John Johnson'
			}
		]

		this.currentIndex = 0
		this.quoteElement = document.getElementById('rotating-quote')
		this.authorElement = document.getElementById('quote-author')
		this.dots = document.querySelectorAll('.dot')

		this.init()
	}

	init() {
		if (!this.quoteElement || !this.authorElement) return

		// Show first quote
		this.showQuote(0)

		// Set up dot click handlers
		this.dots.forEach((dot, index) => {
			dot.addEventListener('click', () => this.showQuote(index))
		})

		// Auto-rotate quotes every 4 seconds
		setInterval(() => {
			this.nextQuote()
		}, 4000)
	}

	showQuote(index) {
		if (index < 0 || index >= this.quotes.length) return

		// Hide current quote
		this.quoteElement.classList.remove('active')
		this.authorElement.classList.remove('active')

		// Update active dot
		this.dots.forEach((dot) => dot.classList.remove('active'))
		this.dots[index]?.classList.add('active')

		// Show new quote after animation
		setTimeout(() => {
			this.quoteElement.textContent = this.quotes[index].text
			this.authorElement.textContent = `— ${this.quotes[index].author}`

			this.quoteElement.classList.add('active')
			this.authorElement.classList.add('active')

			this.currentIndex = index
		}, 250)
	}

	nextQuote() {
		const nextIndex = (this.currentIndex + 1) % this.quotes.length
		this.showQuote(nextIndex)
	}
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new QuoteRotator()
})

export default QuoteRotator
