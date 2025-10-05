import { motion } from "framer-motion";
import Footer from "../components/Footer";

const LandingPage = ({ navigateTo, teamMembers }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-gradient-to-br from-black via-blue-900 to-purple-900 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-4 font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
          Faculty Of ExcoPlanets
        </h1>
        <h2 className="text-xl md:text-2xl mb-8 text-cyan-200">Local Event: Shebeen El-Kom</h2>
        
        <div className="max-w-2xl mx-auto mb-2 p-6 bg-black/30 backdrop-blur-sm rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-cyan-300">
            A World Away: Hunting for Exoplanets with AI
          </h3>
          <p className="text-lg text-gray-300">
            NASA's exoplanet missions have revealed thousands of planets beyond our solar system, mostly through
            manual identification. This challenge calls for building an AI/ML model trained on open-source exoplanet
            datasets to automatically analyze new data and accurately detect exoplanets.
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="w-full max-w-4xl mb-16"
      >
        <h3 className="text-2xl font-bold mb-6 text-center text-purple-300">
          Team SOL – Space Of Learning
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30 flex items-center"
            >
              <span className="mr-3 text-xl">👨‍🚀</span>
              <span>{member}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigateTo('role')}
        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-full text-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
      >
        Start Now →
      </motion.button>

      <Footer />
    </div>
  );
};

export default LandingPage;
