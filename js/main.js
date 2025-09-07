import initUI from './ui-events.js'
import ProjectsLoader from './projects-loader.js'
import SkillsLoader from './skills-loader.js'
import ProfileLoader from './profile-loader.js'
import WebGLBackground from './webgl-background.js'
import WebGLLyf from './webgl-lyf.js'
import { setupVideoLoop } from './video-loop.js'
initUI()

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
})
