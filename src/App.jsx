import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "./hooks/useSettings.js";
import { ChromeAPI } from "./utils/chrome.js";
import { Toaster } from "./components/Toaster.jsx";

// React Icons
import {
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaCog,
  FaToggleOn,
  FaToggleOff,
  FaBolt,
  FaWaveSquare,
  FaTh,
  FaSquare,
  FaEnvelope,
  FaPhone,
  FaCreditCard,
  FaLock,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaArrowLeft,
  FaRedo,
} from "react-icons/fa";

function App() {
  const {
    settings,
    loading,
    error,
    toggleMasking,
    setMaskingStyle,
    setMaskingIntensity,
    toggleSensitivePattern,
    updateSettings,
    clearError,
  } = useSettings();

  const [currentTab, setCurrentTab] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [activeView, setActiveView] = useState("main"); // 'main', 'settings', 'patterns'
  const [toaster, setToaster] = useState({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToaster = (message, type = "info") => {
    setToaster({ message, type, isVisible: true });
  };

  const hideToaster = () => {
    setToaster((prev) => ({ ...prev, isVisible: false }));
  };

  // Load current tab info and check permissions
  useEffect(() => {
    const loadTabInfo = async () => {
      try {
        const tab = await ChromeAPI.getCurrentTab();
        setCurrentTab(tab);

        const permission = await ChromeAPI.hasTabPermission();
        setHasPermission(permission);
      } catch (error) {
        console.error("Failed to load tab info:", error);
      }
    };

    loadTabInfo();
  }, []);

  const handleToggleMasking = async () => {
    if (!hasPermission) {
      showToaster("Cannot activate on this page", "warning");
      return;
    }

    const currentlyEnabled = settings?.maskingEnabled;
    const newState = !currentlyEnabled;

    // When enabling protection, enable all patterns
    // When disabling protection, disable all patterns
    const updatedSettings = {
      maskingEnabled: newState,
      sensitivePatterns: {
        ...settings.sensitivePatterns,
        email: newState,
        phone: newState,
        ssn: newState,
        creditCard: newState,
        names: newState,
        addresses: newState,
      },
    };

    const success = await updateSettings(updatedSettings);

    if (success) {
      showToaster(
        newState
          ? "Protection activated - All patterns enabled"
          : "Protection deactivated - All patterns disabled",
        newState ? "success" : "info"
      );

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } else {
      showToaster("Failed to toggle protection", "error");
    }
  };

  const handleMaskingStyleChange = async (style) => {
    const success = await setMaskingStyle(style);
    if (success) {
      showToaster(`Masking style changed to ${style}`, "success");
    }
  };

  const handleIntensityChange = async (intensity) => {
    await setMaskingIntensity(intensity);
  };

  if (loading) {
    return (
      <div className="w-[450px] h-96 bg-[var(--primary-bg)] text-[var(--text-primary)] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-4xl text-[var(--cyan-primary)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <FaSpinner />
          </motion.div>
          <div className="text-[var(--text-secondary)]">
            Loading Safe-Web...
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[450px] h-96 bg-[var(--primary-bg)] text-[var(--text-primary)] p-6">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="text-4xl text-red-500">
            <FaExclamationTriangle />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">{error}</p>
            <button
              onClick={clearError}
              className="px-4 py-2 bg-[var(--cyan-primary)] text-[var(--primary-bg)] rounded-lg hover:bg-[var(--cyan-secondary)] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[450px] h-96 bg-[var(--primary-bg)] text-[var(--text-primary)] overflow-hidden relative">
      <AnimatePresence>
        <Toaster
          message={toaster.message}
          type={toaster.type}
          isVisible={toaster.isVisible}
          onClose={hideToaster}
        />
      </AnimatePresence>

      <motion.header
        className="p-4 border-b border-[var(--border-color)] bg-[var(--secondary-bg)]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="text-2xl text-[var(--cyan-primary)]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaShieldAlt />
            </motion.div>
            <div>
              <h1 className="font-bold text-gradient-rgb text-lg">Safe-Web</h1>
              <p className="text-xs text-[var(--text-muted)]">
                Privacy Protection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() =>
                setActiveView(activeView === "settings" ? "main" : "settings")
              }
              className="p-2 hover:bg-[var(--tertiary-bg)] rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg text-[var(--text-secondary)]">
                <FaCog />
              </span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="h-[calc(100%-80px)] overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeView === "main" && (
            <MainView
              key="main"
              settings={settings}
              currentTab={currentTab}
              hasPermission={hasPermission}
              onToggleMasking={handleToggleMasking}
              onStyleChange={handleMaskingStyleChange}
              onIntensityChange={handleIntensityChange}
              onViewChange={setActiveView}
            />
          )}

          {activeView === "settings" && (
            <SettingsView
              key="settings"
              settings={settings}
              onTogglePattern={toggleSensitivePattern}
              onBack={() => setActiveView("main")}
              showToaster={showToaster}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MainView({
  settings,
  currentTab,
  hasPermission,
  onToggleMasking,
  onStyleChange,
  onIntensityChange,
  onViewChange,
}) {
  const isEnabled = settings?.maskingEnabled;
  const maskingStyle = settings?.maskingStyle || "blur";
  const intensity = settings?.maskingIntensity || 5;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-6"
    >
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Current Page
        </h3>

        <div className="bg-[var(--secondary-bg)] rounded-xl p-4 border border-[var(--border-color)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[var(--tertiary-bg)] rounded-lg flex items-center justify-center">
              {currentTab?.favIconUrl ? (
                <img src={currentTab.favIconUrl} alt="" className="w-4 h-4" />
              ) : (
                <span className="text-sm text-[var(--text-secondary)]">
                  <FaLock />
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {currentTab?.title || "Unknown Page"}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {currentTab?.url || "No URL"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  hasPermission ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
              <span className="text-xs text-[var(--text-secondary)]">
                {hasPermission ? "Protected" : "Limited Access"}
              </span>
            </div>

            {isEnabled && hasPermission && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-[var(--cyan-primary)]">
                  Active
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Protection
        </h3>

        <div className="bg-[var(--secondary-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-[var(--cyan-primary)]">
              {isEnabled && hasPermission ? <FaShieldAlt /> : <FaEyeSlash />}
            </span>
            <div className="flex-1">
              <div className="font-semibold">
                {isEnabled && hasPermission
                  ? "Protection Active"
                  : "Protection Inactive"}
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                {hasPermission
                  ? "Safe-Web is monitoring this page"
                  : "Not available on this page"}
              </div>
            </div>
          </div>

          <motion.button
            onClick={onToggleMasking}
            disabled={!hasPermission}
            className={`w-full p-4 rounded-lg border text-center transition-all duration-300 ${
              isEnabled && hasPermission
                ? "bg-gradient-to-r from-[var(--cyan-primary)] to-[var(--cyan-secondary)] border-transparent text-[var(--primary-bg)] glow-cyan"
                : "border-[var(--border-color)] hover:border-[var(--cyan-primary)] text-[var(--text-secondary)]"
            } ${
              !hasPermission
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
            whileHover={hasPermission ? { scale: 1.02 } : {}}
            whileTap={hasPermission ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">
                {isEnabled ? <FaToggleOff /> : <FaToggleOn />}
              </span>
              <span className="font-semibold">
                {hasPermission ? "Disable Protection" : "Enable Protection"}
              </span>
            </div>
          </motion.button>
        </div>
      </div>

      {isEnabled && hasPermission && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Masking Style
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "blur", label: "Blur", icon: <FaWaveSquare /> },
              { value: "pixelate", label: "Pixelate", icon: <FaTh /> },
              { value: "blackout", label: "Blackout", icon: <FaSquare /> },
            ].map((style) => (
              <motion.button
                key={style.value}
                onClick={() => onStyleChange(style.value)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  maskingStyle === style.value
                    ? "border-[var(--cyan-primary)] bg-[var(--cyan-primary)]/10"
                    : "border-[var(--border-color)] hover:border-[var(--cyan-secondary)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-lg mb-1">{style.icon}</div>
                <div className="text-xs font-medium">{style.label}</div>
              </motion.button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">
                Intensity
              </span>
              <span className="text-sm font-medium">{intensity}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => onIntensityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--tertiary-bg)] rounded-lg appearance-none cursor-pointer range-slider"
            />
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={() => onViewChange("settings")}
            className="p-3 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg hover:border-[var(--cyan-primary)] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-lg mb-1 text-[var(--text-secondary)]">
                <FaLock />
              </div>
              <div className="text-xs font-medium">Patterns</div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => ChromeAPI.openOptionsPage()}
            className="p-3 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg hover:border-[var(--cyan-primary)] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-lg mb-1 text-[var(--text-secondary)]">
                <FaCog />
              </div>
              <div className="text-xs font-medium">Settings</div>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function SettingsView({ settings, onTogglePattern, onBack, showToaster }) {
  const patterns = settings?.sensitivePatterns || {};

  const handleTogglePattern = async (patternKey, patternLabel) => {
    const success = await onTogglePattern(patternKey);
    if (success) {
      const isEnabled = !patterns[patternKey];
      showToaster(
        `${patternLabel} detection ${isEnabled ? "enabled" : "disabled"}`,
        isEnabled ? "success" : "info"
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-4"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-color)]">
        <motion.button
          onClick={onBack}
          className="p-2 hover:bg-[var(--tertiary-bg)] rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg text-[var(--text-secondary)]">
            <FaArrowLeft />
          </span>
        </motion.button>
        <h2 className="text-lg font-semibold">Detection Patterns</h2>
      </div>

      <div className="space-y-3">
        {[
          { key: "email", label: "Email Addresses", icon: <FaEnvelope /> },
          { key: "phone", label: "Phone Numbers", icon: <FaPhone /> },
          { key: "creditCard", label: "Credit Cards", icon: <FaCreditCard /> },
          { key: "ssn", label: "Social Security Numbers", icon: <FaLock /> },
        ].map((pattern) => (
          <motion.div
            key={pattern.key}
            className="flex items-center justify-between p-3 bg-[var(--secondary-bg)] rounded-lg border border-[var(--border-color)]"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg text-[var(--text-secondary)]">
                {pattern.icon}
              </span>
              <span className="font-medium">{pattern.label}</span>
            </div>

            <motion.button
              onClick={() => handleTogglePattern(pattern.key, pattern.label)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                patterns[pattern.key]
                  ? "bg-[var(--cyan-primary)]"
                  : "bg-[var(--tertiary-bg)]"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-4 h-4 bg-white rounded-full"
                animate={{
                  x: patterns[pattern.key] ? 24 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default App;
