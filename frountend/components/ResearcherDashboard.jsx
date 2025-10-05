import React, { useState } from "react";
import { motion } from "framer-motion";

const ResearcherDashboard = ({  selectedTelescope, initialMetrics, confusionMatrix, setShowDashboard   }) => {
  const [hyperparams, setHyperparams] = useState({});
  const [loading, setLoading] = useState(false);
const [metrics, setMetrics] = useState(initialMetrics || null);
const [retrainFile, setRetrainFile] = useState(null);

  const handleChange = (key, value) => {
    setHyperparams((prev) => ({ ...prev, [key]: value }));
  };

const handleRetrain = async () => {
  if (!retrainFile) {
    alert("Please upload a CSV file for retraining.");
    return;
  }

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append("mission", selectedTelescope);
    formData.append("file", retrainFile);

    // ✅ لو التلسكوب Kepler نبعث باراميتراته
    if (selectedTelescope === "kepler") {
      formData.append("learning_rate", hyperparams.learning_rate || 0.1);
      formData.append("max_depth", hyperparams.max_depth || 6);
      formData.append("n_estimators", hyperparams.n_estimators || 100);
    }

    // ✅ ارسال الريكويست
    const response = await fetch("http://127.0.0.1:8000/retrain", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Retrain response:", data);

    if (data.metrics) {
      setMetrics({
        ...data.metrics,
        status: data.status || "Status not available"
      });
    } else {
      alert("Retrain finished, but no metrics returned.");
    }
    if (data.model_path) {
  setMetrics((prev) => ({
    ...prev,
    model_path: data.model_path
  }));
}
  } catch (error) {
    console.error("Retrain failed:", error);
    alert("Retrain failed. Check console for details.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-gray-900 p-6 rounded-xl max-w-4xl w-full text-white shadow-xl border border-cyan-500/30"
      >
        {/* Header */}
        <h2 className="text-2xl font-bold mb-2">
          Researcher Dashboard — {selectedTelescope?.toUpperCase()}
        </h2>
        <p className="text-gray-400 mb-6">
          Model in use:{" "}
          {selectedTelescope === "kepler" &&
            "XGBoost (optimized for transit detection)"}
          {selectedTelescope === "k2" &&
            "LightGBM (handles noisy K2 data with drift)"}
          {selectedTelescope === "tess" &&
            "Neural Network (captures large-scale TESS patterns)"}
        </p>

        {/* ✅ Model Overview Section */}
        <div className="bg-gray-800/70 p-4 rounded-lg mb-6 border border-cyan-500/30">
          <h3 className="text-lg font-semibold mb-3 text-cyan-300">
            Model Overview
          </h3>
          {selectedTelescope === "kepler" && (
            <p className="text-gray-300">
              <span className="font-bold text-cyan-400">XGBoost</span> is used
              for Kepler. It’s highly effective for tabular data and optimized
              for transit detection with high accuracy and robustness.
            </p>
          )}
          {selectedTelescope === "k2" && (
            <p className="text-gray-300">
              <span className="font-bold text-cyan-400">LightGBM</span> is used
              for K2. It performs well with noisy data and can handle drift in
              K2’s observations, making it efficient and reliable.
            </p>
          )}
          {selectedTelescope === "tess" && (
            <p className="text-gray-300">
              <span className="font-bold text-cyan-400">Neural Network</span> is
              used for TESS. It captures complex patterns in the massive TESS
              dataset and is powerful for analyzing subtle transit signals.
            </p>
          )}
        </div>

        {/* ✅ Hyperparameter Controls */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Hyperparameter Controls
          </h3>
{selectedTelescope === "kepler" && (
  <div className="space-y-4">

    {/* Learning Rate */}
    <div className="flex items-center space-x-4">
      <label className="w-40">Learning Rate:</label>
      <input
        type="number"
        step="0.01"
        className="flex-grow max-w-md px-2 py-1 bg-gray-800 rounded"
        value={hyperparams.learning_rate}
        onChange={(e) =>
          handleChange("learning_rate", parseFloat(e.target.value))
        }
      />
      <span
        className={`font-semibold ${
          hyperparams.learning_rate < 0.01
            ? "text-yellow-400"
            : hyperparams.learning_rate > 0.3
            ? "text-red-500"
            : "text-green-500"
        }`}
      >
        {hyperparams.learning_rate < 0.01
          ? "⚠️ Low (Underfitting)"
          : hyperparams.learning_rate > 0.3
          ? "⚠️ High (Overfitting)"
          : "✅ Suitable"}
      </span>
    </div>

    {/* Max Depth */}
    <div className="flex items-center space-x-4">
      <label className="w-40">Max Depth:</label>
      <input
        type="number"
        className="flex-grow max-w-md px-2 py-1 bg-gray-800 rounded"
        value={hyperparams.max_depth}
        onChange={(e) =>
          handleChange("max_depth", parseInt(e.target.value))
        }
      />
      <span
        className={`font-semibold ${
          hyperparams.max_depth < 3
            ? "text-yellow-400"
            : hyperparams.max_depth > 10
            ? "text-red-500"
            : "text-green-500"
        }`}
      >
        {hyperparams.max_depth < 3
          ? "⚠️ Too Shallow (Underfitting)"
          : hyperparams.max_depth > 10
          ? "⚠️ Too Deep (Overfitting)"
          : "✅ Suitable"}
      </span>
    </div>

    {/* Estimators */}
    <div className="flex items-center space-x-4">
      <label className="w-40">Estimators:</label>
      <input
        type="number"
        className="flex-grow max-w-md px-2 py-1 bg-gray-800 rounded"
        value={hyperparams.n_estimators}
        onChange={(e) =>
          handleChange("n_estimators", parseInt(e.target.value))
        }
      />
      <span
        className={`font-semibold ${
          hyperparams.n_estimators < 50
            ? "text-yellow-400"
            : hyperparams.n_estimators > 1000
            ? "text-red-500"
            : "text-green-500"
        }`}
      >
        {hyperparams.n_estimators < 50
          ? "⚠️ Too Few (Underfitting)"
          : hyperparams.n_estimators > 1000
          ? "⚠️ Too Many (Overfitting / Slow)"
          : "✅ Suitable"}
      </span>
    </div>
  </div>
)}



          {selectedTelescope === "k2" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="w-40">Num Leaves:</label>
                <input
                  type="number"
                  className="flex-1 px-2 py-1 bg-gray-800 rounded"
                  onChange={(e) =>
                    handleChange("num_leaves", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="w-40">Feature Fraction:</label>
                <input
                  type="number"
                  step="0.1"
                  className="flex-1 px-2 py-1 bg-gray-800 rounded"
                  onChange={(e) =>
                    handleChange("feature_fraction", parseFloat(e.target.value))
                  }
                />
              </div>
            </div>
          )}

          {selectedTelescope === "tess" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="w-40">Epochs:</label>
                <input
                  type="number"
                  className="flex-1 px-2 py-1 bg-gray-800 rounded"
                  onChange={(e) =>
                    handleChange("epochs", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="w-40">Batch Size:</label>
                <input
                  type="number"
                  className="flex-1 px-2 py-1 bg-gray-800 rounded"
                  onChange={(e) =>
                    handleChange("batch_size", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="w-40">Learning Rate:</label>
                <input
                  type="number"
                  step="0.001"
                  className="flex-1 px-2 py-1 bg-gray-800 rounded"
                  onChange={(e) =>
                    handleChange("learning_rate", parseFloat(e.target.value))
                  }
                />
              </div>
            </div>
          )}
        </div>

<div className="mt-6">
  <label className="block mb-2 text-sm font-medium text-gray-300">
    Upload CSV for Retraining
  </label>
  <input
    type="file"
    accept=".csv"
    onChange={(e) => setRetrainFile(e.target.files[0])}
    className="mb-3"
  />
</div>
        {/* ✅ Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={handleRetrain}
            className="px-4 py-2 bg-cyan-600 rounded-lg"
            disabled={loading}
          >
            {loading ? "Retraining..." : "Apply & Retrain"}
          </button>
          <button
            onClick={() => setShowDashboard(false)}
            className="px-4 py-2 bg-red-600 rounded-lg"
          >
            Close
          </button>
        </div>

        {/* ✅ عرض النتائج الجديدة */}
        {metrics && (
          <div className="mt-6 bg-gray-800 p-4 rounded-lg">
  <h3 className="text-lg font-semibold mb-4">Updated Metrics</h3>

  <div className="flex">
    {/* ✅ الجزء الخاص بالميتريكس */}
    <div className="flex-1 space-y-2">
      <p>Accuracy: {(metrics.test_accuracy * 100).toFixed(2)}%</p>
      <p>Precision: {(metrics.precision * 100).toFixed(2)}%</p>
      <p>Recall: {(metrics.recall * 100).toFixed(2)}%</p>
      <p>F1 Score: {(metrics.f1 * 100).toFixed(2)}%</p>
    </div>

    {/* ✅ صندوق الحالة - ياخد المساحة المتاحة */}
<div className="flex-1 flex items-center justify-center">
<div
  className={`w-full h-full flex items-center justify-center text-3xl font-extrabold rounded-xl border shadow-2xl ${
    metrics?.status === "Overfitting"
      ? "text-red-500 border-red-500"
      : metrics?.status === "Underfitting"
      ? "text-yellow-500 border-yellow-500"
      : "text-green-400 border-green-400"
  }`}
  style={{
    minHeight: "120px",
    textShadow: "0 0 15px #000000, 0 0 30px currentColor",
  }}
>
  {metrics?.status ?? "Status not available"}
</div>
</div>
</div>
{/* ✅ رابط تحميل الموديل retrained */}
{metrics?.model_path && (
  <div className="flex justify-start items-center mt-2">
    <a
      href={`http://127.0.0.1:8000/download_model?mission=${selectedTelescope}&retrained=true`}
      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:from-green-600 hover:to-emerald-700 transition"
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
      </svg>
      Download Retrained Model
    </a>
  </div>
)}

          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResearcherDashboard;
