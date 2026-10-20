export const initThemeToggle = () => {
	const themeToggle = document.getElementById('theme-toggle')
	const themeIcon = document.getElementById('theme-icon')
	if (!themeToggle || !themeIcon) return

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

	// Ensure default is auto for users on first visit or migration
	if (!localStorage.getItem('theme_initialized_v2')) {
		localStorage.setItem('theme', 'auto')
		localStorage.setItem('theme_initialized_v2', 'true')
	}

	const getSavedMode = () => {
		const saved = localStorage.getItem('theme')
		if (saved === 'dark' || saved === 'light') {
			return saved
		}
		return 'auto'
	}

	const updateThemeColorMeta = (isDark) => {
		const metaThemeColor = document.querySelector('meta[name="theme-color"]')
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', isDark ? '#282828' : '#fbf1c7')
		}
	}

	const applyTheme = (mode, save = true) => {
		const prefersDark = mediaQuery.matches
		const effectiveTheme = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode
		const isDark = effectiveTheme === 'dark'

		if (isDark) {
			document.documentElement.setAttribute('data-theme', 'dark')
			if (document.body) document.body.setAttribute('data-theme', 'dark')
		} else {
			document.documentElement.setAttribute('data-theme', 'light')
			if (document.body) document.body.removeAttribute('data-theme')
		}

		updateThemeColorMeta(isDark)

		if (mode === 'auto') {
			themeIcon.textContent = 'brightness_auto'
			const label = `Theme: Auto (${effectiveTheme})`
			themeToggle.setAttribute('title', `${label} - click to change`)
			themeToggle.setAttribute('aria-label', label)
		} else if (mode === 'dark') {
			themeIcon.textContent = 'dark_mode'
			const label = 'Theme: Dark'
			themeToggle.setAttribute('title', `${label} - click to change`)
			themeToggle.setAttribute('aria-label', label)
		} else {
			themeIcon.textContent = 'light_mode'
			const label = 'Theme: Light'
			themeToggle.setAttribute('title', `${label} - click to change`)
			themeToggle.setAttribute('aria-label', label)
		}

		if (save) {
			localStorage.setItem('theme', mode)
		}
	}

	// Apply current mode without re-saving
	applyTheme(getSavedMode(), false)

	// Instantly update when system theme changes if in auto mode
	const handleSystemThemeChange = () => {
		if (getSavedMode() === 'auto') {
			applyTheme('auto', false)
		}
	}

	if (mediaQuery.addEventListener) {
		mediaQuery.addEventListener('change', handleSystemThemeChange)
	} else if (mediaQuery.addListener) {
		mediaQuery.addListener(handleSystemThemeChange)
	}

	// Cycle through auto -> opposite of system -> system -> auto
	themeToggle.addEventListener('click', () => {
		const prefersDark = mediaQuery.matches
		const currentMode = getSavedMode()
		let nextMode

		if (currentMode === 'auto') {
			// Switch to opposite of system theme for instant visual feedback
			nextMode = prefersDark ? 'light' : 'dark'
		} else if (currentMode === (prefersDark ? 'light' : 'dark')) {
			// Switch to same as system theme
			nextMode = prefersDark ? 'dark' : 'light'
		} else {
			// Cycle back to auto
			nextMode = 'auto'
		}

		applyTheme(nextMode, true)
	})
}

export const initMobileMenu = () => {
	const hamburgerMenu = document.getElementById('hamburger-menu')
	const mobileNavOverlay = document.getElementById('mobile-nav-overlay')
	const nav = document.querySelector('nav')

	if (!hamburgerMenu || !nav || !mobileNavOverlay) return

	mobileNavOverlay.innerHTML = nav.innerHTML
	const navMenu = mobileNavOverlay.querySelector('#nav-menu')
	navMenu.id = 'mobile-nav-menu'

	const menuIcon = hamburgerMenu.querySelector('#menu-icon')
	const mobileMediaQuery = window.matchMedia('(max-width: 480px)')

	const navLinks = navMenu.querySelectorAll('a')
	navLinks.forEach((link) => {
		link.addEventListener('click', () => {
			if (mobileMediaQuery.matches) {
				toggleMenu(false)
			}
		})
	})

	const toggleMenu = (isActive) => {
		// Only apply these effects if we're in mobile mode
		if (mobileMediaQuery.matches) {
			if (isActive) {
				navMenu.classList.add('active')
				navMenu.style.opacity = '1'
				mobileNavOverlay.classList.remove('hidden')
				mobileNavOverlay.classList.add('mobile-active')
				menuIcon.textContent = 'close'
				mobileNavOverlay.style.pointerEvents = 'all'
				navMenu.style.pointerEvents = 'all'
				mobileNavOverlay.style.opacity = '1'
			} else {
				navMenu.classList.remove('active')
				navMenu.style.opacity = '0'
				mobileNavOverlay.classList.add('hidden')
				mobileNavOverlay.classList.remove('mobile-active')
				menuIcon.textContent = 'menu'
				mobileNavOverlay.style.pointerEvents = 'none'
				navMenu.style.pointerEvents = 'none'
				mobileNavOverlay.style.opacity = '0'
			}
			//document.body.style.overflow = isActive ? 'hidden' : ''
		}
	}

	const setMobileState = (skipAnimation = false) => {
		if (skipAnimation) {
			navMenu.style.transition = 'none'
			nav.style.transition = 'none'
		}

		// Initialize mobile menu as hidden
		toggleMenu(false)
		hamburgerMenu.style.display = 'flex'

		// Only in mobile mode we control pointer events and opacity
		if (mobileMediaQuery.matches) {
			navMenu.style.pointerEvents = 'none'
			navMenu.style.opacity = '0'
		}

		if (skipAnimation) {
			void navMenu.offsetWidth
			void nav.offsetWidth
			// Restore transition after a short delay
			setTimeout(() => {
				navMenu.style.transition = ''
				nav.style.transition = ''
			}, 10)
		}
	}

	const setDesktopState = () => {
		toggleMenu(false)
		hamburgerMenu.style.display = 'none'

		// Ensure desktop nav is always visible
		navMenu.style.pointerEvents = 'all'
		navMenu.style.opacity = '1'
		nav.classList.remove('mobile-active')
		document.body.style.overflow = ''
	}

	handleViewportChange(mobileMediaQuery, true)

	mobileMediaQuery.addEventListener('change', (e) =>
		handleViewportChange(e, false)
	)

	function handleViewportChange(e, isInitialLoad = false) {
		if (e.matches) {
			setMobileState(!isInitialLoad)
		} else {
			setDesktopState()
		}
	}

	hamburgerMenu.addEventListener('click', () => {
		//console.log(mobileNavOverlay)
		const isActive = !mobileNavOverlay.classList.contains('mobile-active')
		toggleMenu(isActive)
	})

	navMenu.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', () => toggleMenu(false))
	})
}

export default function initUI() {
	initThemeToggle()
	initMobileMenu()
}
