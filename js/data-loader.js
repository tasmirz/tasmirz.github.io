/**
 * DataLoader - A utility class for loading data with automatic fallback to static JSON files
 * when XHR requests fail.
 */
class DataLoader {
  /**
   * Loads data from a primary URL with fallback to static JSON
   * @param {string} primaryUrl - The primary API endpoint
   * @param {string} fallbackUrl - The static JSON file path
   * @param {string} dataKey - Optional key to extract from response (e.g., 'projects', 'skillCategories')
   * @returns {Promise<any>} The loaded data or null if both fail
   */
  static async loadWithFallback(primaryUrl, fallbackUrl, dataKey = null) {
    // Try primary URL first
    try {
      console.log(`Attempting to load data from: ${primaryUrl}`);
      const response = await fetch(primaryUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log(`Successfully loaded data from: ${primaryUrl}`);
      return dataKey ? data[dataKey] : data;
    } catch (error) {
      console.error(`Error fetching from primary URL (${primaryUrl}):`, error);
    }

    // Fallback to static JSON
    try {
      console.log(`Attempting to load fallback data from: ${fallbackUrl}`);
      const response = await fetch(fallbackUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log(`Successfully loaded fallback data from: ${fallbackUrl}`);
      return dataKey ? data[dataKey] : data;
    } catch (error) {
      console.error(`Error loading fallback data (${fallbackUrl}):`, error);
      return null;
    }
  }

  /**
   * Loads profile data with fallback
   * @returns {Promise<Object|null>} Profile data or null
   */
  static async loadProfile() {
    return await this.loadWithFallback(
      'http://localhost:5000/Profile.aspx',
      './data/profile.json'
    );
  }

  /**
   * Loads projects data with fallback
   * @returns {Promise<Array>} Projects array or empty array
   */
  static async loadProjects() {
    const result = await this.loadWithFallback(
      'http://localhost:5000/Projects.aspx',
      './data/projects.json',
      'projects'
    );
    return result || [];
  }

  /**
   * Loads skills data with fallback
   * @returns {Promise<Array>} Skill categories array or empty array
   */
  static async loadSkills() {
    const result = await this.loadWithFallback(
      'http://localhost:5000/Skills.aspx',
      './data/skills.json',
      'skillCategories'
    );
    return result || [];
  }
}

export default DataLoader;
