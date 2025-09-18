"use client";

import { useEffect, useState } from "react";

export default function TestGeoPage() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await fetch("/api/debug-geo");
        const data = await response.json();
        setGeoData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching geo data:", error);
        setLoading(false);
      }
    };

    fetchGeoData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading geo data...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Geolocation Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Geolocation Data</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(geoData?.geolocation, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Raw Headers</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(geoData?.rawHeaders, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Environment</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(geoData?.environment, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
