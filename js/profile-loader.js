import DataLoader from './data-loader.js';

class ProfileLoader {
  constructor() {
    this.apiUrl = 'http://localhost:5000/Profile.aspx';
  }

  async fetchProfile() {
    return await DataLoader.loadProfile();
  }

  updateProfileElements(profileData) {
    if (!profileData) return;

    const updates = [
      { selector: '.subtitle', property: 'textContent', value: profileData.title },
      { selector: '.email-text', property: 'textContent', value: profileData.email },
      { selector: '.email-text', property: 'href', value: `mailto:${profileData.email}` },
      { selector: '.contact-item span:last-child', property: 'textContent', value: profileData.location },
      { selector: '.contact-info p', property: 'textContent', value: profileData.aboutDescription },
      { selector: '.footer-section h4', property: 'textContent', value: profileData.name },
      { selector: '.footer-section p', property: 'textContent', value: profileData.bio }
    ];

    updates.forEach(({ selector, property, value }) => {
      const element = document.querySelector(selector);
      if (element && value) element[property] = value;
    });

    // Update social links
    this.updateSocialLinks(profileData.social);
    
    // Update footer copyright
    const footerCopyright = document.querySelector('.footer-bottom p');
    if (footerCopyright && profileData.name) {
      footerCopyright.innerHTML = `&copy; 2025 ${profileData.name}. All rights reserved.`;
    }
  }

  updateSocialLinks(social) {
    if (!social) return;

    const socialLinks = [
      { selector: '.social-btn.github', href: social.github },
      { selector: '.social-btn.linkedin', href: social.linkedin },
      { selector: '.footer-social-link[href*="github"]', href: social.github },
      { selector: '.footer-social-link[href*="linkedin"]', href: social.linkedin }
    ];

    socialLinks.forEach(({ selector, href }) => {
      const element = document.querySelector(selector);
      if (element && href) element.href = href;
    });
  }

  async init() {
    const profileData = await this.fetchProfile();
    this.updateProfileElements(profileData);
    return profileData;
  }
}

export default ProfileLoader;
