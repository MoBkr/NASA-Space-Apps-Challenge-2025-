import React from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const DataInsights = ({ setShowDataInsights }) => {
  const data = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 500 },
    { name: "Apr", value: 450 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-black text-white p-8 rounded-xl max-w-3xl w-full"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDataInsights(false)}
          className="absolute top-2 right-2 text-white bg-red-600 p-2 rounded-full"
        >
          ×
        </motion.button>

        <motion.h2 className="text-3xl font-bold text-cyan-300 mb-6">Data Insights</motion.h2>

        <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
          <h3 className="text-lg font-bold text-purple-300 mb-4">Monthly Data Insights</h3>
          <LineChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </div>
      </motion.div>
    </div>
  );
};

export default DataInsights;
