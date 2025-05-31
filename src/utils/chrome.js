// Chrome Extension API utilities for Safe-Web
// Provides wrapper functions for chrome APIs with error handling

export class ChromeAPI {
  /**
   * Send a message to the background script
   * @param {Object} message - The message to send
   * @returns {Promise<any>} Response from background script
   */
  static sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!chrome?.runtime?.sendMessage) {
        reject(new Error("Chrome runtime not available"));
        return;
      }

      try {
        chrome.runtime.sendMessage(message, (response) => {
          // Check for runtime errors first
          if (chrome.runtime.lastError) {
            console.error("Chrome runtime error:", chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          // Handle case where no response is received
          if (response === undefined) {
            console.error("No response received from background script");
            reject(new Error("No response from background script"));
            return;
          }

          // Handle successful response
          if (response && response.success) {
            resolve(response.data || null);
          } else {
            // Handle error response
            const errorMessage = response?.error || "Unknown error occurred";
            console.error("Background script error:", errorMessage);
            reject(new Error(errorMessage));
          }
        });
      } catch (error) {
        console.error("Error sending message:", error);
        reject(error);
      }
    });
  }

  /**
   * Get settings from storage with fallback
   * @returns {Promise<Object>} Settings object
   */
  static async getSettings() {
    try {
      return await this.sendMessage({ type: "GET_SETTINGS" });
    } catch (error) {
      console.error("Failed to get settings:", error);
      
      // Fallback: try to get settings directly from storage
      try {
        const result = await this.getStorageDirectly();
        return result;
      } catch (fallbackError) {
        console.error("Fallback storage access failed:", fallbackError);
        return this.getDefaultSettings();
      }
    }
  }

  /**
   * Get default settings as fallback
   * @returns {Object} Default settings
   */
  static getDefaultSettings() {
    return {
      maskingEnabled: false,
      maskingStyle: 'blur',
      maskingIntensity: 5,
      sensitivePatterns: {
        email: true,
        phone: true,
        ssn: true,
        creditCard: true,
        names: false,
        addresses: false,
        customPatterns: []
      },
      shortcuts: {
        toggleMasking: 'Ctrl+Shift+M'
      },
      theme: 'dark',
      animations: true
    };
  }

  /**
   * Direct storage access as fallback
   * @returns {Promise<Object>} Settings from storage
   */
  static async getStorageDirectly() {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage?.sync) {
        reject(new Error("Storage API not available"));
        return;
      }

      chrome.storage.sync.get('safeWebSettings', (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        const settings = result.safeWebSettings || this.getDefaultSettings();
        resolve(settings);
      });
    });
  }

  /**
   * Update settings in storage with retry mechanism
   * @param {Object} updates - Settings to update
   * @returns {Promise<boolean>} Success status
   */
  static async updateSettings(updates) {
    try {
      await this.sendMessage({ type: "UPDATE_SETTINGS", data: updates });
      return true;
    } catch (error) {
      console.error("Failed to update settings via background:", error);
      
      // Fallback: update storage directly
      try {
        await this.updateStorageDirectly(updates);
        return true;
      } catch (fallbackError) {
        console.error("Fallback storage update failed:", fallbackError);
        return false;
      }
    }
  }

  /**
   * Direct storage update as fallback
   * @param {Object} updates - Settings to update
   * @returns {Promise<void>}
   */
  static async updateStorageDirectly(updates) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get current settings first
        const currentSettings = await this.getStorageDirectly();
        const newSettings = { ...currentSettings, ...updates };

        chrome.storage.sync.set({ safeWebSettings: newSettings }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Toggle masking for current tab
   * @returns {Promise<boolean>} Success status
   */
  static async toggleMasking() {
    try {
      await this.sendMessage({ type: "TOGGLE_MASKING" });
      return true;
    } catch (error) {
      console.error("Failed to toggle masking:", error);
      
      // Fallback: update settings directly
      try {
        const currentSettings = await this.getSettings();
        await this.updateSettings({ maskingEnabled: !currentSettings.maskingEnabled });
        return true;
      } catch (fallbackError) {
        console.error("Fallback toggle failed:", fallbackError);
        return false;
      }
    }
  }

  /**
   * Get current tab information
   * @returns {Promise<Object>} Tab information
   */
  static getCurrentTab() {
    return new Promise((resolve, reject) => {
      if (!chrome?.tabs?.query) {
        reject(new Error("Chrome tabs API not available"));
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (tabs && tabs.length > 0) {
          resolve(tabs[0]);
        } else {
          reject(new Error("No active tab found"));
        }
      });
    });
  }

  /**
   * Execute script in current tab
   * @param {string} code - JavaScript code to execute
   * @returns {Promise<any>} Script execution result
   */
  static executeScript(code) {
    return new Promise((resolve, reject) => {
      if (!chrome?.scripting?.executeScript) {
        reject(new Error("Chrome scripting API not available"));
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError || !tabs[0]) {
          reject(new Error("Failed to get active tab"));
          return;
        }

        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: new Function(code)
        }, (results) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          resolve(results);
        });
      });
    });
  }

  /**
   * Check if extension has permission for current tab
   * @returns {Promise<boolean>} Permission status
   */
  static async hasTabPermission() {
    try {
      const tab = await this.getCurrentTab();
      return tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'));
    } catch (error) {
      console.error('Failed to check tab permission:', error);
      return false;
    }
  }

  /**
   * Open extension options page
   */
  static openOptionsPage() {
    if (chrome?.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      // Fallback for older Chrome versions
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }
  }

  /**
   * Get extension version
   * @returns {string} Extension version
   */
  static getVersion() {
    return chrome?.runtime?.getManifest?.()?.version || '1.0.0';
  }

  /**
   * Listen for storage changes
   * @param {Function} callback - Callback function for storage changes
   */
  static onStorageChanged(callback) {
    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener(callback);
    }
  }

  /**
   * Remove storage change listener
   * @param {Function} callback - Callback function to remove
   */
  static removeStorageListener(callback) {
    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.removeListener(callback);
    }
  }
}

/**
 * Storage utilities
 */
export class StorageAPI {
  /**
   * Get data from sync storage
   * @param {string|Array|Object} keys - Keys to retrieve
   * @returns {Promise<Object>} Storage data
   */
  static getSync(keys) {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage?.sync) {
        reject(new Error('Chrome storage API not available'));
        return;
      }

      chrome.storage.sync.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Set data in sync storage
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  static setSync(data) {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage?.sync) {
        reject(new Error('Chrome storage API not available'));
        return;
      }

      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Get data from local storage
   * @param {string|Array|Object} keys - Keys to retrieve
   * @returns {Promise<Object>} Storage data
   */
  static getLocal(keys) {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage?.local) {
        reject(new Error('Chrome storage API not available'));
        return;
      }

      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Set data in local storage
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  static setLocal(data) {
    return new Promise((resolve, reject) => {
      if (!chrome?.storage?.local) {
        reject(new Error('Chrome storage API not available'));
        return;
      }

      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }
}

/**
 * Utility functions
 */
export const utils = {
  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Deep clone an object
   * @param {any} obj - Object to clone
   * @returns {any} Cloned object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },

  /**
   * Format file size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size string
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Check if URL is valid web page
   * @param {string} url - URL to check
   * @returns {boolean} Is valid web page
   */
  isValidWebPage(url) {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  },

  /**
   * Sanitize HTML string
   * @param {string} str - HTML string to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
};
