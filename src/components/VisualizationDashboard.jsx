import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts";

const VisualizationDashboard = ({ metrics, setShowVisualization }) => {
  if (!metrics?.report) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center text-white">
        <div className="p-6 bg-gray-900 rounded-xl border border-cyan-500/30 text-center max-w-md w-full">
          <p className="text-lg mb-4">No visualization data available yet. Please retrain or predict first.</p>
          <button
            onClick={() => setShowVisualization(false)}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const confusionData = [
    { actual: "Confirmed", predConfirmed: 50, predCandidate: 3, predFalse: 2 },
    { actual: "Candidate", predConfirmed: 4, predCandidate: 40, predFalse: 6 },
    { actual: "False Positive", predConfirmed: 1, predCandidate: 5, predFalse: 45 },
  ];

  const prCurveData = [
    { threshold: 0.1, precision: 0.6, recall: 0.9 },
    { threshold: 0.2, precision: 0.7, recall: 0.85 },
    { threshold: 0.3, precision: 0.8, recall: 0.8 },
    { threshold: 0.4, precision: 0.85, recall: 0.7 },
    { threshold: 0.5, precision: 0.9, recall: 0.6 },
  ];

  const featureImportanceData = [
    { feature: "koi_prad", importance: 0.35 },
    { feature: "koi_model_snr", importance: 0.25 },
    { feature: "koi_depth_err2", importance: 0.15 },
    { feature: "koi_fpflag_nt", importance: 0.1 },
    { feature: "koi_duration_err2", importance: 0.05 },
  ];

  const [visibleSections, setVisibleSections] = useState({
    confusion: true,
    prCurve: true,
    features: true,
  });

  const toggleSection = (section) => {
    setVisibleSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 overflow-y-auto p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 md:p-6 rounded-3xl w-full max-w-5xl text-white border border-cyan-500/30 shadow-2xl mx-auto"
      >
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
          AI Visualization Dashboard
        </h2>

        <div className="flex flex-wrap justify-center gap-3 mb-6 text-xs md:text-sm">
          <button
            onClick={() => toggleSection("confusion")}
            className={`px-3 py-1.5 rounded-lg font-semibold border transition-all duration-300 ${
              visibleSections.confusion
                ? "bg-purple-600 border-purple-400 hover:bg-purple-700"
                : "bg-gray-800 border-gray-600 hover:bg-gray-700"
            }`}
          >
            {visibleSections.confusion ? "Hide Confusion Matrix" : "Show Confusion Matrix"}
          </button>
          <button
            onClick={() => toggleSection("prCurve")}
            className={`px-3 py-1.5 rounded-lg font-semibold border transition-all duration-300 ${
              visibleSections.prCurve
                ? "bg-cyan-600 border-cyan-400 hover:bg-cyan-700"
                : "bg-gray-800 border-gray-600 hover:bg-gray-700"
            }`}
          >
            {visibleSections.prCurve ? "Hide Precision–Recall Curve" : "Show Precision–Recall Curve"}
          </button>
          <button
            onClick={() => toggleSection("features")}
            className={`px-3 py-1.5 rounded-lg font-semibold border transition-all duration-300 ${
              visibleSections.features
                ? "bg-pink-600 border-pink-400 hover:bg-pink-700"
                : "bg-gray-800 border-gray-600 hover:bg-gray-700"
            }`}
          >
            {visibleSections.features ? "Hide Feature Importance" : "Show Feature Importance"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700">
          <AnimatePresence>
            {visibleSections.confusion && (
              <motion.div
                key="confusion"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-900/60 backdrop-blur-lg p-4 md:p-6 rounded-2xl border border-purple-500/30 shadow-lg"
              >
                <h3 className="text-lg md:text-xl font-semibold mb-3 text-purple-300 text-center">Confusion Matrix</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={confusionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="actual" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
                    <Legend />
                    <Bar dataKey="predConfirmed" stackId="a" fill="#22c55e" name="Pred Confirmed" />
                    <Bar dataKey="predCandidate" stackId="a" fill="#eab308" name="Pred Candidate" />
                    <Bar dataKey="predFalse" stackId="a" fill="#ef4444" name="Pred False Positive" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {visibleSections.prCurve && (
              <motion.div
                key="prCurve"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-900/60 backdrop-blur-lg p-4 md:p-6 rounded-2xl border border-cyan-500/30 shadow-lg"
              >
                <h3 className="text-lg md:text-xl font-semibold mb-3 text-cyan-300 text-center">Precision–Recall Curve</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={prCurveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="threshold" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
                    <Legend />
                    <Line type="monotone" dataKey="precision" stroke="#22c55e" strokeWidth={3} />
                    <Line type="monotone" dataKey="recall" stroke="#06b6d4" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {visibleSections.features && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-900/60 backdrop-blur-lg p-4 md:p-6 mt-6 rounded-2xl border border-pink-500/30 shadow-lg"
            >
              <h3 className="text-lg md:text-xl font-semibold mb-3 text-pink-300 text-center">Feature Importance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis type="number" stroke="#ccc" />
                  <YAxis dataKey="feature" type="category" stroke="#ccc" width={100} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
                  <Bar dataKey="importance" fill="#ec4899" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowVisualization(false)}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl font-bold text-sm md:text-base shadow-lg"
          >
            Close Dashboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default VisualizationDashboard;