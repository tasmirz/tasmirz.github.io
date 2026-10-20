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

	// Loop starts from Frame 16 (0.500s) where tree bloom finishes and sway frames begin
	const LOOP_START_TIME = 0.50

	video.playbackRate = 0.2
	video.muted = true
	video.playsInline = true
	video.loop = false
	video.removeAttribute('loop')

	// Preload into in-memory Blob to guarantee exact zero-latency seeking in all browser engines
	const originalSrc = video.src || video.currentSrc || 'assets/tree_bg.webm'
	fetch(originalSrc)
		.then(res => res.blob())
		.then(blob => {
			const savedTime = video.currentTime
			const wasPlaying = !video.paused
			const blobUrl = URL.createObjectURL(blob)
			video.src = blobUrl
			video.playbackRate = 0.2
			if (savedTime > 0) {
				video.currentTime = savedTime
			}
			if (wasPlaying) {
				video.play().catch(() => {})
			}
		})
		.catch(() => {})

	video.play().catch(() => {})

	const loopLastFrames = () => {
		notifyBloomComplete()
		video.currentTime = LOOP_START_TIME
		video.play().catch(() => {})
	}

	video.addEventListener('ended', loopLastFrames)

	video.addEventListener('timeupdate', () => {
		if (video.duration && video.currentTime >= video.duration - 0.015) {
			loopLastFrames()
		} else if (hasBloomed && video.currentTime < LOOP_START_TIME - 0.05) {
			video.currentTime = LOOP_START_TIME
			video.play().catch(() => {})
		}
	})

	// Fallback in case video fails to autoplay or load
	setTimeout(() => {
		notifyBloomComplete()
	}, 3500)

	const unlock = () => {
		video.playbackRate = 0.2
		if (hasBloomed && video.currentTime < LOOP_START_TIME - 0.05) {
			video.currentTime = LOOP_START_TIME
		}
		if (video.paused) {
			video.play().catch(() => {})
		}
	}
	window.addEventListener('click', unlock, { passive: true })
	window.addEventListener('touchstart', unlock, { passive: true })
	window.addEventListener('scroll', unlock, { passive: true })
}
