import DataLoader from './data-loader.js?v=20261021-1'
import BaseSingleton from './base-singleton.js?v=20261021-1'

class ProjectsLoader extends BaseSingleton {
	constructor() {
		super()
		this.projectsContainer = document.querySelector('.projects-container')
	}

	async fetchProjects() {
		return await DataLoader.loadProjects()
	}

	createProjectCard(project) {
		const languages = project.languages || project.Languages || []
		const techTags = languages.map(
			(lang) => `<span class="tech-tag">${lang}</span>`
		).join('')

		// Determine project status
		const status = project.status || 'completed'
		const statusIcon =
			status === 'completed'
				? 'check_circle'
				: status === 'in-progress'
				? 'schedule'
				: 'radio_button_unchecked'

		// Create links section
		const links = []
		const github = project.githubUrl || project.GithubUrl
		if (github) {
			links.push(`<a href="${github}" target="_blank" class="project-link">
				<span class="material-icons">code</span>
				GitHub
			</a>`)
		}
		const live = project.liveUrl || project.LiveUrl
		if (live) {
			links.push(`<a href="${live}" target="_blank" class="project-link">
				<span class="material-icons">launch</span>
				Live Demo
			</a>`)
		}
		const linksHTML = links.join('')
		const image = project.imageUrl || project.ImageUrl || ''
		const title = project.title || project.Title || project.name || project.Name || 'Project'
		const description = project.description || project.Description || ''

		// Process gallery images
		const rawImages = project.images || project.Images || []
		const images = rawImages.map(img => {
			if (typeof img === 'string') {
				let caption = ''
				if (img.includes('hardware')) caption = 'ESP32 Tracker Hardware'
				else if (img.includes('arch')) caption = 'Distributed System Architecture'
				else if (img.includes('3200') || img.includes('dashboard')) caption = 'Live Fleet Dashboard'
				return { url: img, caption }
			}
			return { url: img.url || '', caption: img.caption || '' }
		}).filter(img => img.url)

		if (images.length === 0) {
			const fallbackImg = project.imageUrl || project.ImageUrl || ''
			if (fallbackImg) images.push({ url: fallbackImg, caption: '' })
		}

		let imageHTML = ''
		if (images.length > 1) {
			imageHTML = `
				<div class="project-image-carousel" data-index="0">
					<div class="carousel-track">
						${images.map((img, i) => `
							<div class="carousel-slide ${i === 0 ? 'active' : ''}">
								<img src="${img.url}" alt="${title} - ${img.caption || `View ${i + 1}`}" loading="lazy">
							</div>
						`).join('')}
					</div>
					<button class="carousel-btn prev" type="button" aria-label="Previous view">
						<span class="material-icons">chevron_left</span>
					</button>
					<button class="carousel-btn next" type="button" aria-label="Next view">
						<span class="material-icons">chevron_right</span>
					</button>
					<div class="carousel-footer">
						<div class="carousel-caption">${images[0].caption || ''}</div>
						<div class="carousel-dots">
							${images.map((_, i) => `
								<button class="carousel-dot ${i === 0 ? 'active' : ''}" type="button" data-dot="${i}" aria-label="Slide ${i + 1}"></button>
							`).join('')}
						</div>
					</div>
				</div>
			`
		} else if (images.length === 1) {
			imageHTML = `
				<div class="project-image">
					<img src="${images[0].url}" alt="${title} project" loading="lazy">
				</div>
			`
		}

		return `
			<div class="project-card">
				${imageHTML}
				<div class="project-content">
					<div class="project-meta">
						<div class="project-status ${status}">
							<span class="material-icons">${statusIcon}</span>
							${status.replace('-', ' ')}
						</div>
						<div class="project-links">
							${linksHTML}
						</div>
					</div>
					<h3>${title}</h3>
					<p>${description}</p>
					<div class="project-technologies">${techTags}</div>
				</div>
			</div>
		`
	}

	initCarousels() {
		const carousels = document.querySelectorAll('.project-image-carousel')
		carousels.forEach((carousel) => {
			const slides = carousel.querySelectorAll('.carousel-slide')
			const dots = carousel.querySelectorAll('.carousel-dot')
			const captionEl = carousel.querySelector('.carousel-caption')
			const prevBtn = carousel.querySelector('.carousel-btn.prev')
			const nextBtn = carousel.querySelector('.carousel-btn.next')
			const total = slides.length
			let currentIndex = 0

			const updateSlide = (newIndex) => {
				currentIndex = (newIndex + total) % total
				carousel.setAttribute('data-index', currentIndex)
				slides.forEach((slide, i) => {
					slide.classList.toggle('active', i === currentIndex)
				})
				dots.forEach((dot, i) => {
					dot.classList.toggle('active', i === currentIndex)
				})
				const activeImg = slides[currentIndex]?.querySelector('img')
				const alt = activeImg?.getAttribute('alt') || ''
				const caption = alt.includes(' - ') ? alt.split(' - ')[1] : ''
				if (captionEl) captionEl.textContent = caption
			}

			if (prevBtn) {
				prevBtn.addEventListener('click', (e) => {
					e.stopPropagation()
					updateSlide(currentIndex - 1)
				})
			}
			if (nextBtn) {
				nextBtn.addEventListener('click', (e) => {
					e.stopPropagation()
					updateSlide(currentIndex + 1)
				})
			}
			dots.forEach((dot, idx) => {
				dot.addEventListener('click', (e) => {
					e.stopPropagation()
					updateSlide(idx)
				})
			})

			// Touch swipe gestures
			let touchStartX = 0
			let touchStartY = 0
			carousel.addEventListener('touchstart', (e) => {
				touchStartX = e.touches[0].clientX
				touchStartY = e.touches[0].clientY
			}, { passive: true })

			carousel.addEventListener('touchend', (e) => {
				const touchEndX = e.changedTouches[0].clientX
				const touchEndY = e.changedTouches[0].clientY
				const diffX = touchEndX - touchStartX
				const diffY = touchEndY - touchStartY
				if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
					if (diffX < 0) {
						updateSlide(currentIndex + 1)
					} else {
						updateSlide(currentIndex - 1)
					}
				}
			}, { passive: true })
		})
	}

	renderProjects(projects) {
		if (!this.projectsContainer) {
			console.error('Projects container not found')
			return
		}

		if (!projects || projects.length === 0) {
			this.showState('error', 'No projects found.')
			return
		}

		const projectsHTML = projects
			.map((project) => this.createProjectCard(project))
			.join('')
		this.projectsContainer.innerHTML = projectsHTML
		this.initCarousels()
	}

	showState(type, message) {
		if (!this.projectsContainer) return

		this.projectsContainer.innerHTML = `
            <div class="${type}-message">
                <p>${message}</p>
            </div>
        `
	}

	async init() {
		this.showState('loading', 'Loading projects...')

		try {
			const projects = await this.fetchProjects()

			if (!projects) {
				this.showState('error', 'Failed to load projects data')
				return
			}

			this.renderProjects(projects)

			const projectsSection = document.getElementById('projects')
			const projectCards = document.querySelectorAll('.project-card')
			const N = projectCards.length

			if (projectsSection && N > 0) {
				// Height ensures comfortable scroll distance per project card
				projectsSection.style.minHeight = `calc(100vh + ${(N - 1) * 85}vh)`
			}

			const updateCards = () => {
				if (!projectsSection || N === 0) return

				const rect = projectsSection.getBoundingClientRect()
				const vh = window.innerHeight
				const vw = window.innerWidth
				const totalScroll = projectsSection.offsetHeight - vh

				if (totalScroll <= 0) return

				const stickyOffset = 60
				const scrolled = stickyOffset - rect.top
				const p = Math.max(0, Math.min(1, scrolled / totalScroll))

				// Landscape desktop: width >= 768 AND width > height
				// Portrait: any screen where height >= width, or width < 768 (mobile / tablet portrait)
				const isLandscapeDesktop = (vw >= 768) && (vw > vh)
				const isPortrait = !isLandscapeDesktop

				const cardWidth = projectCards[0]?.offsetWidth || 520
				const cardHeight = projectCards[0]?.offsetHeight || 300

				const gapX = 32
				const stepDistanceX = cardWidth + gapX
				const stepDistanceY = Math.max(cardHeight + 20, vh * 0.65)

				const rawPhase = p * (N - 1)
				const k = Math.floor(rawPhase)
				const frac = rawPhase - k

				// Dwell comfortably at each card, then smoothly transition to next
				let cardPhase = rawPhase
				if (k < N - 1) {
					if (frac <= 0.2) {
						cardPhase = k
					} else if (frac >= 0.8) {
						cardPhase = k + 1
					} else {
						const t = (frac - 0.2) / 0.6
						const smoothT = t * t * (3 - 2 * t)
						cardPhase = k + smoothT
					}
				}

				projectCards.forEach((card, i) => {
					const diff = i - cardPhase
					const absDiff = Math.abs(diff)

					let transform
					if (isPortrait) {
						// Vertical scrolling motion for portrait / mobile
						const translateY = diff * stepDistanceY
						transform = `translate3d(0px, ${translateY}px, 0)`
					} else {
						// Horizontal scrolling motion for landscape desktop
						const translateX = diff * stepDistanceX
						transform = `translate3d(${translateX}px, 0px, 0)`
					}

					if (absDiff <= 0.25) {
						// Centered reading & interaction zone
						card.style.transform = transform
						card.style.opacity = '1'
						card.style.filter = 'none'
						card.style.pointerEvents = 'auto'
						card.style.zIndex = '5'
					} else if (absDiff <= 1.25) {
						// Adjacent cards coming / going
						const fade = Math.min(1, (absDiff - 0.25) / 1.0)
						const opacity = 1 - 0.55 * fade
						const blur = 8 * fade

						card.style.transform = transform
						card.style.opacity = `${opacity}`
						card.style.filter = blur > 0.5 ? `blur(${blur}px)` : 'none'
						card.style.pointerEvents = 'none'
						card.style.zIndex = '3'
					} else {
						// Beyond adjacent cards
						card.style.transform = transform
						card.style.opacity = '0'
						card.style.filter = 'blur(20px)'
						card.style.pointerEvents = 'none'
						card.style.zIndex = '1'
					}
				})
			}
			window.addEventListener('scroll', updateCards, { passive: true })
			window.addEventListener('resize', updateCards, { passive: true })
			window.addEventListener('orientationchange', updateCards, { passive: true })
			const portraitQuery = window.matchMedia('(orientation: portrait)')
			if (portraitQuery.addEventListener) {
				portraitQuery.addEventListener('change', updateCards)
			}
			requestAnimationFrame(updateCards)
		} catch (error) {
			this.showState('error', `Error loading projects: ${error.message}`)
		}
	}
}

export default ProjectsLoader
