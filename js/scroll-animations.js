/**
 * Scroll-triggered animations for project cards in horizontal layout
 * Cards animate from left as they come into view during horizontal scroll
 */

export default function initScrollAnimations() {
	// Check if CSS animation-timeline is supported
	if (CSS.supports('animation-timeline', 'view()')) {
		console.log('CSS animation-timeline supported, using native CSS animations')
		return
	}

	console.log('Using JavaScript fallback for scroll animations')

	const projectsContainer = document.querySelector('.projects-container')
	if (!projectsContainer) {
		console.log('Projects container not found')
		return
	}

	const observerOptions = {
		root: projectsContainer, // Use the horizontal scroll container as root
		rootMargin: '-10% 0px -10% 0px',
		threshold: [0, 0.1, 0.3, 0.5]
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
				// Add animation class when element comes into view horizontally
				entry.target.classList.add('animate-in')
			} else {
				// Remove animation class when element goes out of view
				// This allows re-animation when scrolling back
				entry.target.classList.remove('animate-in')
			}
		})
	}, observerOptions)

	// Function to setup observers for project cards
	function setupCardObservers() {
		const projectCards = document.querySelectorAll('.project-card')
		projectCards.forEach((card, index) => {
			// Reset animation state
			card.classList.remove('animate-in')
			// Add staggered delay for smoother effect
			card.style.transitionDelay = `${index * 0.1}s`
			observer.observe(card)
		})
	}

	// Initial setup
	setupCardObservers()

	// Re-setup when projects are loaded dynamically
	const projectsObserver = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
				// New project cards were added, setup observers
				setTimeout(setupCardObservers, 100)
			}
		})
	})

	projectsObserver.observe(projectsContainer, {
		childList: true,
		subtree: true
	})
}
