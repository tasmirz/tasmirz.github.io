let isVideoLoopInitialized = false

export function setupVideoLoop() {
	if (isVideoLoopInitialized) return
	isVideoLoopInitialized = true

	const container = document.querySelector('#tree-bg-video')
	if (!container) return
	const video = container.querySelector('video')
	if (!video) return

	let hasBloomed = false

	const notifyBloomComplete = () => {
		if (hasBloomed) return
		hasBloomed = true
		window.__treeBloomComplete = true
		window.dispatchEvent(new CustomEvent('treeBloomComplete'))
	}

	video.playbackRate = 0.2
	video.muted = true
	video.playsInline = true
	video.loop = false
	video.removeAttribute('loop')
	video.play().catch(() => {})

	const loopLastFrames = () => {
		notifyBloomComplete()
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

	// Fallback in case video fails to autoplay or load
	setTimeout(() => {
		notifyBloomComplete()
	}, 3500)

	const unlock = () => {
		video.playbackRate = 0.2
		if (hasBloomed && video.currentTime < 0.45) {
			video.currentTime = 0.514
		}
		if (video.paused) {
			video.play().catch(() => {})
		}
	}
	window.addEventListener('click', unlock, { passive: true })
	window.addEventListener('touchstart', unlock, { passive: true })
	window.addEventListener('scroll', unlock, { passive: true })
}
