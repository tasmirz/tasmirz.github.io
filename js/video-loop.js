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

	const LOOP_START_TIME = 0.50

	video.playbackRate = 0.2
	video.muted = true
	video.playsInline = true
	video.loop = false
	video.removeAttribute('loop')
	video.play().catch(() => {})

	const loopLastFrames = () => {
		notifyBloomComplete()
		video.currentTime = LOOP_START_TIME
		video.play().catch(() => {})
	}

	video.addEventListener('ended', loopLastFrames)

	video.addEventListener('timeupdate', () => {
		if (video.currentTime >= LOOP_START_TIME) {
			notifyBloomComplete()
		}
	})

	const unlock = () => {
		video.playbackRate = 0.2
		if (video.paused) {
			video.play().catch(() => {})
		}
	}
	window.addEventListener('click', unlock, { passive: true })
	window.addEventListener('touchstart', unlock, { passive: true })
	window.addEventListener('scroll', unlock, { passive: true })
}
