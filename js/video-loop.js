export function setupVideoLoop() {
	const container = document.querySelector('#tree-bg-video')
	if (!container) return
	const video = container.querySelector('video')
	if (!video) return

	let hasBloomed = false

	video.playbackRate = 0.2
	video.muted = true
	video.playsInline = true
	video.loop = false
	video.removeAttribute('loop')
	video.play().catch(() => {})

	const loopLastFrames = () => {
		hasBloomed = true
		video.currentTime = 0.514
		video.play().catch(() => {})
	}

	video.addEventListener('ended', loopLastFrames)

	video.addEventListener('timeupdate', () => {
		if (video.duration && video.currentTime >= video.duration - 0.03) {
			loopLastFrames()
		} else if (hasBloomed && video.currentTime < 0.45) {
			video.currentTime = 0.514
			video.play().catch(() => {})
		}
	})

	const ensurePlaying = () => {
		video.playbackRate = 0.2
		if (hasBloomed && video.currentTime < 0.45) {
			video.currentTime = 0.514
		}
		if (video.paused) {
			video.play().catch(() => {})
		}
	}

	window.addEventListener('click', ensurePlaying, { passive: true })
	window.addEventListener('touchstart', ensurePlaying, { passive: true })
	window.addEventListener('scroll', ensurePlaying, { passive: true })
}
