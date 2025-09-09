function showAlert(message, type = 'info') {
	const alert =
		document.getElementById('contact-alert') ||
		(() => {
			const el = document.createElement('div')
			el.id = 'contact-alert'
			el.className = 'contact-alert'
			const form = document.getElementById('contact-form')
			form.appendChild(el)
			return el
		})()
	alert.textContent = message
	alert.className = `contact-alert ${type}`
	setTimeout(() => {
		alert.textContent = ''
		alert.className = 'contact-alert'
	}, 5000)
}

function validateForm(data) {
	return data.name && data.email && data.subject && data.message
}

function getFormData(form) {
	return {
		name: form.querySelector('#name')?.value.trim() || '',
		email: form.querySelector('#email')?.value.trim() || '',
		subject: form.querySelector('#subject')?.value.trim() || '',
		message: form.querySelector('#message')?.value.trim() || ''
	}
}

function postForm(endpoint, data) {
	const formData = new FormData()
	formData.append('Name', data.name)
	formData.append('Email', data.email)
	formData.append('Subject', data.subject)
	formData.append('Content', data.message)
	return fetch(endpoint, { method: 'POST', body: formData })
}

export default function initContactForm() {
	const form = document.getElementById('contact-form')
	if (!form) return

	form.setAttribute('novalidate', '')
	form.addEventListener('submit', async (e) => {
		e.preventDefault()
		const data = getFormData(form)
		if (!validateForm(data)) {
			showAlert('Please complete all fields.', 'error')
			return
		}
		showAlert('Sending...', 'info')
		Array.from(form.elements).forEach((el) => (el.disabled = true))
		try {
			const endpoint =
				form.getAttribute('data-api') ||
				'http://localhost:5000/api/messages.ashx'
			const res = await postForm(endpoint, data)
			const json = await res.json().catch(() => ({}))
			if (res.ok && json.success) {
				showAlert('Message sent — thank you!', 'success')
				form.reset()
			} else {
				showAlert(json.error || 'Failed to send message.', 'error')
			}
		} catch {
			showAlert('Network error.', 'error')
		}
		Array.from(form.elements).forEach((el) => (el.disabled = false))
	})
}
