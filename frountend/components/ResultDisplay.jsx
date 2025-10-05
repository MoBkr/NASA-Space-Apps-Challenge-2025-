import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const ResultDisplay = ({ result }) => {
  const counts = result?.counts || {};

  // ---------- Probability Distribution ----------
  const total =
    (counts.Confirmed || 0) +
    (counts.Candidate || 0) +
    (counts["False Positive"] || 0);

  const probabilityData =
    total > 0
      ? [
          {
            name: "Confirmed",
            probability: (counts.Confirmed || 0) / total,
            color: "#22c55e",
          },
          {
            name: "Candidate",
            probability: (counts.Candidate || 0) / total,
            color: "#eab308",
          },
          {
            name: "False Positive",
            probability: (counts["False Positive"] || 0) / total,
            color: "#ef4444",
          },
        ]
      : [];

  return (
    <div className="space-y-8">
      {/* --- Probability Distribution --- */}
      {probabilityData.length > 0 && !result?.manualInputData ? (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-cyan-300">
            Probability Distribution
          </h3>

          {/* --- Probability Boxes --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {probabilityData.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border text-center shadow-lg`}
                style={{
                  backgroundColor: `${item.color}33`,
                  borderColor: `${item.color}55`,
                  color: item.color,
                }}
              >
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xl font-bold">
                  {(item.probability * 100).toFixed(2)}%
                </p>
              </div>
            ))}
          </div>

          {/* --- Pie Chart --- */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={probabilityData}
                  dataKey="probability"
                  nameKey="name"
                  outerRadius={130}
                  label={({ name, probability }) =>
                    `${name}: ${(probability * 100).toFixed(1)}%`
                  }
                >
                  {probabilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) =>
                    `${(value * 100).toFixed(2)}% (${name})`
                  }
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#fff", // White text for clarity
                  }}
                  labelStyle={{
                    color: "#fff", // White label text
                    fontWeight: "600",
                  }}
                  itemStyle={{
                    color: "#fff", // White items inside the tooltip
                    fontSize: "14px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        // If no data is available to display for probability, display a message
        <div className="text-center text-gray-500">
          <p>No data available to display for the prediction results.</p>
        </div>
      )}

      {/* --- Manual Prediction Probabilities --- */}
      {result?.manualInputData ? (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-cyan-300">
            Manual Input Prediction
          </h3>

          <div className="p-4 rounded-lg border text-center shadow-lg">
            <p className="text-sm font-medium">Prediction</p>
            <p className="text-xl font-bold">{result.manualInputData.prediction}</p>
            <p className="text-sm font-medium">Probability</p>
            <p className="text-xl font-bold">
              {result.manualInputData.prediction_prob_1
                ? (result.manualInputData.prediction_prob_1 * 100).toFixed(2)
                : "N/A"}%
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ResultDisplay;
