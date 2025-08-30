export default function initHorizontalScroll() {
	const projectsSection = document.querySelector('#projects')
	const projectsContainer = document.querySelector('.projects-container')

	if (!projectsSection || !projectsContainer) {
		console.log('Projects section not found')
		return
	}

	let ticking = false
	let currentScrollLeft = 0

	function updateProjectsScroll() {
		const sectionRect = projectsSection.getBoundingClientRect()
		const viewportHeight = window.innerHeight
		const sectionHeight = sectionRect.height

		let scrollProgress = 0

		if (sectionRect.top <= 0 && sectionRect.bottom >= viewportHeight) {
			scrollProgress =
				Math.abs(sectionRect.top) / (sectionHeight - viewportHeight)
		} else if (
			sectionRect.top <= viewportHeight * 0.8 &&
			sectionRect.bottom >= viewportHeight * 0.2
		) {
			const visibleTop = Math.max(0, viewportHeight * 0.2 - sectionRect.top)
			const visibleHeight = Math.min(sectionHeight, viewportHeight * 0.6)
			scrollProgress = visibleTop / visibleHeight
		}

		scrollProgress = Math.max(0, Math.min(1, scrollProgress))

		const easedProgress =
			scrollProgress < 0.5
				? 4 * scrollProgress * scrollProgress * scrollProgress
				: 1 - Math.pow(-2 * scrollProgress + 2, 3) / 2

		const maxScroll = Math.max(
			0,
			projectsContainer.scrollWidth - projectsContainer.clientWidth
		)
		const targetScroll = easedProgress * maxScroll

		const scrollDiff = targetScroll - currentScrollLeft
		currentScrollLeft += scrollDiff * 0.1

		projectsContainer.scrollLeft = currentScrollLeft

		ticking = false
	}

	function requestTick() {
		if (!ticking) {
			requestAnimationFrame(updateProjectsScroll)
			ticking = true
		}
	}

	window.addEventListener('scroll', requestTick, { passive: true })
	window.addEventListener('resize', requestTick, { passive: true })

	updateProjectsScroll()

	let scrollHintHidden = false
	function hideScrollHint() {
		if (!scrollHintHidden) {
			const scrollHint = document.querySelector('#projects::after')
			if (scrollHint) {
				scrollHint.style.opacity = '0'
				scrollHintHidden = true
			}
		}
	}

	projectsContainer.addEventListener('scroll', hideScrollHint, { once: true })
	window.addEventListener(
		'scroll',
		() => {
			if (Math.abs(currentScrollLeft) > 10) {
				hideScrollHint()
			}
		},
		{ once: true }
	)

	console.log('Horizontal scroll initialized for projects')
}
