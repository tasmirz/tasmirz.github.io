export const initThemeToggle = () => {
	const themeToggle = document.getElementById('theme-toggle')
	const themeIcon = document.getElementById('theme-icon')
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

	if (!themeToggle || !themeIcon) return

	const setTheme = (theme) => {
		if (theme === 'dark') {
			document.body.setAttribute('data-theme', 'dark')
			themeIcon.textContent = 'dark_mode'
		} else {
			document.body.removeAttribute('data-theme')
			themeIcon.textContent = 'light_mode'
		}
		localStorage.setItem('theme', theme)
	}

	const savedTheme = localStorage.getItem('theme')
	setTheme(savedTheme || (prefersDark ? 'dark' : 'light'))

	themeToggle.addEventListener('click', () => {
		const isDark = document.body.getAttribute('data-theme') === 'dark'
		setTheme(isDark ? 'light' : 'dark')
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
			console.log(isActive)
			if (isActive) {
				navMenu.classList.add('active')
				navMenu.style.opacity = '1'
				mobileNavOverlay.classList.remove('hidden')
				mobileNavOverlay.classList.add('mobile-active')
				menuIcon.textContent = 'close'
				mobileNavOverlay.style.pointerEvents = 'all'
				navMenu.style.pointerEvents = 'all'
				mobileNavOverlay.style.opacity = '1'
				document.querySelector('#tree-bg-video').style.mixBlendMode =
					'unset !important'
			} else {
				navMenu.classList.remove('active')
				navMenu.style.opacity = '0'
				mobileNavOverlay.classList.add('hidden')
				mobileNavOverlay.classList.remove('mobile-active')
				menuIcon.textContent = 'menu'
				mobileNavOverlay.style.pointerEvents = 'none'
				navMenu.style.pointerEvents = 'none'
				mobileNavOverlay.style.opacity = '0'
				document.querySelector('#tree-bg-video').style.mixBlendMode = 'normal'
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
