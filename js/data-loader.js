/**
 * DataLoader - A client for fetching live portfolio content from Sanity CMS
 * Project: ooipgfky | Dataset: production
 */
class DataLoader {
	static SANITY_PROJECT_ID = 'ooipgfky'
	static SANITY_DATASET = 'production'
	static SANITY_API_VERSION = 'v2021-10-21'

	static get queryUrl() {
		return `https://${this.SANITY_PROJECT_ID}.apicdn.sanity.io/${this.SANITY_API_VERSION}/data/query/${this.SANITY_DATASET}`
	}

	/**
	 * Queries Sanity CDN using GROQ
	 * @param {string} groqQuery - The GROQ query string
	 * @returns {Promise<any>} The parsed result
	 */
	static async querySanity(groqQuery) {
		try {
			const encodedQuery = encodeURIComponent(groqQuery)
			const url = `${this.queryUrl}?query=${encodedQuery}`
			const response = await fetch(url)
			if (!response.ok) {
				throw new Error(`Sanity query error: ${response.status} ${response.statusText}`)
			}
			const json = await response.json()
			return json.result
		} catch (error) {
			console.error(`DataLoader error executing query [${groqQuery}]:`, error)
			return null
		}
	}

	/**
	 * Loads profile data from Sanity
	 * @returns {Promise<Object|null>} Profile data
	 */
	static async loadProfile() {
		return await this.querySanity('*[_type == "profile"][0]')
	}

	/**
	 * Loads projects data from Sanity
	 * @returns {Promise<Array>} Projects array ordered by display rank
	 */
	static async loadProjects() {
		const projects = await this.querySanity('*[_type == "project"] | order(order asc)')
		return projects || []
	}

	/**
	 * Loads skills categories from Sanity
	 * @returns {Promise<Array>} Skill categories array ordered by display rank
	 */
	static async loadSkills() {
		const categories = await this.querySanity('*[_type == "skillCategory"] | order(order asc)')
		return categories || []
	}
}

export default DataLoader
