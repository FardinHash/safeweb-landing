import { motion } from "framer-motion";
import {
  FiEyeOff,
  FiShield,
  FiLock,
  FiZap,
  FiUserX,
  FiSettings,
} from "react-icons/fi";

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: "Sensitive Information Masking",
      description:
        "Blur, mask, or pixelate sensitive data like emails, names, and account numbers on any webpage with one-click toggle.",
      icon: FiEyeOff,
      status: "active",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      id: 2,
      title: "Advanced Ad Blocker",
      description:
        "Block intrusive ads and trackers while maintaining website functionality and user experience.",
      icon: FiShield,
      status: "coming-soon",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      id: 3,
      title: "Password Security Monitor",
      description:
        "Monitor and alert users about weak passwords and potential data breaches in real-time.",
      icon: FiLock,
      status: "coming-soon",
      gradient: "from-green-500 to-teal-600",
    },
    {
      id: 4,
      title: "Performance Optimizer",
      description:
        "Optimize page loading speeds by blocking unnecessary scripts and optimizing resource loading.",
      icon: FiZap,
      status: "coming-soon",
      gradient: "from-yellow-500 to-orange-600",
    },
    {
      id: 5,
      title: "Anti-Fingerprinting",
      description:
        "Prevent websites from tracking your digital fingerprint and protect your browsing privacy.",
      icon: FiUserX,
      status: "coming-soon",
      gradient: "from-red-500 to-pink-600",
    },
    {
      id: 6,
      title: "Custom Privacy Rules",
      description:
        "Create custom rules and filters to protect specific types of information on different websites.",
      icon: FiSettings,
      status: "coming-soon",
      gradient: "from-indigo-500 to-purple-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section id="features" className="bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive privacy protection and security features designed to
            keep you safe while browsing the web.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    {feature.status === "active" ? (
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold border border-green-500/30">
                        Active
                      </span>
                    ) : (
                      <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-semibold border border-orange-500/30">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5`}
                ></div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 text-lg">
            More features are in development. Stay tuned for updates!
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
