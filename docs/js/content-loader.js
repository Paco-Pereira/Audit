/**
 * ContentLoader - Lazy loading module for M2 GIP
 * Loads case content on-demand to reduce initial page weight
 */

class ContentLoader {
  constructor() {
    this.cache = new Map();
    this.loading = new Map();
    this.manifest = null;
  }

  /**
   * Load case data from JSON
   * @param {string} caseId - Case identifier (e.g., 'snow', 'financement')
   * @returns {Promise<Object>} Case data with content, sidebar, etc.
   */
  async load(caseId) {
    // Return cached data if available
    if (this.cache.has(caseId)) {
      // cached
      return this.cache.get(caseId);
    }

    // Return existing promise if already loading
    if (this.loading.has(caseId)) {
      // dedup
      return this.loading.get(caseId);
    }

    // Start loading
    // fetch
    const promise = this.fetchWithRetry(`content/${this.getPath(caseId)}.json`)
      .then(response => response.json())
      .then(data => {
        this.cache.set(caseId, data);
        this.loading.delete(caseId);
        // loaded
        return data;
      })
      .catch(error => {
        this.loading.delete(caseId);
        console.error(`❌ Failed to load ${caseId}:`, error);
        throw error;
      });

    this.loading.set(caseId, promise);
    return promise;
  }

  /**
   * Fetch with exponential backoff retry
   * @param {string} url - URL to fetch
   * @param {number} retries - Number of retries
   * @returns {Promise<Response>}
   */
  async fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return response;
        }
        if (response.status === 404) {
          throw new Error(`Content not found: ${url}`);
        }
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        // Exponential backoff: 1s, 2s, 4s
        const delay = 1000 * Math.pow(2, i);
        // retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Get file path for a case ID
   * @param {string} caseId - Case identifier
   * @returns {string} Relative path to JSON file
   */
  getPath(caseId) {
    const typeMap = {
      // Audit cases
      'snow': 'audit',
      'stark': 'audit',
      'niote': 'audit',
      'mengere': 'audit',
      'norris': 'audit',
      'vador': 'audit',
      'leon': 'audit',
      'genereux': 'audit',
      'houette': 'audit',
      // Courses
      'financement': 'courses',
      'responsabilite': 'courses',
      'fiscal': 'courses',
      'droit': 'courses',
      'marches': 'courses',
      'transmission': 'courses',
      'fiscalite-int': 'courses',
      // Tools
      'outils': 'tools',
      'guide': 'tools',
      'montages': 'tools',
      'formules': 'tools'
    };

    const type = typeMap[caseId];
    if (!type) {
      throw new Error(`Unknown case ID: ${caseId}`);
    }

    return `${type}/${caseId}`;
  }

  /**
   * Inject loaded content into the DOM
   * @param {string} caseId - Case identifier
   * @param {Object} data - Case data with content and sidebar
   */
  inject(caseId, data) {
    // Inject main content
    let container = document.getElementById(`case-${caseId}`);

    if (!container) {
      // Create container if it doesn't exist
      container = document.createElement('div');
      container.id = `case-${caseId}`;
      container.className = 'case-content';
      container.style.display = 'none';

      const mainElement = document.getElementById('main-scroll');
      if (mainElement) {
        mainElement.appendChild(container);
      }
    }

    container.innerHTML = data.content;

    // Inject sidebar if available
    if (data.sidebar && data.sidebar.items && data.sidebar.items.length > 0) {
      const sidebarId = `sidebar-${caseId}`;

      if (!document.getElementById(sidebarId)) {
        const sidebarHTML = this.buildSidebar(caseId, data.sidebar);
        const sidebarContainer = document.querySelector('.sidebar');

        if (sidebarContainer) {
          sidebarContainer.insertAdjacentHTML('beforeend', sidebarHTML);
        }
      }
    }

    // injected
  }

  /**
   * Build sidebar HTML from data
   * @param {string} caseId - Case identifier
   * @param {Object} sidebarData - Sidebar structure
   * @returns {string} HTML string
   */
  buildSidebar(caseId, sidebarData) {
    let html = `<div id="sidebar-${caseId}" class="sidebar-sections" style="display:none;">`;

    sidebarData.items.forEach(item => {
      html += `<a href="#${item.id}" class="sidebar-item" data-goto="${item.id}">`;

      if (item.num) {
        html += `<span class="sidebar-num">${item.num}</span>`;
      }

      html += `<span class="sidebar-label">${item.label}</span>`;
      html += '</a>';
    });

    html += '</div>';
    return html;
  }

  /**
   * Load manifest (for search functionality)
   * @returns {Promise<Object>} Manifest data
   */
  async loadManifest() {
    if (this.manifest) {
      return this.manifest;
    }

    try {
      const response = await fetch('content/manifest.json');
      this.manifest = await response.json();
      return this.manifest;
    } catch (error) {
      console.error('Failed to load manifest:', error);
      throw error;
    }
  }

  /**
   * Preload specific cases (optional optimization)
   * @param {string[]} caseIds - Array of case IDs to preload
   */
  async preload(caseIds) {
    // preload
    await Promise.all(caseIds.map(id => this.load(id).catch(e => {
      console.warn(`Failed to preload ${id}:`, e);
    })));
  }

  /**
   * Clear cache (for debugging)
   */
  clearCache() {
    this.cache.clear();
    this.loading.clear();
    this.manifest = null;
    // cleared
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    return {
      cached: this.cache.size,
      loading: this.loading.size,
      totalSize: Array.from(this.cache.values())
        .reduce((sum, data) => sum + JSON.stringify(data).length, 0)
    };
  }
}

// Create global instance
window.contentLoader = new ContentLoader();

// Expose for debugging
if (typeof window !== 'undefined') {
  window.ContentLoader = ContentLoader;
}

// ContentLoader ready
