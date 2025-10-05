import React, { useState } from "react";
import { telescopeFields } from "./telescopeFields";

const featureInfo = {
  koi_score: {
    name: "Photometric Stability Index",
    importance:
      "Measures how stable and consistent the star’s light curve is during a transit; higher values suggest a true planetary event.",
    column: "koi_score",
  },
  koi_fpflag_nt: {
    name: "Not Transit Flag",
    importance:
      "Indicates whether the observed event is NOT caused by a planet transit. If set to 1, the candidate is likely a false positive.",
    column: "koi_fpflag_nt",
  },
  koi_model_snr: {
    name: "Transit Signal-to-Noise Ratio (SNR)",
    importance:
      "Measures how strong the transit signal is compared to noise. Higher values mean more confident detections.",
    column: "koi_model_snr",
  },
  koi_fpflag_co: {
    name: "Centroid Offset Flag",
    importance:
      "Flag showing if the light centroid during the transit shifts from the target position, suggesting a background source.",
    column: "koi_fpflag_co",
  },
  koi_fpflag_ss: {
    name: "Secondary Star Flag",
    importance:
      "Marks detections where a secondary star might affect the light curve, indicating potential binary systems.",
    column: "koi_fpflag_ss",
  },
  koi_fpflag_ec: {
    name: "Eclipsing Binary Flag",
    importance:
      "Indicates whether the system could be an eclipsing binary star mimicking a planet transit.",
    column: "koi_fpflag_ec",
  },
  koi_duration_err2: {
    name: "Transit Duration Error",
    importance:
      "Uncertainty in the measured duration of the transit (in hours). Helps estimate data precision.",
    column: "koi_duration_err2",
  },
  koi_prad: {
    name: "Planetary Radius (Earth Radii)",
    importance:
      "Estimated radius of the planet compared to Earth’s radius. A core property for classifying planet types.",
    column: "koi_prad",
  },
  koi_depth_err2: {
    name: "Transit Depth Error",
    importance:
      "Measurement uncertainty in the depth of the light curve during transit. Larger values may indicate noise or poor fit.",
    column: "koi_depth_err2",
  },
  koi_tce_plnt_num: {
    name: "Planet Sequence Number",
    importance:
      "Indicates the planet’s position in its system (1 = first, 2 = second, etc.).",
    column: "koi_tce_plnt_num",
  },
};

const ManualInput = ({ formData, onChange, selectedTelescope }) => {
  const [hoveredField, setHoveredField] = useState(null);
  const fields = telescopeFields[selectedTelescope] || [];
  const half = Math.ceil(fields.length / 2);
  const leftColumn = fields.slice(0, half);
  const rightColumn = fields.slice(half);

  const renderField = (field) => {
    // Find matching key regardless of case or underscores
    const key =
      Object.keys(featureInfo).find(
        (k) => k.toLowerCase() === field.id.toLowerCase()
      ) || field.id;

    const info = featureInfo[key] || {};

    return (
      <div key={field.id} className="flex flex-col relative">
        <label className="text-sm text-gray-300 mb-1 flex items-center gap-1">
          {field.label}
          <span
            onMouseEnter={() => setHoveredField(field.id)}
            onMouseLeave={() => setHoveredField(null)}
            className="text-cyan-400 cursor-pointer text-xs border border-cyan-500/40 rounded-full px-1 hover:bg-cyan-500/20"
          >
            ?
          </span>
        </label>

        {/* Tooltip */}
        {hoveredField === field.id && (
          <div className="absolute z-10 top-6 left-0 w-72 bg-gray-900 text-gray-200 text-xs p-3 rounded-md border border-gray-700 shadow-lg">
            <p className="font-semibold text-cyan-300 mb-1">
              🪐 {info.name || field.label}
            </p>
            <p className="mb-2">
              {info.importance ||
                "No description available for this feature."}
            </p>
            <p className="text-cyan-400 font-mono text-[11px]">
              📊 Dataset Column:{" "}
              <span className="text-white">{info.column || "N/A"}</span>
            </p>
          </div>
        )}

        <input
          type="number"
          step="any"
          value={formData[field.id] || ""}
          onChange={(e) =>
            onChange(field.id, parseFloat(e.target.value) || 0)
          }
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder={`Enter ${field.label}`}
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-4">
        {leftColumn.map((f) => renderField(f))}
      </div>
      <div className="flex flex-col gap-4">
        {rightColumn.map((f) => renderField(f))}
      </div>
    </div>
  );
};

export default ManualInput;
