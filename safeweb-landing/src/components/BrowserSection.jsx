import { motion } from "framer-motion";
import { FiGlobe } from "react-icons/fi";
import { SiGooglechrome, SiFirefox } from "react-icons/si";

const BrowserSection = () => {
  const browsers = [
    {
      name: "Chrome",
      icon: SiGooglechrome,
      status: "in-development",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      name: "Firefox",
      icon: SiFirefox,
      status: "planned",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
    },
    {
      name: "Edge",
      icon: FiGlobe,
      status: "planned",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      name: "Safari",
      icon: FiGlobe,
      status: "planned",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
    },
    {
      name: "Opera",
      icon: FiGlobe,
      status: "planned",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="browsers" className="bg-gray-800 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Browser{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Compatibility
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Safe-Web will be available across all major browsers to ensure
            maximum accessibility and user convenience.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {browsers.map((browser, index) => {
            const IconComponent = browser.icon;
            return (
              <motion.div
                key={browser.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`${browser.bgColor} ${browser.borderColor} border rounded-xl p-6 text-center backdrop-blur-sm hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex flex-col items-center">
                  <IconComponent
                    className={`w-16 h-16 ${browser.color} mb-4`}
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {browser.name}
                  </h3>

                  {browser.status === "in-development" ? (
                    <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm font-semibold border border-cyan-500/30">
                      Available
                    </span>
                  ) : (
                    <span className="bg-gray-600/20 text-gray-400 px-3 py-1 rounded-full text-sm font-semibold border border-gray-600/30">
                      Coming Soon
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 text-lg">
            Chrome extension is currently in development. Other browsers will
            follow soon after.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BrowserSection;
