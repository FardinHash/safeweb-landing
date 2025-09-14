import { motion } from "framer-motion";
import { FiShield, FiEye, FiLock, FiDownload } from "react-icons/fi";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10"></div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center w-full">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <FiShield className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 text-center"
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Safe-Web
            </span>
            <span className="block text-3xl md:text-4xl mt-2 text-gray-300 font-medium">
              Privacy-First Browser Extension
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed text-center"
          >
            Protect your digital privacy with our powerful browser extension.
            Safe-Web automatically masks sensitive information like{" "}
            {/* <strong>emails, phone numbers, credit cards,</strong> and personal
            data while you browse. Available for{" "}
            <strong>Chrome, Firefox, Edge, Safari, and Opera</strong>. */}
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold flex items-center space-x-3 hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-cyan-500/25"
            >
              <FiDownload className="w-5 h-5" />
              <span>Coming Soon</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-cyan-400 text-cyan-400 px-6 py-3 rounded-xl text-lg font-semibold hover:bg-cyan-400/10 transition-all duration-200"
            >
              Learn More
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="flex flex-col items-center p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700">
              <FiEye className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Privacy Protection
              </h3>
              <p className="text-gray-400 text-center">
                Mask sensitive information to protect your privacy while
                browsing
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700">
              <FiLock className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Secure Browsing
              </h3>
              <p className="text-gray-400 text-center">
                Advanced security features to keep your data safe
              </p>
            </div>

            <div className="flex flex-col items-center p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700">
              <FiShield className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Easy to Use
              </h3>
              <p className="text-gray-400 text-center">
                Simple one-click toggle to enable or disable protection
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 to-transparent"></div>
    </section>
  );
};

export default HeroSection;
