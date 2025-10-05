import React from "react";
import { motion } from "framer-motion";

const RoleSelectionPage = ({ navigateTo, setUserType }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-gradient-to-br from-black via-blue-900 to-purple-900 text-white">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-12 text-cyan-300"
      >
        Who are you?
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
        {/* Researcher */}
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="p-8 bg-gray-900/70 backdrop-blur-sm rounded-xl border border-cyan-500/30 cursor-pointer hover:border-cyan-400 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 text-center"
          onClick={() => {
            setUserType("researcher");
            navigateTo("launch");
          }}
        >
          <h3 className="text-2xl font-bold text-purple-300 mb-4">I am a Researcher</h3>
          <p className="text-gray-400">Access detailed statistics, train models, and tweak hyperparameters.</p>
        </motion.div>

        {/* User / Student */}
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="p-8 bg-gray-900/70 backdrop-blur-sm rounded-xl border border-cyan-500/30 cursor-pointer hover:border-cyan-400 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 text-center"
          onClick={() => {
            setUserType("user");
            navigateTo("launch");
          }}
        >
          <h3 className="text-2xl font-bold text-purple-300 mb-4">I am a User / Student</h3>
          <p className="text-gray-400">Explore exoplanet data and learn with an interactive experience.</p>
        </motion.div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigateTo("landing")}
        className="mt-12 px-6 py-2 bg-gray-800 text-white rounded-full border border-gray-600 hover:bg-gray-700 transition-colors"
      >
        ← Back to Home
      </motion.button>
    </div>
  );
};

export default RoleSelectionPage;
