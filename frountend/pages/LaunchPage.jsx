import { motion } from "framer-motion";
import Footer from "../components/Footer";

const LaunchPage = ({ navigateTo, telescopes, handleTelescopeSelect }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-black text-white relative overflow-hidden">
      {/* Starry background */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDuration: `${Math.random() * 3 + 1}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="w-32 h-32 mx-auto">
            <svg 
              width="128" 
              height="128" 
              viewBox="0 0 100 100" 
              className="animate-bounce"
            >
              {/* Rocket body */}
              <path 
                d="M50 20 L60 40 L40 40 Z" 
                fill="#4fd1c7" 
                stroke="#06b6d4" 
                strokeWidth="1"
              />
              <rect x="45" y="40" width="10" height="30" fill="#4fd1c7" stroke="#06b6d4" strokeWidth="1" />
              
              {/* Rocket fins */}
              <path d="M40 40 L30 50 L40 50 Z" fill="#4fd1c7" stroke="#06b6d4" strokeWidth="1" />
              <path d="M60 40 L70 50 L60 50 Z" fill="#4fd1c7" stroke="#06b6d4" strokeWidth="1" />
              
              {/* Rocket window */}
              <circle cx="50" cy="50" r="4" fill="#06b6d4" />
              
              {/* Rocket exhaust */}
              <path d="M45 70 L40 80 L60 80 L55 70 Z" fill="#f59e0b" />
              <path d="M47 70 L45 75 L55 75 L53 70 Z" fill="#f97316" />
              
              {/* Motion lines */}
              <path d="M50 85 L50 95" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2,2" />
              <path d="M45 83 L43 93" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2,2" />
              <path d="M55 83 L57 93" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2,2" />
            </svg>
          </div>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl md:text-4xl font-bold mb-8 text-cyan-300"
        >
          Choose your space exploration journey with a telescope
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {telescopes.map((telescope) => (
            <motion.div
              key={telescope.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3  }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-gray-900/70 backdrop-blur-sm rounded-xl border border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
              onClick={() => handleTelescopeSelect(telescope.id)}
            >
              <div className="text-4xl mb-4">{telescope.icon}</div>
              <h3 className="text-xl font-bold text-cyan-300">{telescope.name}</h3>
              <p className="text-gray-400 mt-2">Explore exoplanet data from the {telescope.name} telescope</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={() => navigateTo('landing')}
          className="mt-12 px-6 py-2 bg-gray-800 text-white rounded-full border border-gray-600 hover:bg-gray-700 transition-colors"
        >
          ← Back to Home
        </motion.button>
      </div>

      <Footer />
    </div>
  );
};

export default LaunchPage;
