import DataLoader from './data-loader.js'
import TypeWriter from './typewriter.js'

class ProfileLoader {
	constructor() {
		if (ProfileLoader.instance) {
			return ProfileLoader.instance
		}

		this.apiUrl = 'http://localhost:5000/Profile.aspx'

		ProfileLoader.instance = this
	}

	static getInstance() {
		if (!ProfileLoader.instance) {
			ProfileLoader.instance = new ProfileLoader()
		}
		return ProfileLoader.instance
	}

	async fetchProfile() {
		return await DataLoader.loadProfile()
	}

	updateProfileElements(profileData) {
		if (!profileData) return

		const updates = [
			{
				selector: '.subtitle',
				property: 'textContent',
				value: profileData.title
			},
			{
				selector: '.email-text',
				property: 'textContent',
				value: profileData.email
			},
			{
				selector: '.email-text',
				property: 'href',
				value: `mailto:${profileData.email}`
			},
			{
				selector: '.contact-item span:last-child',
				property: 'textContent',
				value: profileData.location
			},
			{
				selector: '.contact-info p',
				property: 'textContent',
				value: profileData.aboutDescription
			},
			{
				selector: '.footer-section h4',
				property: 'textContent',
				value: profileData.name
			},
			{
				selector: '.footer-section p',
				property: 'textContent',
				value: profileData.bio
			}
		]

		updates.forEach(({ selector, property, value }) => {
			const element = document.querySelector(selector)
			if (element && value) element[property] = value
		})

		// Update social links
		this.updateSocialLinks(profileData.social)

		// Update footer copyright
		const footerCopyright = document.querySelector('.footer-bottom p')
		if (footerCopyright && profileData.name) {
			footerCopyright.innerHTML = `&copy; 2025 ${profileData.name}. All rights reserved.`
		}
	}

	updateSocialLinks(social) {
		if (!social) return

		const socialLinks = [
			{ selector: '.social-btn.github', href: social.github },
			{ selector: '.social-btn.linkedin', href: social.linkedin },
			{ selector: '.footer-social-link[href*="github"]', href: social.github },
			{
				selector: '.footer-social-link[href*="linkedin"]',
				href: social.linkedin
			}
		]

		socialLinks.forEach(({ selector, href }) => {
			const element = document.querySelector(selector)
			if (element && href) element.href = href
		})
	}

	initTypewriter(profileData) {
		const typewriterElement = document.getElementById('typewriter')
		if (!typewriterElement) {
			console.warn('Typewriter element not found')
			return
		}

		const texts = profileData?.typewriterTexts || ['Tasmir Hossain Zihad']

		if (!texts || texts.length === 0) {
			console.warn('No typewriter texts available')
			typewriterElement.textContent = 'Tasmir Hossain Zihad'
			return
		}

		const typewriter = new TypeWriter(typewriterElement, texts, {
			typingDelay: 100,
			pauseBeforeDelete: 5000,
			loop: true
		})

		typewriterElement.typewriterInstance = typewriter
	}

	showState(type, message) {
		if (type === 'loading') {
			console.log('ProfileLoader:', message)
		} else if (type === 'error') {
			console.error('ProfileLoader:', message)
		}
	}

	async init() {
		this.showState('loading', 'Loading profile data...')

		try {
			const profileData = await this.fetchProfile()

			if (!profileData) {
				this.showState('error', 'Failed to load profile data')
				return null
			}

			this.updateProfileElements(profileData)
			this.initTypewriter(profileData)
			return profileData
		} catch (error) {
			this.showState('error', `Error loading profile: ${error.message}`)
			return null
		}
	}
}

export default ProfileLoader
