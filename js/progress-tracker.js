// Progress tracker that integrates with WebGL Lyf and overall page scroll
export default class ProgressTracker {
	static #instance

	constructor() {
		if (ProgressTracker.#instance) return ProgressTracker.#instance

		this.progressBar = null
		this.webglLyf = null
		this.sections = []
		this.currentSection = 0
		this.totalSections = 0

		ProgressTracker.#instance = this
	}

	static getInstance() {
		return ProgressTracker.#instance || new ProgressTracker()
	}

	init() {
		// Get DOM elements
		this.progressBar = document.getElementById('scroll-progress-bar')

		if (!this.progressBar) {
			console.warn('Progress tracker elements not found')
			return
		}

		// Get all sections
		this.sections = Array.from(document.querySelectorAll('main section'))
		this.totalSections = this.sections.length

		// Set up scroll tracking
		this.setupScrollTracking()
		this.setupIntersectionObserver()

		// Initial update
		this.updateProgress()
	}

	setupScrollTracking() {
		let ticking = false

		const updateProgress = () => {
			this.updateProgress()
			ticking = false
		}

		window.addEventListener('scroll', () => {
			if (!ticking) {
				requestAnimationFrame(updateProgress)
				ticking = true
			}
		})
	}

	setupIntersectionObserver() {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const sectionIndex = this.sections.indexOf(entry.target)
						if (sectionIndex !== -1) {
							this.currentSection = sectionIndex
							this.updateProgress()
						}
					}
				})
			},
			{
				threshold: 0.5,
				rootMargin: '-20% 0px -20% 0px'
			}
		)

		this.sections.forEach((section) => observer.observe(section))
	}

	updateProgress() {
		// Calculate overall page progress
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop
		const scrollHeight =
			document.documentElement.scrollHeight - window.innerHeight
		let overallProgress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1)

		// Check if we're in the lyf section and WebGL Lyf is active
		const lyfSection = document.getElementById('lyf')
		if (lyfSection && this.isElementInViewport(lyfSection)) {
			// Try to get WebGL Lyf instance
			if (!this.webglLyf) {
				// Import dynamically to avoid circular dependencies
				import('./webgl-lyf.js')
					.then((module) => {
						this.webglLyf = module.default.getInstance()
					})
					.catch(() => {
						// WebGL not available, continue with regular scroll
					})
			}

			// If WebGL Lyf is available and has scroll progress, use it
			if (this.webglLyf && typeof this.webglLyf.scrollProgress === 'number') {
				// Blend WebGL progress with overall progress for smooth transition
				const lyfSectionProgress = this.webglLyf.scrollProgress
				const sectionWeight = 1 / this.totalSections
				const lyfSectionIndex = this.sections.indexOf(lyfSection)

				// Calculate progress: sections before lyf + lyf section progress + remaining weight
				const progressBeforeLyf = lyfSectionIndex / this.totalSections
				const lyfSectionContribution = lyfSectionProgress * sectionWeight

				overallProgress = progressBeforeLyf + lyfSectionContribution
			}
		}

		// Update progress bar
		const progressPercent = Math.round(overallProgress * 100)
		this.progressBar.style.width = `${progressPercent}%`
	}

	isElementInViewport(element) {
		const rect = element.getBoundingClientRect()
		const windowHeight =
			window.innerHeight || document.documentElement.clientHeight

		// Element is considered in viewport if any part is visible
		return rect.top < windowHeight && rect.bottom > 0
	}

	// Method to manually update progress (can be called by WebGL Lyf)
	notifyProgressChange() {
		this.updateProgress()
	}

	destroy() {
		ProgressTracker.#instance = null
	}
}
