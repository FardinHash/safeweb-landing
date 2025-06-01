import { motion } from "framer-motion";
import {
  FiShield,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiHeart,
} from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <FiShield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Safe-Web</span>
            </div>
            <p className="text-gray-400 text-lg mb-6 max-w-md">
              A powerful browser extension designed to enhance your privacy and
              protect sensitive information while browsing the web.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="https://github.com/intellwe"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
              >
                <FiGithub className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://linkedin.com/company/intellwe"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
              >
                <FiLinkedin className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="mailto:support@intellwe.com"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
              >
                <FiMail className="w-6 h-6" />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#browsers"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  Browser Support
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  Download
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 mt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear}{" "}
              <a
                href="https://intellwe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                IntellWe
              </a>
              . All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
              <span>Made with</span>
              <FiHeart className="w-4 h-4 text-red-500" />
              <span>for a safer web</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
