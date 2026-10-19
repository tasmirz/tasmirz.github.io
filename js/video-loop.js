export function setupVideoLoop() {
	const container = document.querySelector('#tree-bg-video')
	if (!container) return
	const video = container.querySelector('video')
	if (!video) return

	// Chrome & mobile autoplay requirements
	video.muted = true
	video.defaultMuted = true
	video.playsInline = true
	video.loop = false
	video.removeAttribute('loop')
	video.setAttribute('muted', '')
	video.setAttribute('playsinline', '')
	video.setAttribute('webkit-playsinline', '')

	const startPlayback = () => {
		try {
			video.playbackRate = 0.2
		} catch (_) {}
		const playPromise = video.play()
		if (playPromise !== undefined) {
			playPromise.catch(() => {
				// Fallback if browser requires user interaction
			})
		}
	}

	if (video.readyState >= 2) {
		startPlayback()
	} else {
		video.addEventListener('canplay', startPlayback, { once: true })
		video.addEventListener('loadedmetadata', startPlayback, { once: true })
	}

	// Loop back to seamless point (0.514s) after full animation has completed once
	const loopLastFrames = () => {
		video.currentTime = 0.514
		video.play().catch(() => {})
	}

	video.addEventListener('ended', loopLastFrames)

	// Fallback in case browser doesn't dispatch 'ended' with custom playbackRate
	video.addEventListener('timeupdate', () => {
		if (video.duration && video.currentTime >= video.duration - 0.02) {
			loopLastFrames()
		}
	})

	// User gesture fallback for strict battery saver / data saver modes
	const unlockGesture = () => {
		if (video.paused) {
			video.play().catch(() => {})
		}
	}
	window.addEventListener('click', unlockGesture, { once: true, passive: true })
	window.addEventListener('touchstart', unlockGesture, { once: true, passive: true })
	window.addEventListener('scroll', unlockGesture, { once: true, passive: true })
}
