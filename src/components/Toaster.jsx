import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

// Icons for different types
const Icons = {
  Success: "✅",
  Warning: "⚠️",
  Info: "ℹ️",
  Error: "❌",
};

export function Toaster({ message, type = "info", isVisible, onClose }) {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-500/20 border-green-500",
          text: "text-green-400",
          icon: <FaCheckCircle />,
        };
      case "error":
        return {
          bg: "bg-red-500/20 border-red-500",
          text: "text-red-400",
          icon: <FaTimesCircle />,
        };
      case "warning":
        return {
          bg: "bg-yellow-500/20 border-yellow-500",
          text: "text-yellow-400",
          icon: <FaExclamationTriangle />,
        };
      default:
        return {
          bg: "bg-blue-500/20 border-blue-500",
          text: "text-blue-400",
          icon: <FaInfoCircle />,
        };
    }
  };

  const styles = getTypeStyles();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-md ${styles.bg}`}
        style={{ zIndex: 9999 }}
      >
        <div className="flex items-center gap-3">
          <span className={`text-lg ${styles.text}`}>{styles.icon}</span>
          <span className="flex-1 text-sm font-medium text-white">
            {message}
          </span>
          <motion.button
            onClick={onClose}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${styles.text}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTimes />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
