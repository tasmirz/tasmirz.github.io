/**
 * Base singleton class to reduce code duplication
 */
class BaseSingleton {
	constructor() {
		const className = this.constructor.name
		if (this.constructor.instance) {
			return this.constructor.instance
		}
		this.constructor.instance = this
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new this()
		}
		return this.instance
	}
}

export default BaseSingleton
