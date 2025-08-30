export default function initContactForm() {
	const form = document.getElementById('contact-form')
	if (!form) return

	form.addEventListener('submit', handleFormSubmit)
}

async function handleFormSubmit(e) {
	e.preventDefault()

	const submitBtn = this.querySelector('.submit-btn')
	const originalText = submitBtn.innerHTML
	const formData = new FormData(this)
	const data = Object.fromEntries(formData)

	try {
		setButtonState(submitBtn, 'loading', 'Opening email...')

		const mailtoLink = createMailtoLink(data)
		window.location.href = mailtoLink

		setTimeout(() => {
			setButtonState(submitBtn, 'success', 'Email opened!')
			this.reset()

			// Restore original state after delay
			setTimeout(() => {
				setButtonState(submitBtn, 'default', originalText)
			}, 3000)
		}, 500)
	} catch (error) {
		console.error('Form submission error:', error)
		setButtonState(submitBtn, 'error', 'Error occurred')

		setTimeout(() => {
			setButtonState(submitBtn, 'default', originalText)
		}, 3000)
	}
}

function createMailtoLink(data) {
	const subject = encodeURIComponent(data.subject || 'Contact from Portfolio')
	const body = encodeURIComponent(
		`Hi,\n\nThis is ${data.name}.\n\n${data.message}\n\nBest regards,\n${data.name}\n${data.email}`
	)

	return `mailto:zihad@tuta.io?subject=${subject}&body=${body}`
}

function setButtonState(button, state, text) {
	const icons = {
		loading: 'sync',
		success: 'check',
		error: 'error'
	}

	if (state === 'default') {
		button.innerHTML = text
		button.disabled = false
	} else {
		button.innerHTML = `<span class="material-icons">${icons[state]}</span>${text}`
		button.disabled = state !== 'default'
	}
}
