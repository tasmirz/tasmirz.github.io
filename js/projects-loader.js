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

		return `
			<div class="project-card">
				<div class="project-image">
					<img src="${image}" alt="${title} project" loading="lazy">
				</div>
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
					const mappedProgress = Math.min(1, Math.max(0, 0.4 + 0.6 * scrollProgress))
					card.style.transform = `translate(${
						window.innerWidth * (1 - mappedProgress)
					}px, ${
						(window.innerHeight / 10) * (1 - mappedProgress)
					}px) scale(${mappedProgress})`
					card.style.opacity = `${mappedProgress}`
					card.style.filter = `blur(${50 * (1 - mappedProgress)}px)`
				})
			}
			window.addEventListener('scroll', updateCards)
			requestAnimationFrame(updateCards)
			const items = document.querySelectorAll('.project-card')
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting && !staticSpace.navJump) {
							entry.target.scrollIntoView({
								behavior: 'smooth',
								block: 'center'
							})
						}
					})
				},
				{ threshold: 0.99 } // adjust when to trigger
			)
		} catch (error) {
			this.showState('error', `Error loading projects: ${error.message}`)
		}
	}
}

export default ProjectsLoader
