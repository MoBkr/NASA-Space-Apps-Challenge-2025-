import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";

// Pages
import LandingPage from "./pages/LandingPage";
import LaunchPage from "./pages/LaunchPage";
import ExplorerPage from "./pages/ExplorerPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import ImagesPage from "./pages/ImagesPage";

// Team members
const teamMembers = [
  "Mohamed Ahmed Ahmed Ramdan Shalaby",
  "Mohamed Babikir Izzeldin Abdelbasit",
  "Lamiaa Mohamed Mahmoud Mohamed",
  "Menna Mahmoud Mohamed Mahmoud",
  "Ashrakat Khaled Ahmed Abdel Rahim",
  "Hafsa Mohammed Mohammed Elsisi",
];

// Telescope data
const telescopes = [
  { id: "kepler", name: "Kepler", icon: "🌌" },
  { id: "tess", name: "TESS", icon: "🌠" },
  { id: "k2", name: "K2", icon: "🔭" },
];

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [selectedTelescope, setSelectedTelescope] = useState(null);
  const [exploreMode, setExploreMode] = useState("upload");
  const [formData, setFormData] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("user"); // أو "researcher"

  // Navigation
  const navigateTo = (page) => setCurrentPage(page);

  const handleTelescopeSelect = (telescope) => {
    setSelectedTelescope(telescope);
    navigateTo("explore");
  };

  // Form
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Upload
  const handleFileUpload = (file) => {
    setUploadedFile(file);
  };

  // Prediction
  const handlePredict = async () => {
  setIsLoading(true);
  try {
    let response;

    if (exploreMode === "upload" && uploadedFile) {
      const formDataToSend = new FormData();
      formDataToSend.append("file", uploadedFile);
      formDataToSend.append("mission", selectedTelescope);

      response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formDataToSend,
      });
    } else if (exploreMode === "manual" && Object.keys(formData).length > 0) {
      response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            features: formData,
               mission: selectedTelescope,
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
    setIsLoading(false);
  }
};

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        {currentPage === "landing" && (
          <LandingPage
            navigateTo={navigateTo}
            teamMembers={teamMembers}
          />
        )}

        {currentPage === "role" && (
  <RoleSelectionPage 
    setUserType={setUserType}   // 👈 هنا أضفناها
    navigateTo={navigateTo} 
  />
)}


        {currentPage === "launch" && (
          <LaunchPage
            navigateTo={navigateTo}
            telescopes={telescopes}
            handleTelescopeSelect={handleTelescopeSelect}
          />
        )}

        {currentPage === "explore" && (
          <ExplorerPage
            navigateTo={navigateTo}
            selectedTelescope={selectedTelescope}
            telescopes={telescopes}
            exploreMode={exploreMode}
            setExploreMode={setExploreMode}
            formData={formData}
            handleFormChange={handleFormChange}
            handleFileUpload={handleFileUpload}
            handlePredict={handlePredict}
            isLoading={isLoading}
            uploadedFile={uploadedFile}
            predictionResult={predictionResult}
            userType={userType}
          />
        )}
        {currentPage === "images" && (
          <ImagesPage navigateTo={navigateTo} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
