import { useState, useEffect, useCallback } from "react";
import { ChromeAPI } from "../utils/chrome.js";

/**
 * Custom hook for managing Safe-Web settings
 * Provides automatic sync with Chrome storage and state management
 */
export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default settings structure
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

  // Load settings from Chrome storage
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const storedSettings = await ChromeAPI.getSettings();

      if (storedSettings) {
        // Merge with defaults to ensure all properties exist
        setSettings({ ...defaultSettings, ...storedSettings });
      } else {
        // Use defaults if no settings found
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError(err.message);
      setSettings(defaultSettings); // Fallback to defaults
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings in Chrome storage
  const updateSettings = useCallback(
    async (updates) => {
      try {
        setError(null);

        // Optimistically update local state
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);

        // Update in Chrome storage
        const success = await ChromeAPI.updateSettings(updates);

        if (!success) {
          throw new Error("Failed to save settings");
        }

        return true;
      } catch (err) {
        console.error("Failed to update settings:", err);
        setError(err.message);

        // Revert optimistic update
        await loadSettings();

        return false;
      }
    },
    [settings, loadSettings]
  );

  // Toggle masking enabled/disabled
  const toggleMasking = useCallback(async () => {
    if (!settings) return false;

    return await updateSettings({
      maskingEnabled: !settings.maskingEnabled,
    });
  }, [settings, updateSettings]);

  // Update masking style
  const setMaskingStyle = useCallback(
    async (style) => {
      return await updateSettings({ maskingStyle: style });
    },
    [updateSettings]
  );

  // Update masking intensity
  const setMaskingIntensity = useCallback(
    async (intensity) => {
      return await updateSettings({ maskingIntensity: intensity });
    },
    [updateSettings]
  );

  // Toggle sensitive pattern detection
  const toggleSensitivePattern = useCallback(
    async (patternType) => {
      if (!settings?.sensitivePatterns) return false;

      const newPatterns = {
        ...settings.sensitivePatterns,
        [patternType]: !settings.sensitivePatterns[patternType],
      };

      return await updateSettings({
        sensitivePatterns: newPatterns,
      });
    },
    [settings, updateSettings]
  );

  // Add custom pattern
  const addCustomPattern = useCallback(
    async (pattern) => {
      if (!settings?.sensitivePatterns) return false;

      const customPatterns = [
        ...(settings.sensitivePatterns.customPatterns || []),
      ];

      // Check if pattern already exists
      if (customPatterns.some((p) => p.name === pattern.name)) {
        setError("Pattern with this name already exists");
        return false;
      }

      customPatterns.push({
        id: Date.now().toString(),
        name: pattern.name,
        regex: pattern.regex,
        description: pattern.description || "",
        enabled: true,
        createdAt: new Date().toISOString(),
      });

      return await updateSettings({
        sensitivePatterns: {
          ...settings.sensitivePatterns,
          customPatterns,
        },
      });
    },
    [settings, updateSettings]
  );

  // Remove custom pattern
  const removeCustomPattern = useCallback(
    async (patternId) => {
      if (!settings?.sensitivePatterns?.customPatterns) return false;

      const customPatterns = settings.sensitivePatterns.customPatterns.filter(
        (p) => p.id !== patternId
      );

      return await updateSettings({
        sensitivePatterns: {
          ...settings.sensitivePatterns,
          customPatterns,
        },
      });
    },
    [settings, updateSettings]
  );

  // Toggle custom pattern
  const toggleCustomPattern = useCallback(
    async (patternId) => {
      if (!settings?.sensitivePatterns?.customPatterns) return false;

      const customPatterns = settings.sensitivePatterns.customPatterns.map(
        (p) => (p.id === patternId ? { ...p, enabled: !p.enabled } : p)
      );

      return await updateSettings({
        sensitivePatterns: {
          ...settings.sensitivePatterns,
          customPatterns,
        },
      });
    },
    [settings, updateSettings]
  );

  // Update keyboard shortcut
  const updateShortcut = useCallback(
    async (action, shortcut) => {
      if (!settings?.shortcuts) return false;

      return await updateSettings({
        shortcuts: {
          ...settings.shortcuts,
          [action]: shortcut,
        },
      });
    },
    [settings, updateSettings]
  );

  // Toggle animations
  const toggleAnimations = useCallback(async () => {
    if (!settings) return false;

    return await updateSettings({
      animations: !settings.animations,
    });
  }, [settings, updateSettings]);

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
    try {
      setError(null);

      const success = await ChromeAPI.updateSettings(defaultSettings);

      if (success) {
        setSettings(defaultSettings);
        return true;
      } else {
        throw new Error("Failed to reset settings");
      }
    } catch (err) {
      console.error("Failed to reset settings:", err);
      setError(err.message);
      return false;
    }
  }, []);

  // Export settings
  const exportSettings = useCallback(() => {
    if (!settings) return null;

    const exportData = {
      ...settings,
      exportedAt: new Date().toISOString(),
      version: ChromeAPI.getVersion(),
    };

    return JSON.stringify(exportData, null, 2);
  }, [settings]);

  // Import settings
  const importSettings = useCallback(async (importData) => {
    try {
      setError(null);

      let parsedData;
      if (typeof importData === "string") {
        parsedData = JSON.parse(importData);
      } else {
        parsedData = importData;
      }

      // Validate imported data structure
      if (!parsedData || typeof parsedData !== "object") {
        throw new Error("Invalid settings format");
      }

      // Merge with defaults to ensure all required properties exist
      const validatedSettings = { ...defaultSettings, ...parsedData };

      // Remove export metadata
      delete validatedSettings.exportedAt;
      delete validatedSettings.version;

      const success = await ChromeAPI.updateSettings(validatedSettings);

      if (success) {
        setSettings(validatedSettings);
        return true;
      } else {
        throw new Error("Failed to import settings");
      }
    } catch (err) {
      console.error("Failed to import settings:", err);
      setError(err.message);
      return false;
    }
  }, []);

  // Listen for storage changes from other parts of the extension
  useEffect(() => {
    const handleStorageChange = (changes, namespace) => {
      if (namespace === "sync" && changes.safeWebSettings) {
        const newSettings = changes.safeWebSettings.newValue;
        if (newSettings) {
          setSettings({ ...defaultSettings, ...newSettings });
        }
      }
    };

    ChromeAPI.onStorageChanged(handleStorageChange);

    return () => {
      ChromeAPI.removeStorageListener(handleStorageChange);
    };
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    // State
    settings,
    loading,
    error,

    // Actions
    updateSettings,
    toggleMasking,
    setMaskingStyle,
    setMaskingIntensity,
    toggleSensitivePattern,
    addCustomPattern,
    removeCustomPattern,
    toggleCustomPattern,
    updateShortcut,
    toggleAnimations,
    resetSettings,
    exportSettings,
    importSettings,

    // Utilities
    loadSettings,
    clearError: () => setError(null),
  };
}
