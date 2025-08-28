import DataLoader from './data-loader.js';

class SkillsLoader {
    constructor() {
        if (SkillsLoader.instance) {
            return SkillsLoader.instance;
        }
        
        this.skillsContainer = document.querySelector('.skills-section');
        this.apiUrl = 'http://localhost:5000/Skills.aspx';
        
        SkillsLoader.instance = this;
    }

    static getInstance() {
        if (!SkillsLoader.instance) {
            SkillsLoader.instance = new SkillsLoader();
        }
        return SkillsLoader.instance;
    }

    async fetchSkills() {
        return await DataLoader.loadSkills();
    }

    createSkillCategoryHTML(category) {
        const skillTags = category.skills
            .map(skill => `<span class="skill-tag">${skill}</span>`)
            .join(' ');

        return `
            <div class="skill-category">
                <h4>${category.name}</h4>
                <div class="skill-tags">${skillTags}</div>
            </div>
        `;
    }

    displayState(type, content) {
        if (!this.skillsContainer) {
            console.error('Skills container not found');
            return;
        }

        let htmlContent;
        
        if (type === 'skills' && Array.isArray(content) && content.length > 0) {
            const skillsHTML = content.map(category => this.createSkillCategoryHTML(category)).join('');
            htmlContent = `<h3>Skills</h3>${skillsHTML}`;
        } else if (type === 'skills' && (!content || content.length === 0)) {
            htmlContent = `
                <h3>Skills</h3>
                <div class="error-message">
                    <p>No skills found.</p>
                </div>
            `;
        } else {
            htmlContent = `
                <h3>Skills</h3>
                <div class="${type}-message">
                    <p>${content}</p>
                </div>
            `;
        }

        this.skillsContainer.innerHTML = htmlContent;
    }

    async init() {
        this.displayState('loading', 'Loading skills...');
        const skillCategories = await this.fetchSkills();
        this.displayState('skills', skillCategories);
    }
}

export default SkillsLoader;
