export function setupVideoLoop() {
	console.log('Setting up video loop')
	const container = document.querySelector('#tree-bg-video')
	if (!container) return
	const video = container.querySelector('video')
	if (!video) return
	video.playbackRate = 0.2
	// play video
	// on ended, loop video
	video.addEventListener('ended', () => {
		// jump to 2 seconds
		video.currentTime = 0.514
		video.play()
	})
	// // pause scroll
	// document.body.style.overflow = 'hidden'
	// document.documentElement.style.overflow = 'hidden'
}
