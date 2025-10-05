import React, { useState, useRef } from "react";

const FileUpload = ({ onFileSelect, selectedTelescope }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      onFileSelect(uploaded);
    }
  };

  const handleReset = () => {
    setFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // clear input
    }
  };

  return (
    <div>
      {!file ? (
        // --- Before upload ---
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-400 rounded-lg p-6 h-48 cursor-pointer hover:bg-gray-800">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".csv,.fits"
          />
          <div className="text-4xl mb-2">📁</div>
          <p className="text-cyan-300 font-medium">
            Upload {selectedTelescope?.toUpperCase()} Data (CSV/FITS)
         </p>

          <p className="text-gray-400 text-sm">or click to browse files</p>
        </label>
      ) : (
        // --- After upload ---
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-400 rounded-lg p-6 h-48">
          <svg
            className="w-10 h-10 text-green-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p className="text-green-300 font-medium">
            File uploaded successfully ✅
          </p>
          <p className="text-gray-300 text-sm mt-1 truncate w-48 text-center">
            {file.name}
          </p>

          <button
            onClick={handleReset}
            className="mt-3 px-4 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
