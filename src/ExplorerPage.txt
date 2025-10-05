// ExplorerPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import FileUpload from './FileUpload.jsx';
import ManualInput from './ManualInput.jsx';
import ResultDisplay from './ResultDisplay.jsx';
import RocketAnimation from './RocketAnimation.jsx';
import Footer from './Footer.jsx';

// Model presets per telescope
const MODEL_PRESETS = {
  kepler: {
    modelName: 'XGBoost',
    params: {
      learning_rate: 0.05,
      n_estimators: 200,
      max_depth: 8,
      subsample: 0.8,
      colsample_bytree: 0.8,
    },
    paramRanges: {
      learning_rate: { min: 0.001, max: 1, step: 0.001 },
      n_estimators: { min: 1, max: 1000, step: 1 },
      max_depth: { min: 1, max: 50, step: 1 },
      subsample: { min: 0.1, max: 1, step: 0.01 },
      colsample_bytree: { min: 0.1, max: 1, step: 0.01 },
    },
  },
  tess: {
    modelName: 'LightGBM',
    params: {
      learning_rate: 0.01,
      num_leaves: 31,
      max_depth: -1,
      feature_fraction: 0.9,
      bagging_fraction: 0.8,
    },
    paramRanges: {
      learning_rate: { min: 0.001, max: 1, step: 0.001 },
      num_leaves: { min: 1, max: 200, step: 1 },
      max_depth: { min: -1, max: 50, step: 1 },
      feature_fraction: { min: 0.1, max: 1, step: 0.01 },
      bagging_fraction: { min: 0.1, max: 1, step: 0.01 },
    },
  },
  k2: {
    modelName: 'RandomForest',
    params: {
      n_estimators: 120,
      max_depth: 10,
      min_samples_split: 2,
      min_samples_leaf: 1,
    },
    paramRanges: {
      n_estimators: { min: 1, max: 1000, step: 1 },
      max_depth: { min: 1, max: 50, step: 1 },
      min_samples_split: { min: 2, max: 100, step: 1 },
      min_samples_leaf: { min: 1, max: 100, step: 1 },
    },
  },
};

// Helper to download JSON file
const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Helper to download CSV file from predictions (mock)
const downloadCSV = (predictions, filename) => {
  if (!predictions || !Array.isArray(predictions)) return;
  const header = Object.keys(predictions[0]).join(',');
  const rows = predictions.map(row => Object.values(row).join(',')).join('\n');
  const csvContent = `${header}\n${rows}`;
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ModelControls component
const ModelControls = ({
  telescope,
  userRole,
  onTrainingComplete,
}) => {
  const [showControls, setShowControls] = useState(false);
  const [modelName, setModelName] = useState('');
  const [params, setParams] = useState({});
  const [paramRanges, setParamRanges] = useState({});
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [trainingJobId, setTrainingJobId] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [rocData, setRocData] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(null);
  const trainingIntervalRef = useRef(null);
  const isMounted = useRef(true);

  // Load settings from localStorage or defaults on telescope or showControls change
  useEffect(() => {
    if (!showControls || !telescope) return;

    const key = `model_${telescope}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setModelName(parsed.modelName);
        setParams(parsed.params);
        setParamRanges(MODEL_PRESETS[telescope]?.paramRanges || {});
      } catch {
        // fallback to defaults
        const preset = MODEL_PRESETS[telescope];
        setModelName(preset.modelName);
        setParams(preset.params);
        setParamRanges(preset.paramRanges);
      }
    } else {
      const preset = MODEL_PRESETS[telescope];
      setModelName(preset.modelName);
      setParams(preset.params);
      setParamRanges(preset.paramRanges);
    }
    // Reset training state and metrics on telescope or toggle change
    setIsTraining(false);
    setProgress(0);
    setLogs([]);
    setTrainingJobId(null);
    setMetrics(null);
    setConfusionMatrix(null);
    setRocData(null);
    setFeatureImportance(null);
  }, [telescope, showControls]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
    };
  }, []);

  // Handle param input change with validation
  const handleParamChange = (key, value) => {
    const range = paramRanges[key];
    let valNum = Number(value);
    if (isNaN(valNum)) return;
    if (range) {
      if (valNum < range.min) valNum = range.min;
      if (valNum > range.max) valNum = range.max;
    }
    setParams(prev => ({ ...prev, [key]: valNum }));
  };

  // Save settings to localStorage
  const saveSettings = () => {
    if (!telescope) return;
    const key = `model_${telescope}`;
    const data = { modelName, params };
    localStorage.setItem(key, JSON.stringify(data));
    addLog('Settings saved locally.');
  };

  // Export settings JSON
  const exportSettings = () => {
    const data = { modelName, params };
    downloadJSON(data, `${telescope}_model_settings.json`);
  };

  // Import settings JSON
  const importSettings = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.modelName && json.params) {
          // Validate keys match current model params keys
          const presetKeys = Object.keys(MODEL_PRESETS[telescope].params);
          const importKeys = Object.keys(json.params);
          const keysMatch = presetKeys.every(k => importKeys.includes(k));
          if (!keysMatch) {
            alert('Imported settings do not match current model parameters.');
            return;
          }
          setModelName(json.modelName);
          setParams(json.params);
          addLog('Settings imported successfully.');
        } else {
          alert('Invalid settings file.');
        }
      } catch {
        alert('Failed to parse JSON.');
      }
    };
    reader.readAsText(file);
    // Reset input value to allow re-import same file if needed
    e.target.value = null;
  };

  // Add a log entry
  const addLog = (msg) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  // Simulate training locally with random progress updates
  const simulateTraining = () => {
    setIsTraining(true);
    setProgress(0);
    setLogs([]);
    addLog('Training started (simulation).');

    let currentProgress = 0;
    trainingIntervalRef.current = setInterval(() => {
      if (!isMounted.current) return;
      currentProgress += Math.floor(Math.random() * 10) + 5; // 5-14%
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        addLog('Training completed.');
        clearInterval(trainingIntervalRef.current);
        trainingIntervalRef.current = null;
        setIsTraining(false);
        // Produce mock metrics and results
        const mockMetrics = {
          accuracy: 0.92,
          precision: 0.89,
          recall: 0.91,
          f1: 0.90,
          auc: 0.94,
        };
        const mockConfusionMatrix = {
          tp: 90,
          fp: 10,
          fn: 9,
          tn: 91,
        };
        const mockRocData = [
          { fpr: 0.0, tpr: 0.0 },
          { fpr: 0.1, tpr: 0.6 },
          { fpr: 0.2, tpr: 0.75 },
          { fpr: 0.3, tpr: 0.85 },
          { fpr: 0.4, tpr: 0.9 },
          { fpr: 1.0, tpr: 1.0 },
        ];
        const mockFeatureImportance = [
          { name: 'Feature A', importance: 40 },
          { name: 'Feature B', importance: 30 },
          { name: 'Feature C', importance: 20 },
          { name: 'Feature D', importance: 10 },
        ];
        setMetrics(mockMetrics);
        setConfusionMatrix(mockConfusionMatrix);
        setRocData(mockRocData);
        setFeatureImportance(mockFeatureImportance);
        onTrainingComplete && onTrainingComplete(mockMetrics);
      } else {
        setProgress(currentProgress);
        addLog(`Training progress: ${currentProgress}%`);
      }
    }, Math.floor(Math.random() * 300) + 500); // 500-800ms interval
  };

  // Start training handler
  const startTraining = async () => {
    if (isTraining) return;
    setLogs([]);
    setProgress(0);
    setMetrics(null);
    setConfusionMatrix(null);
    setRocData(null);
    setFeatureImportance(null);

    // Try backend call
    try {
      setIsTraining(true);
      addLog('Starting training on backend...');
      const response = await fetch('/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telescope, modelSettings: { modelName, params } }),
      });
      if (!response.ok) throw new Error('Backend training start failed');
      const { job_id } = await response.json();
      setTrainingJobId(job_id);
      addLog(`Training job started: ${job_id}`);

      // Polling training status
      const pollInterval = 1000;
      const pollTrainingStatus = async () => {
        if (!isMounted.current) return;
        try {
          const statusRes = await fetch(`/train/${job_id}/status`);
          if (!statusRes.ok) throw new Error('Failed to get training status');
          const statusData = await statusRes.json();
          setProgress(statusData.progress);
          addLog(`Training progress: ${statusData.progress}%`);
          if (statusData.progress >= 100) {
            setIsTraining(false);
            setMetrics(statusData.metrics);
            setConfusionMatrix(statusData.confusionMatrix);
            setRocData(statusData.rocData);
            setFeatureImportance(statusData.featureImportance);
            addLog('Training completed.');
            onTrainingComplete && onTrainingComplete(statusData.metrics);
          } else {
            setTimeout(pollTrainingStatus, pollInterval);
          }
        } catch (err) {
          addLog('Error polling training status, switching to simulation.');
          setIsTraining(false);
          simulateTraining();
        }
      };
      pollTrainingStatus();
    } catch (err) {
      addLog('Backend training unavailable, simulating training.');
      simulateTraining();
    }
  };

  // Stop training handler
  const stopTraining = () => {
    if (!isTraining) return;
    if (trainingIntervalRef.current) {
      clearInterval(trainingIntervalRef.current);
      trainingIntervalRef.current = null;
    }
    setIsTraining(false);
    setProgress(0);
    addLog('Training stopped by user.');
  };

  // Download predictions mock
  const downloadPredictions = () => {
    // Mock predictions data
    const mockPredictions = [
      { id: 1, prediction: 'Class A', probability: 0.95 },
      { id: 2, prediction: 'Class B', probability: 0.85 },
      { id: 3, prediction: 'Class A', probability: 0.90 },
    ];
    downloadCSV(mockPredictions, `${telescope}_predictions.csv`);
  };

  // Download model mock
  const downloadModel = () => {
    // Mock model file as JSON
    const modelData = {
      modelName,
      params,
      trainedAt: new Date().toISOString(),
    };
    downloadJSON(modelData, `${telescope}_trained_model.json`);
  };

  if (userRole !== 'researcher') return null;

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 mb-12">
      <button
        onClick={() => setShowControls(!showControls)}
        className="mb-6 px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-colors"
        aria-expanded={showControls}
        aria-controls="model-controls-panel"
      >
        {showControls ? 'Hide Model Controls' : 'Show Model Controls'}
      </button>

      {showControls && (
        <div id="model-controls-panel" className="space-y-6">
          {/* Model Name */}
          <div>
            <h2 className="text-2xl font-bold text-cyan-300 mb-2">Model: {modelName}</h2>
          </div>

          {/* Hyperparameters Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(params).map(([key, value]) => {
              const range = paramRanges[key];
              return (
                <div key={key} className="flex flex-col">
                  <label htmlFor={`param-${key}`} className="text-purple-300 font-semibold mb-1 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    id={`param-${key}`}
                    type="number"
                    step={range?.step || 'any'}
                    min={range?.min}
                    max={range?.max}
                    value={value}
                    onChange={e => handleParamChange(key, e.target.value)}
                    className="bg-gray-800 text-white rounded px-3 py-2 border border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  {range && (
                    <small className="text-gray-400">
                      Range: {range.min} - {range.max}
                    </small>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save / Export / Import Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={saveSettings}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg font-bold text-white transition-all"
              type="button"
            >
              Save Settings
            </button>

            <button
              onClick={exportSettings}
              className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
              type="button"
            >
              Export Settings
            </button>

            <label
              htmlFor="import-settings"
              className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-semibold cursor-pointer select-none"
              title="Import settings JSON"
            >
              Import Settings
              <input
                id="import-settings"
                type="file"
                accept="application/json"
                onChange={importSettings}
                className="hidden"
              />
            </label>
          </div>

          {/* Training Controls */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={startTraining}
                disabled={isTraining}
                className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
                  isTraining
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
                }`}
                type="button"
              >
                Start Training
              </button>
              <button
                onClick={stopTraining}
                disabled={!isTraining}
                className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
                  !isTraining
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                type="button"
              >
                Stop
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden border border-cyan-500">
              <div
                className="h-6 bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
                role="progressbar"
              />
            </div>

            {/* Logs */}
            <div className="bg-black