// Safe-Web Background Service Worker - Optimized
// Handles extension lifecycle, storage, and communication with content scripts

class SafeWebBackground {
  constructor() {
    this.tabUpdateThrottle = new Map();
    this.initializeExtension();
    this.setupEventListeners();
  }

  async initializeExtension() {
    // Initialize default settings
    const defaultSettings = {
      maskingEnabled: false,
      maskingStyle: "blur", // 'blur', 'pixelate', 'blackout'
      maskingIntensity: 5,
      sensitivePatterns: {
        email: true,
        phone: true,
        ssn: true,
        creditCard: true,
        names: false,
        addresses: false,
        customPatterns: [],
      },
      shortcuts: {
        toggleMasking: "Ctrl+Shift+M",
      },
      theme: "dark",
      animations: true,
    };

    try {
      const existingSettings = await chrome.storage.sync.get("safeWebSettings");
      if (!existingSettings.safeWebSettings) {
        await chrome.storage.sync.set({ safeWebSettings: defaultSettings });
        console.log("Safe-Web: Default settings initialized");
      }
    } catch (error) {
      console.error("Safe-Web: Failed to initialize settings:", error);
    }
  }

  setupEventListeners() {
    // Extension installation/update handling
    chrome.runtime.onInstalled.addListener(this.handleInstallation.bind(this));

    // Message handling between popup and content scripts
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

    // Tab update handling
    chrome.tabs.onUpdated.addListener(this.throttledTabUpdate.bind(this));

    // Storage change handling
    chrome.storage.onChanged.addListener(this.handleStorageChange.bind(this));

    // Action (browser button) click handling
    chrome.action.onClicked.addListener(this.handleActionClick.bind(this));
  }

  async handleInstallation(details) {
    console.log("Safe-Web installed/updated:", details.reason);

    if (details.reason === "install") {
      // Show welcome page or tutorial
      await this.showWelcome();
    } else if (details.reason === "update") {
      // Handle updates if needed
      await this.handleUpdate(details.previousVersion);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    const { type, data } = message;

    try {
      switch (type) {
        case "GET_SETTINGS":
          const settings = await this.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        case "UPDATE_SETTINGS":
          await this.updateSettings(data);
          sendResponse({ success: true });
          break;

        case "TOGGLE_MASKING":
          await this.toggleMasking(sender.tab?.id);
          sendResponse({ success: true });
          break;

        case "GET_TAB_STATE":
          const tabState = await this.getTabState(sender.tab?.id);
          sendResponse({ success: true, data: tabState });
          break;

        case "UPDATE_TAB_STATE":
          await this.updateTabState(sender.tab?.id, data);
          sendResponse({ success: true });
          break;

        case "ANALYZE_CONTENT":
          const analysis = await this.analyzeContent(data);
          sendResponse({ success: true, data: analysis });
          break;

        default:
          console.warn("Safe-Web: Unknown message type:", type);
          sendResponse({ success: false, error: "Unknown message type" });
      }
    } catch (error) {
      console.error("Safe-Web: Message handling error:", error);
      sendResponse({ success: false, error: error.message });
    }

    // Keep message channel open for async response
    return true;
  }

  throttledTabUpdate(tabId, changeInfo, tab) {
    if (this.tabUpdateThrottle.has(tabId)) {
      clearTimeout(this.tabUpdateThrottle.get(tabId));
    }

    this.tabUpdateThrottle.set(
      tabId,
      setTimeout(() => {
        this.handleTabUpdate(tabId, changeInfo, tab);
        this.tabUpdateThrottle.delete(tabId);
      }, 100)
    );
  }

  async handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.url) {
      // Inject content script if needed
      await this.ensureContentScript(tabId, tab.url);

      // Update tab state
      await this.updateTabState(tabId, { url: tab.url, loaded: true });
    }
  }

  async handleStorageChange(changes, namespace) {
    if (namespace === "sync" && changes.safeWebSettings) {
      // Notify all content scripts about settings change
      const tabs = await chrome.tabs.query({});

      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: "SETTINGS_UPDATED",
            data: changes.safeWebSettings.newValue,
          });
        } catch (error) {
          // Tab might not have content script loaded
        }
      }
    }
  }

  async handleActionClick(tab) {
    // Quick toggle masking for current tab
    await this.toggleMasking(tab.id);
  }

  async getSettings() {
    try {
      const result = await chrome.storage.sync.get("safeWebSettings");

      // Return default settings if none exist
      if (!result.safeWebSettings) {
        const defaultSettings = {
          maskingEnabled: false,
          maskingStyle: "blur",
          maskingIntensity: 5,
          sensitivePatterns: {
            email: true,
            phone: true,
            ssn: true,
            creditCard: true,
            names: false,
            addresses: false,
            customPatterns: [],
          },
          shortcuts: {
            toggleMasking: "Ctrl+Shift+M",
          },
          theme: "dark",
          animations: true,
        };

        // Initialize with default settings
        await chrome.storage.sync.set({ safeWebSettings: defaultSettings });
        return defaultSettings;
      }

      return result.safeWebSettings;
    } catch (error) {
      console.error("Safe-Web: Failed to get settings:", error);
      throw error;
    }
  }

  async updateSettings(newSettings) {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      await chrome.storage.sync.set({ safeWebSettings: updatedSettings });
    } catch (error) {
      console.error("Safe-Web: Failed to update settings:", error);
      throw error;
    }
  }

  async toggleMasking(tabId) {
    if (!tabId) return;

    const settings = await this.getSettings();
    const newState = !settings.maskingEnabled;

    await this.updateSettings({ maskingEnabled: newState });

    // Notify content script
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: "TOGGLE_MASKING",
        data: { enabled: newState },
      });
    } catch (error) {
      console.error("Safe-Web: Failed to toggle masking:", error);
    }
  }

  async getTabState(tabId) {
    if (!tabId) return { maskingActive: false, detectedElements: [] };

    try {
      const result = await chrome.storage.local.get(`tab_${tabId}`);
      return (
        result[`tab_${tabId}`] || { maskingActive: false, detectedElements: [] }
      );
    } catch (error) {
      console.error("Safe-Web: Failed to get tab state:", error);
      return { maskingActive: false, detectedElements: [] };
    }
  }

  async updateTabState(tabId, state) {
    if (!tabId) return;

    try {
      const currentState = await this.getTabState(tabId);
      const newState = { ...currentState, ...state };
      await chrome.storage.local.set({ [`tab_${tabId}`]: newState });
    } catch (error) {
      console.error("Safe-Web: Failed to update tab state:", error);
    }
  }

  async ensureContentScript(tabId, url) {
    // Only inject on web pages
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return;
    }

    try {
      // Check if content script is already injected
      await chrome.tabs.sendMessage(tabId, { type: "PING" });
    } catch (error) {
      // Content script not loaded, inject it
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ["content.js"],
        });

        await chrome.scripting.insertCSS({
          target: { tabId },
          files: ["content.css"],
        });

        console.log("Safe-Web: Content script injected into tab", tabId);
      } catch (injectionError) {
        console.error(
          "Safe-Web: Failed to inject content script:",
          injectionError
        );
      }
    }
  }

  async analyzeContent(content) {
    // Basic content analysis for sensitive information
    const patterns = {
      emails: (
        content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
      ).length,
      phones: (
        content.match(
          /(\+1\s?)?(\([0-9]{3}\)|[0-9]{3})[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}/g
        ) || []
      ).length,
      ssns: (content.match(/\b\d{3}-?\d{2}-?\d{4}\b/g) || []).length,
      creditCards: (
        content.match(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g) || []
      ).length,
    };

    return {
      totalMatches: Object.values(patterns).reduce(
        (sum, count) => sum + count,
        0
      ),
      breakdown: patterns,
      timestamp: Date.now(),
    };
  }

  async showWelcome() {
    try {
      await chrome.tabs.create({
        url: chrome.runtime.getURL("welcome.html"),
      });
    } catch (error) {
      console.error("Safe-Web: Failed to show welcome page:", error);
    }
  }

  async handleUpdate(previousVersion) {
    console.log(`Safe-Web updated from version ${previousVersion}`);
    // Handle any migration logic here
  }
}

// Initialize the background service
new SafeWebBackground();
