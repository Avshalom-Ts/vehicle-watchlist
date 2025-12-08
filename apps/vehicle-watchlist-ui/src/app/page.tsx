'use client';

import { useEffect, useState } from 'react';

interface ApiResponse {
  message: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  database: string;
}

export default function Index() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

        // Fetch main endpoint
        const dataResponse = await fetch(`${apiUrl}`);
        const data = await dataResponse.json();
        setApiData(data);

        // Fetch health endpoint
        const healthResponse = await fetch(`${apiUrl}/health`);
        const health = await healthResponse.json();
        setHealthData(health);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to API');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🚗 Vehicle Watchlist Platform
          </h1>
          <p className="text-gray-600">Frontend ↔ Backend Integration Test</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Connection Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">🔌</span>
              API Connection
            </h2>
            {loading ? (
              <div className="flex items-center text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
                Connecting...
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-700 font-semibold">❌ Connection Failed</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-700 font-semibold">✅ Connected Successfully</p>
                {apiData && (
                  <p className="text-gray-700 mt-2">
                    Response: <span className="font-mono text-sm">{apiData.message}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Health Check */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">💚</span>
              Health Check
            </h2>
            {loading ? (
              <div className="flex items-center text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
                Checking...
              </div>
            ) : healthData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {healthData.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Database:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {healthData.database}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Last check: {new Date(healthData.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No health data available</p>
            )}
          </div>
        </div>

        {/* Integration Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4">📊 Integration Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Frontend:</p>
              <p className="font-mono bg-gray-100 p-2 rounded">Next.js @ localhost:4200</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Backend:</p>
              <p className="font-mono bg-gray-100 p-2 rounded">NestJS @ localhost:3000</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Database:</p>
              <p className="font-mono bg-gray-100 p-2 rounded">MongoDB @ localhost:27017</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Admin UI:</p>
              <p className="font-mono bg-gray-100 p-2 rounded">Mongo Express @ localhost:8081</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mt-6 text-white">
          <h2 className="text-2xl font-semibold mb-3">🎯 Next Steps</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="mr-2">✨</span>
              <span>Create vehicle search functionality</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✨</span>
              <span>Build watchlist management features</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✨</span>
              <span>Add authentication (JWT + OAuth)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✨</span>
              <span>Implement analytics dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

