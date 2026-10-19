import DataLoader from './data-loader.js'
import BaseSingleton from './base-singleton.js'

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

			const updateCards = () => {
				const projectCards = document.querySelectorAll('.project-card')
				projectCards.forEach((card) => {
					const rect = card.getBoundingClientRect()
					const scrollProgress =
						Math.min(
							Math.max(0, window.innerHeight * 1.1 - rect.top),
							rect.height
						) / rect.height
					const mappedProgress = 0.4 + 0.6 * scrollProgress
					card.style.transform = `translate(${
						window.innerWidth * (1 - mappedProgress)
					}px, ${
						(window.innerHeight / 10) * (1 - mappedProgress)
					}px) scale(${mappedProgress})`
					card.style.opacity = `${mappedProgress}`
					card.style.filter = `blur(${50 * (1 - mappedProgress)}px)`
				})
			}
			window.addEventListener('scroll', updateCards, { passive: true })
			requestAnimationFrame(updateCards)
		} catch (error) {
			this.showState('error', `Error loading projects: ${error.message}`)
		}
	}
}

export default ProjectsLoader
