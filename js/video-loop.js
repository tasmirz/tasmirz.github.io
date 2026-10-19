export function setupVideoLoop() {
	const container = document.querySelector('#tree-bg-video')
	if (!container) return
	const video = container.querySelector('video')
	if (!video) return

	video.playbackRate = 0.2
	video.muted = true
	video.playsInline = true
	video.play().catch(() => {})

	// on ended, loop video on last frames
	video.addEventListener('ended', () => {
		video.currentTime = 0.514
		video.play().catch(() => {})
	})

	const unlock = () => {
		if (video.paused) {
			video.play().catch(() => {})
		}
	}
	window.addEventListener('click', unlock, { once: true, passive: true })
	window.addEventListener('touchstart', unlock, { once: true, passive: true })
	window.addEventListener('scroll', unlock, { once: true, passive: true })
}
