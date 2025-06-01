// Safe-Web Content Script - Optimized for Performance
// Handles sensitive information detection and masking on web pages

class SafeWebContentScript {
  constructor() {
    // Performance monitoring
    this.performanceMetrics = {
      startTime: performance.now(),
      scanCount: 0,
      nodesProcessed: 0,
      memoryUsage: 0,
      avgScanTime: 0,
      totalScanTime: 0,
    };

    // Early exit for non-HTML documents
    if (document.contentType && !document.contentType.includes("text/html")) {
      return;
    }

    // Early exit for certain URLs
    if (this.shouldSkipPage()) {
      return;
    }

    this.settings = null;
    this.maskingActive = false;
    this.maskedElements = new Map();
    this.observer = null;
    this.initialized = false;
    this.processedNodes = new WeakSet();
    this.scanDebounceTimer = null;
    this.contentScanTimer = null;
    this.lastScanTime = 0;
    this.scanThrottleDelay = 1000;
    this.maxNodesPerScan = 500;
    this.isDestroyed = false;

    this.beforeUnloadHandler = null;
    this.visibilityChangeHandler = null;

    this.init();
    this.setupCleanup();
    this.setupPerformanceMonitoring();
  }

  setupPerformanceMonitoring() {
    setInterval(() => {
      if (!this.isDestroyed) {
        this.logPerformanceMetrics();
      }
    }, 30000);

    if (performance.memory) {
      this.performanceMetrics.memoryUsage =
        performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  logPerformanceMetrics() {
    const metrics = {
      ...this.performanceMetrics,
      uptime: (performance.now() - this.performanceMetrics.startTime) / 1000,
      processedNodesCount: this.performanceMetrics.nodesProcessed,
      avgScanTime:
        this.performanceMetrics.totalScanTime /
          this.performanceMetrics.scanCount || 0,
      memoryUsage: performance.memory
        ? performance.memory.usedJSHeapSize / 1024 / 1024
        : "N/A",
    };

    console.log("Safe-Web Performance Metrics:", metrics);

    chrome.runtime.sendMessage({
      type: "PERFORMANCE_METRICS",
      data: metrics,
    });
  }

  shouldSkipPage() {
    const url = window.location.href;
    const skipPatterns = [
      /^chrome:/,
      /^chrome-extension:/,
      /^moz-extension:/,
      /^about:/,
      /^data:/,
      /^blob:/,
    ];

    return skipPatterns.some((pattern) => pattern.test(url));
  }

  setupCleanup() {
    this.beforeUnloadHandler = () => {
      this.destroy();
    };

    this.visibilityChangeHandler = () => {
      if (document.visibilityState === "hidden") {
        this.pauseOperations();
      } else {
        this.resumeOperations();
      }
    };

    window.addEventListener("beforeunload", this.beforeUnloadHandler);
    document.addEventListener("visibilitychange", this.visibilityChangeHandler);
  }

  pauseOperations() {
    if (this.observer) {
      this.observer.disconnect();
    }
    clearTimeout(this.scanDebounceTimer);
    clearTimeout(this.contentScanTimer);
  }

  resumeOperations() {
    if (this.initialized && !this.isDestroyed) {
      this.setupOptimizedMutationObserver();
    }
  }

  destroy() {
    this.isDestroyed = true;

    // Log final metrics
    this.logPerformanceMetrics();

    if (this.observer) {
      this.observer.disconnect();
    }

    clearTimeout(this.scanDebounceTimer);
    clearTimeout(this.contentScanTimer);

    if (this.beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this.beforeUnloadHandler);
    }
    if (this.visibilityChangeHandler) {
      document.removeEventListener(
        "visibilitychange",
        this.visibilityChangeHandler
      );
    }

    this.maskedElements.clear();
    this.processedNodes = new WeakSet();
  }

  async init() {
    if (this.initialized || this.isDestroyed) return;

    try {
      await this.loadSettings();
      this.setupMessageListener();
      this.setupOptimizedMutationObserver();
      this.setupKeyboardShortcuts();

      if (this.settings?.maskingEnabled) {
        // Immediate scan for already loaded content
        this.scanPage();
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
      if (this.isDestroyed) return;

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
          this.throttledScanPage();
          sendResponse({ success: true });
          break;

        case "GET_PERFORMANCE":
          sendResponse({ success: true, data: this.performanceMetrics });
          break;

        default:
          sendResponse({ success: false, error: "Unknown message type" });
      }

      return true;
    });
  }

  setupOptimizedMutationObserver() {
    if (this.isDestroyed) return;

    let pendingChanges = false;

    this.observer = new MutationObserver((mutations) => {
      if (
        !this.maskingActive ||
        pendingChanges ||
        this.isDestroyed ||
        document.visibilityState === "hidden"
      )
        return;

      const hasSignificantChanges = mutations.some((mutation) => {
        if (mutation.type === "childList") {
          return Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              !node.matches(".safe-web-masked, .safe-web-indicator") &&
              node.textContent &&
              node.textContent.trim().length > 3
          );
        }
        return false;
      });

      if (hasSignificantChanges) {
        pendingChanges = true;
        this.debouncedScanNewContent(() => {
          pendingChanges = false;
        });
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      if (this.isDestroyed) return;

      if (event.ctrlKey && event.shiftKey && event.key === "M") {
        event.preventDefault();
        this.toggleMasking();
      }
    });
  }

  async handleToggleMasking(data) {
    if (this.isDestroyed) return;

    this.maskingActive = data.enabled;

    if (this.maskingActive) {
      await this.startMasking();
    } else {
      this.stopMasking();
    }
  }

  async handleSettingsUpdate(newSettings) {
    if (this.isDestroyed) return;

    const oldMaskingState = this.maskingActive;
    this.settings = newSettings;
    this.maskingActive = newSettings.maskingEnabled;

    if (oldMaskingState !== this.maskingActive) {
      if (this.maskingActive) {
        await this.startMasking();
      } else {
        this.stopMasking();
      }
    } else if (this.maskingActive) {
      this.stopMasking();
      await this.throttledScanPage();
    }
  }

  async startMasking() {
    if (this.isDestroyed) return;
    await this.throttledScanPage();
    this.showMaskingIndicator();
  }

  stopMasking() {
    this.unmaskAllElements();
    this.hideMaskingIndicator();
    this.processedNodes = new WeakSet();
  }

  async toggleMasking() {
    if (this.isDestroyed) return;
    chrome.runtime.sendMessage({ type: "TOGGLE_MASKING" });
  }

  throttledScanPage() {
    if (this.isDestroyed) return;

    const now = Date.now();
    if (now - this.lastScanTime < this.scanThrottleDelay) {
      clearTimeout(this.scanDebounceTimer);
      this.scanDebounceTimer = setTimeout(() => {
        if (!this.isDestroyed) this.scanPage();
      }, this.scanThrottleDelay - (now - this.lastScanTime));
      return;
    }

    this.scanPage();
  }

  async scanPage() {
    if (this.isDestroyed || !this.settings) return;

    const scanStartTime = performance.now();

    if (!this.settings) await this.loadSettings();

    this.lastScanTime = Date.now();
    const patterns = this.getSensitivePatterns();

    if (Object.keys(patterns).length === 0) return;

    const textNodes = this.getOptimizedTextNodes(document.body);
    let processedCount = 0;

    for (const node of textNodes.slice(0, this.maxNodesPerScan)) {
      if (this.isDestroyed) break;

      if (!this.processedNodes.has(node)) {
        this.scanTextNode(node, patterns);
        this.processedNodes.add(node);
        processedCount++;
      }
    }

    // Update performance metrics
    const scanTime = performance.now() - scanStartTime;
    this.performanceMetrics.scanCount++;
    this.performanceMetrics.nodesProcessed += processedCount;
    this.performanceMetrics.totalScanTime += scanTime;
    this.performanceMetrics.avgScanTime =
      this.performanceMetrics.totalScanTime / this.performanceMetrics.scanCount;
  }

  debouncedScanNewContent(callback) {
    if (this.isDestroyed) return;

    clearTimeout(this.contentScanTimer);
    this.contentScanTimer = setTimeout(() => {
      if (!this.isDestroyed) {
        this.scanNewContent();
        if (callback) callback();
      }
    }, 300);
  }

  async scanNewContent() {
    if (this.isDestroyed) return;

    const scanStartTime = performance.now();
    const patterns = this.getSensitivePatterns();
    if (Object.keys(patterns).length === 0) return;

    const newNodes = this.getOptimizedTextNodes(document.body).filter(
      (node) => !this.processedNodes.has(node)
    );

    let processedCount = 0;
    for (const node of newNodes.slice(0, this.maxNodesPerScan)) {
      if (this.isDestroyed) break;

      this.scanTextNode(node, patterns);
      this.processedNodes.add(node);
      processedCount++;
    }

    // Update performance metrics for new content scans
    const scanTime = performance.now() - scanStartTime;
    this.performanceMetrics.nodesProcessed += processedCount;
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

  getOptimizedTextNodes(element) {
    const textNodes = [];
    const excludeSelectors =
      'script, style, noscript, .safe-web-masked, .safe-web-indicator, [contenteditable="false"]';

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (this.isDestroyed) return NodeFilter.FILTER_REJECT;

        const parent = node.parentElement;
        if (!parent || parent.closest(excludeSelectors)) {
          return NodeFilter.FILTER_REJECT;
        }

        const text = node.textContent;
        if (!text.trim() || text.length < 5 || text.length > 1000) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while (
      (node = walker.nextNode()) &&
      textNodes.length < this.maxNodesPerScan
    ) {
      if (this.isDestroyed) break;
      textNodes.push(node);
    }

    return textNodes;
  }

  scanTextNode(textNode, patterns) {
    if (this.isDestroyed) return;

    const text = textNode.textContent;

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.regex.test(text)) {
        this.maskTextNode(textNode, patterns);
        break;
      }
    }
  }

  maskTextNode(textNode, patterns) {
    if (this.isDestroyed) return;

    const parent = textNode.parentElement;
    if (!parent || this.maskedElements.has(parent)) return;

    let maskedHTML = textNode.textContent;
    const originalText = maskedHTML;

    for (const [type, pattern] of Object.entries(patterns)) {
      maskedHTML = maskedHTML.replace(pattern.regex, (match) => {
        return this.createMaskedElement(match, pattern.className, type);
      });
    }

    if (maskedHTML !== originalText && !this.isDestroyed) {
      try {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = maskedHTML;

        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }

        parent.replaceChild(fragment, textNode);
        this.maskedElements.set(parent, {
          originalText,
          textNode,
          type: "text",
        });
      } catch (error) {
        console.error("Safe-Web: Error masking text node:", error);
      }
    }
  }

  createMaskedElement(text, className, type) {
    const maskingStyle = this.settings?.maskingStyle || "blur";
    const intensity = Math.min(this.settings?.maskingIntensity || 5, 10);

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
    const maskedElements = document.querySelectorAll(".safe-web-masked");

    maskedElements.forEach((element) => {
      try {
        const originalText = atob(element.dataset.safeWebOriginal);
        const textNode = document.createTextNode(originalText);
        if (element.parentNode) {
          element.parentNode.replaceChild(textNode, element);
        }
      } catch (error) {
        if (element.parentNode) {
          element.className = element.className
            .replace(/safe-web-[^\s]+/g, "")
            .trim();
        }
      }
    });

    this.maskedElements.clear();
  }

  showMaskingIndicator() {
    if (this.isDestroyed) return;

    const existing = document.getElementById("safe-web-indicator");
    if (existing) existing.remove();

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

    setTimeout(() => {
      if (indicator.parentNode && !this.isDestroyed) {
        indicator.classList.add("safe-web-fade-out");
        setTimeout(() => {
          if (indicator.parentNode) indicator.remove();
        }, 300);
      }
    }, 3000);
  }

  hideMaskingIndicator() {
    const indicator = document.getElementById("safe-web-indicator");
    if (indicator) indicator.remove();
  }
}

// Initialize content script with proper timing and error handling
(() => {
  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        new SafeWebContentScript();
      });
    } else {
      new SafeWebContentScript();
    }
  } catch (error) {
    console.error("Safe-Web: Failed to initialize content script:", error);
  }
})();
