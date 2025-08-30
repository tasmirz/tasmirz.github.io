import initUI from './ui-events.js'
import initHorizontalScroll from './horizontal-scroll.js'
import initContactForm from './contact-form.js'
import ProjectsLoader from './projects-loader.js'
import SkillsLoader from './skills-loader.js'
import ProfileLoader from './profile-loader.js'
import WebGLBackground from './webgl-background.js'
import WebGLLyf from './webgl-lyf.js'

initUI()

document.addEventListener('DOMContentLoaded', async () => {
	//WebGLBackground.getInstance().init()
	// Load profile data and initialize typewriter
	const profileLoader = ProfileLoader.getInstance()
	await profileLoader.init()
	// Load content sections in parallel
	await Promise.allSettled([
		ProjectsLoader.getInstance().init(),
		SkillsLoader.getInstance().init()
	])

	// Initialize UI components after content loads
	initHorizontalScroll()
	initContactForm()

	// Initialize WebGL Lyf section
	WebGLLyf.getInstance().init()
})
