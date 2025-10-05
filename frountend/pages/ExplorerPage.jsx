import React, { useState } from "react";
import { motion } from "framer-motion";
import FileUpload from "../components/FileUpload";
import ManualInput from "../components/ManualInput";
import ResultDisplay from "../components/ResultDisplay";
import Footer from "../components/Footer";
import RocketAnimation from "../components/RocketAnimation";
import ResearcherDashboard from "../components/ResearcherDashboard";
import VisualizationDashboard from "../components/VisualizationDashboard";
import { telescopeFields } from "../components/telescopeFields";

const ExplorerPage = ({
  navigateTo,
  selectedTelescope,
  telescopes,
  exploreMode,
  setExploreMode,
  formData,
  handleFormChange,
  handleFileUpload,
  isLoading,
  uploadedFile,
  userType,
}) => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false); // حالة التحميل المحلية
  const [predictionResult, setPredictionResult] = useState(null);  // إضافة حالة لتخزين نتائج التنبؤ
const [showDashboardInsights, setShowDashboardInsights] = useState(false);

  const telescope = telescopes.find((t) => t.id === selectedTelescope);

  // دالة handlePredict
const handlePredict = async () => {
  setIsLoadingPrediction(true); // تعيين حالة التحميل أثناء إجراء التنبؤ
  try {
    let response;

    // رفع ملف
    if (exploreMode === "upload" && uploadedFile) {
      const formDataToSend = new FormData();
      formDataToSend.append("file", uploadedFile);
      formDataToSend.append("mission", selectedTelescope);  // إرسال التلسكوب المختار

      response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formDataToSend,
      });
    } else if (exploreMode === "manual" && Object.keys(formData).length > 0) {
      response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: formData,  // البيانات المدخلة يدويًا
          mission: selectedTelescope,  // إرسال التلسكوب المحدد
        }),
      });
    }

    const data = await response.json();
    console.log("API Response:", data);

    setPredictionResult({
      counts: data.counts || {},
      metrics: data.metrics || null,
      lightCurve: data.light_curve || [],
      sample: data.sample || [],
    });
  } catch (err) {
    console.error("Prediction error:", err);
  } finally {
    setIsLoadingPrediction(false);  // إعادة تعيين حالة التحميل بعد انتهاء العملية
  }
};
  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigateTo("launch")}
          className="mb-8 px-4 py-2 bg-gray-800 text-white rounded-full border border-gray-600 hover:bg-gray-700 transition-colors flex items-center"
        >
          ← Back to Telescopes
        </motion.button>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-8 text-cyan-300"
        >
          Exploring with {telescope?.name} {telescope?.icon}
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Input Section */}
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
            <h2 className="text-xl font-bold mb-4 text-purple-300">Select Input Method</h2>

            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setExploreMode("upload")}
                className={`px-4 py-2 rounded-full transition-all ${
                  exploreMode === "upload"
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setExploreMode("manual")}
                className={`px-4 py-2 rounded-full transition-all ${
                  exploreMode === "manual"
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Manual Input
              </button>
            </div>

            {exploreMode === "upload" ? (
              <FileUpload onFileSelect={handleFileUpload} />
            ) : (
              <ManualInput
                formData={formData}
                onChange={handleFormChange}
                selectedTelescope={selectedTelescope}
              />
            )}

            <div className="flex flex-col space-y-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePredict}  // ربط الزر مع handlePredict
                disabled={
                  isLoadingPrediction ||
                  (exploreMode === "upload" && !uploadedFile) ||
                  (exploreMode === "manual" &&
                    Object.keys(formData).length <
                      (telescopeFields[selectedTelescope]?.length || 0))
                }
                className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                  isLoadingPrediction ||
                  (exploreMode === "upload" && !uploadedFile) ||
                  (exploreMode === "manual" &&
                    Object.keys(formData).length <
                      (telescopeFields[selectedTelescope]?.length || 0))
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                }`}
              >
                {isLoadingPrediction ? "Analyzing..." : "Start Prediction"}
              </motion.button>

              {/* Researcher Dashboard button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDashboard(true)}
                className="w-full py-3 rounded-lg font-bold text-white transition-all bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Open Researcher Dashboard
              </motion.button>

              {/* Visualization Dashboard button */}
              {predictionResult && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowVisualization(true)}
                  className="w-full py-3 rounded-lg font-bold text-white transition-all bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600"
                >
                  Train Your Own Model
                </motion.button>
              )}
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => navigateTo("images")}
  className="w-full py-3 rounded-lg font-bold text-white transition-all bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
>
  Open Dashboard Insights
</motion.button>
{/* Removed modal rendering, now navigates to images page */}
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
            <h2 className="text-xl font-bold mb-4 text-purple-300">Prediction Results</h2>
            {isLoadingPrediction ? (
              <div className="flex flex-col items-center justify-center h-64">
                <RocketAnimation />
                <p className="mt-4 text-cyan-300">Analyzing data...</p>
              </div>
            ) : predictionResult ? (
              <ResultDisplay result={predictionResult} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p>Submit data to see prediction results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Researcher Dashboard Modal */}
      {showDashboard && (
        <ResearcherDashboard
          selectedTelescope={selectedTelescope}
          metrics={predictionResult?.metrics}
          confusionMatrix={predictionResult?.confusion_matrix}
          setShowDashboard={setShowDashboard}
        />
      )}

      {/* Visualization Dashboard Modal */}
      {showVisualization && (
        <VisualizationDashboard
          selectedTelescope={selectedTelescope}
          metrics={predictionResult?.metrics}
          setShowVisualization={setShowVisualization}
        />
      )}

      <Footer />
    </div>
  );
};

export default ExplorerPage;
