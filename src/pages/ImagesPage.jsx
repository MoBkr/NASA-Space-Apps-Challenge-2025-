import React, { useEffect, useState } from "react";

const ImagesPage = ({ navigateTo }) => {
  const images = ["/img1.jpg", "/img2.jpg", "/img3.jpg"];
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    let mounted = true;
    const checks = async () => {
      const results = {};
      for (const url of images) {
        try {
          const res = await fetch(url, { method: "HEAD" });
          results[url] = res.ok ? `OK (${res.status})` : `Error (${res.status})`;
        } catch (err) {
          results[url] = `Fetch error`;
        }
      }
      if (mounted) setStatuses(results);
    };
    checks();
    return () => (mounted = false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4 text-cyan-300">Three Awesome Images</h1>
      <p className="text-gray-400 mb-6">If an image fails to load the diagnostic below will show its HTTP status.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {images.map((src, i) => (
          <div key={src} className="flex flex-col">
            <img src={src} alt={`Space ${i + 1}`} className="rounded-lg shadow-lg w-full h-64 object-cover bg-gray-800" />
            <span className="mt-2 text-sm text-gray-300">{`Image ${i + 1} — ${statuses[src] || 'Checking...'}`}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigateTo("explore")}
        className="mt-8 px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white"
      >
        ← Back to Explorer
      </button>
    </div>
  );
};

export default ImagesPage;
