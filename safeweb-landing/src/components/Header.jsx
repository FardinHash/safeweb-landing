import { motion } from "framer-motion";
import { FiShield, FiGithub, FiDownload } from "react-icons/fi";

const Header = () => {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <FiShield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Safe-Web</span>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#browsers"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-200"
            >
              Browsers
            </a>
            <a
              href="#about"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-200"
            >
              About
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <motion.a
              href="https://github.com/intellwe"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-200"
            >
              <FiGithub className="w-5 h-5" />
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 min-w-[40px]"
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline sm:ml-2">Coming Soon</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
