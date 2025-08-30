import DataLoader from './data-loader.js'

class ProjectsLoader {
	constructor() {
		if (ProjectsLoader.instance) {
			return ProjectsLoader.instance
		}

		this.projectsContainer = document.querySelector('.projects-container')
		this.apiUrl = 'http://localhost:5000/Projects.aspx'

		ProjectsLoader.instance = this
	}

	static getInstance() {
		if (!ProjectsLoader.instance) {
			ProjectsLoader.instance = new ProjectsLoader()
		}
		return ProjectsLoader.instance
	}

	async fetchProjects() {
		return await DataLoader.loadProjects()
	}

	createProjectCard(project) {
		const techTags = project.languages
			.map((lang) => `<span class="tech-tag">${lang}</span>`)
			.join('')

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
		if (project.githubUrl) {
			links.push(`<a href="${project.githubUrl}" target="_blank" class="project-link">
				<span class="material-icons">code</span>
				GitHub
			</a>`)
		}
		if (project.liveUrl) {
			links.push(`<a href="${project.liveUrl}" target="_blank" class="project-link">
				<span class="material-icons">launch</span>
				Live Demo
			</a>`)
		}
		const linksHTML = links.join('')

		return `
			<div class="project-card">
				<div class="project-image">
					<img src="${project.imageUrl}" alt="${project.name} project" loading="lazy">
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
					<h3>${project.name}</h3>
					<p>${project.description}</p>
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
		} catch (error) {
			this.showState('error', `Error loading projects: ${error.message}`)
		}
	}
}

export default ProjectsLoader
