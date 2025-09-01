import DataLoader from './data-loader.js'
import BaseSingleton from './base-singleton.js'

class SkillsLoader extends BaseSingleton {
	constructor() {
		super()
		this.skillsContainer = document.querySelector('.skills-section')
		this.apiUrl = 'http://localhost:5000/Skills.aspx'
	}

	async fetchSkills() {
		return await DataLoader.loadSkills()
	}

	createSkillCategoryHTML(category) {
		const skillTags = category.skills
			.map((skill) => `<span class="skill-tag">${skill}</span>`)
			.join(' ')

		return `
            <div class="skill-category">
                <h4>${category.name}</h4>
                <div class="skill-tags">${skillTags}</div>
            </div>
        `
	}

	displayState(type, content) {
		if (!this.skillsContainer) {
			console.error('Skills container not found')
			return
		}

		let htmlContent

		if (type === 'skills' && Array.isArray(content) && content.length > 0) {
			const skillsHTML = content
				.map((category) => this.createSkillCategoryHTML(category))
				.join('')
			htmlContent = `<h3>Skills</h3>${skillsHTML}`
		} else if (type === 'skills' && (!content || content.length === 0)) {
			htmlContent = `
                <h3>Skills</h3>
                <div class="error-message">
                    <p>No skills found.</p>
                </div>
            `
		} else {
			htmlContent = `
                <h3>Skills</h3>
                <div class="${type}-message">
                    <p>${content}</p>
                </div>
            `
		}

		this.skillsContainer.innerHTML = htmlContent
	}

	async init() {
		this.displayState('loading', 'Loading skills...')

		try {
			const skillCategories = await this.fetchSkills()

			if (!skillCategories) {
				this.displayState('error', 'Failed to load skills data')
				return
			}

			this.displayState('skills', skillCategories)
		} catch (error) {
			this.displayState('error', `Error loading skills: ${error.message}`)
		}
	}
}

export default SkillsLoader
