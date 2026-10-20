import initUI from './ui-events.js?v=20261020-4'
import ProjectsLoader from './projects-loader.js?v=20261020-4'
import SkillsLoader from './skills-loader.js?v=20261020-4'
import ProfileLoader from './profile-loader.js?v=20261020-4'
import WebGLBackground from './webgl-background.js?v=20261020-4'
import WebGLLyf from './webgl-lyf.js?v=20261020-4'
import { setupVideoLoop } from './video-loop.js?v=20261020-4'
import initContactForm from './contact-form.js?v=20261020-4'
initUI()
setupVideoLoop()

document.addEventListener('DOMContentLoaded', async () => {
	setupVideoLoop()
	WebGLBackground.getInstance().init()
	// Load profile data and initialize typewriter
	const profileLoader = ProfileLoader.getInstance()
	await profileLoader.init()
	// Load content sections in parallel
	await Promise.allSettled([
		ProjectsLoader.getInstance().init(),
		SkillsLoader.getInstance().init()
	])

	// Initialize scroll animations

	// Initialize UI components after content loads

	// Initialize WebGL Lyf section
	WebGLLyf.getInstance().init()

	// Initialize quote rotator

	// Initialize progress tracker
	try {
		const ProgressTracker = (await import('./progress-tracker.js')).default
		const progressTracker = ProgressTracker.getInstance()
		progressTracker.init()
		console.log('📊 Progress tracker initialized')
	} catch (error) {
		console.warn('⚠️ Progress tracker initialization failed:', error)
	}

	// Initialize contact form
	initContactForm()
})
