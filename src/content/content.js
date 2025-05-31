// Safe-Web Content Script
// Handles sensitive information detection and masking on web pages

class SafeWebContentScript {
  constructor() {
    this.settings = null;
    this.maskingActive = false;
    this.maskedElements = new Map();
    this.observer = null;
    this.initialized = false;

    this.init();
  }

  async init() {
    if (this.initialized) return;

    try {
      await this.loadSettings();
      this.setupMessageListener();
      this.setupMutationObserver();
      this.setupKeyboardShortcuts();

      // Initial scan if masking is enabled
      if (this.settings?.maskingEnabled) {
        await this.startMasking();
      }

      this.initialized = true;
      console.log("Safe-Web content script initialized");
    } catch (error) {
      console.error("Safe-Web: Content script initialization failed:", error);
    }
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (response) => {
        if (response?.success) {
          this.settings = response.data;
          this.maskingActive = this.settings.maskingEnabled;
        }
        resolve();
      });
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const { type, data } = message;

      switch (type) {
        case "PING":
          sendResponse({ success: true });
          break;

        case "TOGGLE_MASKING":
          this.handleToggleMasking(data);
          sendResponse({ success: true });
          break;

        case "SETTINGS_UPDATED":
          this.handleSettingsUpdate(data);
          sendResponse({ success: true });
          break;

        case "SCAN_PAGE":
          this.scanPage();
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: "Unknown message type" });
      }

      return true;
    });
  }

  setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      if (!this.maskingActive) return;

      let shouldRescan = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              shouldRescan = true;
              break;
            }
          }
        }
      });

      if (shouldRescan) {
        // Debounce rescanning
        clearTimeout(this.rescanTimeout);
        this.rescanTimeout = setTimeout(() => {
          this.scanAndMaskNewContent();
        }, 500);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      // Check for Ctrl+Shift+M (default toggle shortcut)
      if (event.ctrlKey && event.shiftKey && event.key === "M") {
        event.preventDefault();
        this.toggleMasking();
      }
    });
  }

  async handleToggleMasking(data) {
    this.maskingActive = data.enabled;

    if (this.maskingActive) {
      await this.startMasking();
    } else {
      this.stopMasking();
    }
  }

  async handleSettingsUpdate(newSettings) {
    const oldMaskingState = this.maskingActive;
    this.settings = newSettings;
    this.maskingActive = newSettings.maskingEnabled;

    // If masking state changed
    if (oldMaskingState !== this.maskingActive) {
      if (this.maskingActive) {
        await this.startMasking();
      } else {
        this.stopMasking();
      }
    } else if (this.maskingActive) {
      // Settings changed but masking still active, re-apply with new settings
      this.stopMasking();
      await this.startMasking();
    }
  }

  async startMasking() {
    await this.scanPage();
    this.showMaskingIndicator();
  }

  stopMasking() {
    this.unmaskAllElements();
    this.hideMaskingIndicator();
  }

  async toggleMasking() {
    chrome.runtime.sendMessage({ type: "TOGGLE_MASKING" });
  }

  async scanPage() {
    if (!this.settings) await this.loadSettings();

    const patterns = this.getSensitivePatterns();
    const textNodes = this.getTextNodes(document.body);

    textNodes.forEach((node) => {
      this.scanTextNode(node, patterns);
    });
  }

  async scanAndMaskNewContent() {
    // Only scan newly added content, not the entire page
    const patterns = this.getSensitivePatterns();
    const textNodes = this.getTextNodes(document.body);

    textNodes.forEach((node) => {
      if (!this.maskedElements.has(node)) {
        this.scanTextNode(node, patterns);
      }
    });
  }

  getSensitivePatterns() {
    if (!this.settings?.sensitivePatterns) return {};

    const patterns = {};

    if (this.settings.sensitivePatterns.email) {
      patterns.email = {
        regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        className: "safe-web-masked-email",
      };
    }

    if (this.settings.sensitivePatterns.phone) {
      patterns.phone = {
        regex:
          /(\+1\s?)?(\([0-9]{3}\)|[0-9]{3})[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}/g,
        className: "safe-web-masked-phone",
      };
    }

    if (this.settings.sensitivePatterns.ssn) {
      patterns.ssn = {
        regex: /\b\d{3}-?\d{2}-?\d{4}\b/g,
        className: "safe-web-masked-ssn",
      };
    }

    if (this.settings.sensitivePatterns.creditCard) {
      patterns.creditCard = {
        regex: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
        className: "safe-web-masked-card",
      };
    }

    return patterns;
  }

  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        // Skip script, style, and already processed nodes
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tagName = parent.tagName.toLowerCase();
        if (["script", "style", "noscript"].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Skip empty or whitespace-only nodes
        if (!node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    return textNodes;
  }

  scanTextNode(textNode, patterns) {
    const text = textNode.textContent;
    let hasMatches = false;

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.regex.test(text)) {
        hasMatches = true;
        break;
      }
    }

    if (hasMatches) {
      this.maskTextNode(textNode, patterns);
    }
  }

  maskTextNode(textNode, patterns) {
    const parent = textNode.parentElement;
    if (!parent) return;

    let maskedHTML = textNode.textContent;
    const originalText = maskedHTML;

    // Apply masking for each pattern type
    for (const [type, pattern] of Object.entries(patterns)) {
      maskedHTML = maskedHTML.replace(pattern.regex, (match) => {
        return this.createMaskedElement(match, pattern.className, type);
      });
    }

    // Only replace if we actually found matches
    if (maskedHTML !== originalText) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = maskedHTML;

      // Replace text node with masked elements
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }

      parent.replaceChild(fragment, textNode);

      // Store reference for unmasking
      this.maskedElements.set(parent, {
        originalText,
        textNode,
        type: "text",
      });
    }
  }

  createMaskedElement(text, className, type) {
    const maskingStyle = this.settings?.maskingStyle || "blur";
    const intensity = this.settings?.maskingIntensity || 5;

    let maskingClass = `safe-web-masked ${className}`;

    switch (maskingStyle) {
      case "blur":
        maskingClass += ` safe-web-blur-${intensity}`;
        break;
      case "pixelate":
        maskingClass += ` safe-web-pixelate-${intensity}`;
        break;
      case "blackout":
        maskingClass += " safe-web-blackout";
        break;
    }

    return `<span class="${maskingClass}" data-safe-web-type="${type}" data-safe-web-original="${btoa(
      text
    )}" title="Safe-Web: Sensitive information masked">${text}</span>`;
  }

  unmaskAllElements() {
    // Remove all masked elements and restore original content
    document.querySelectorAll(".safe-web-masked").forEach((element) => {
      try {
        const originalText = atob(element.dataset.safeWebOriginal);
        const textNode = document.createTextNode(originalText);
        element.parentNode.replaceChild(textNode, element);
      } catch (error) {
        // Fallback: just remove the masking classes
        element.className = element.className
          .replace(/safe-web-[^\s]+/g, "")
          .trim();
      }
    });

    this.maskedElements.clear();
  }

  showMaskingIndicator() {
    // Remove existing indicator
    const existing = document.getElementById("safe-web-indicator");
    if (existing) existing.remove();

    // Create new indicator
    const indicator = document.createElement("div");
    indicator.id = "safe-web-indicator";
    indicator.className = "safe-web-indicator";
    indicator.innerHTML = `
      <div class="safe-web-indicator-content">
        <div class="safe-web-indicator-icon">🛡️</div>
        <div class="safe-web-indicator-text">Safe-Web Active</div>
      </div>
    `;

    document.body.appendChild(indicator);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.classList.add("safe-web-fade-out");
        setTimeout(() => {
          if (indicator.parentNode) {
            indicator.remove();
          }
        }, 300);
      }
    }, 3000);
  }

  hideMaskingIndicator() {
    const indicator = document.getElementById("safe-web-indicator");
    if (indicator) {
      indicator.remove();
    }
  }
}

// Initialize content script
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new SafeWebContentScript();
  });
} else {
  new SafeWebContentScript();
}
