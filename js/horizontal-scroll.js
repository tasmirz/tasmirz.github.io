/**
 * Horizontal scroll functionality for projects section
 */
export default function initHorizontalScroll() {
	const projectsContainer = document.querySelector('.projects-container')
	const projectsSection = document.querySelector('#projects')

	if (!projectsContainer || !projectsSection) return

	let isInProjectsSection = false
	let scrollTimer = null

	function resetScrollPosition() {
		projectsContainer.scrollLeft = 0
	}

	function isAtScrollBoundary(deltaY) {
		const maxScroll =
			projectsContainer.scrollWidth - projectsContainer.clientWidth
		const currentScroll = projectsContainer.scrollLeft

		if (deltaY < 0 && currentScroll <= 0) {
			return true
		}

		if (deltaY > 0 && currentScroll >= maxScroll) {
			return true
		}

		return false
	}

	projectsSection.addEventListener('mouseenter', () => {
		isInProjectsSection = true
		resetScrollPosition()
	})

	projectsSection.addEventListener('mouseleave', () => {
		isInProjectsSection = false
		document.body.style.overflow = 'auto'
	})

	document.addEventListener(
		'wheel',
		(e) => {
			if (isInProjectsSection) {
				if (isAtScrollBoundary(e.deltaY)) {
					document.body.style.overflow = 'auto'
					return
				}

				e.preventDefault()
				e.stopPropagation()
				e.stopImmediatePropagation()

				document.body.style.overflow = 'hidden'

				const scrollAmount = e.deltaY * 2

				projectsContainer.scrollLeft += scrollAmount

				if (scrollTimer) {
					clearTimeout(scrollTimer)
				}

				scrollTimer = setTimeout(() => {
					if (isInProjectsSection) {
						const maxScroll =
							projectsContainer.scrollWidth - projectsContainer.clientWidth
						const currentScroll = projectsContainer.scrollLeft

						if (currentScroll > 0 && currentScroll < maxScroll) {
							document.body.style.overflow = 'hidden'
						} else {
							document.body.style.overflow = 'auto'
						}
					}
				}, 150)

				return false
			}
		},
		{ passive: false, capture: true }
	)

	let isDown = false
	let startX
	let scrollLeft

	projectsContainer.addEventListener('mousedown', (e) => {
		isDown = true
		projectsContainer.style.cursor = 'grabbing'
		startX = e.pageX - projectsContainer.offsetLeft
		scrollLeft = projectsContainer.scrollLeft
	})

	projectsContainer.addEventListener('mouseleave', () => {
		isDown = false
		projectsContainer.style.cursor = 'grab'
	})

	projectsContainer.addEventListener('mouseup', () => {
		isDown = false
		projectsContainer.style.cursor = 'grab'
	})

	projectsContainer.addEventListener('mousemove', (e) => {
		if (!isDown) return
		e.preventDefault()
		const x = e.pageX - projectsContainer.offsetLeft
		const walk = (x - startX) * 2
		projectsContainer.scrollLeft = scrollLeft - walk
	})

	projectsContainer.style.cursor = 'grab'
}
