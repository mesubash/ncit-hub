"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";

export default function TestCachePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    setRenderTime(Date.now());
  }, []);

  useEffect(() => {
    if (user) {
      // Check localStorage for cached data
      try {
        const cached = localStorage.getItem(`user_profile_${user.id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          const cacheAge = Date.now() - parsed.cachedAt;
          setCacheInfo({
            exists: true,
            age: cacheAge,
            ageMinutes: (cacheAge / 1000 / 60).toFixed(2),
            cachedUser: parsed.user,
          });
        } else {
          setCacheInfo({ exists: false });
        }
      } catch (error) {
        setCacheInfo({ exists: false, error: String(error) });
      }
    }
  }, [user]);

  const clearCache = () => {
    if (user) {
      localStorage.removeItem(`user_profile_${user.id}`);
      setCacheInfo({ exists: false });
      alert("Cache cleared! Refresh the page to see it reload.");
    }
  };

  const timeToRender = user ? Date.now() - renderTime : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Cache Test - Not Authenticated</h1>
        <p>Please <a href="/login" className="text-blue-600 hover:underline">login</a> first.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">LocalStorage Cache Test</h1>

      <div className="grid gap-4 mb-6">
        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">⚡ Performance Metrics</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Time to Render User:</span>
              <span className={`font-mono text-lg font-bold ${
                timeToRender < 50 ? "text-green-600" : 
                timeToRender < 200 ? "text-yellow-600" : 
                "text-red-600"
              }`}>
                {timeToRender}ms
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {timeToRender < 50 ? "🚀 Excellent! Using cache." : 
               timeToRender < 200 ? "⚡ Good! May be using fallback." : 
               "🐌 Slow! Cache miss or DB query."}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">👤 Current User</h2>
          <div className="space-y-2">
            <div><span className="font-medium">Name:</span> {user?.name || "Not set"}</div>
            <div><span className="font-medium">Email:</span> {user?.email}</div>
            <div><span className="font-medium">Role:</span> {user?.role}</div>
            <div><span className="font-medium">Department:</span> {user?.department || "Not set"}</div>
          </div>
        </div>

        {/* Cache Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">💾 Cache Status</h2>
          {cacheInfo ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Cache Exists:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  cacheInfo.exists 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}>
                  {cacheInfo.exists ? "✓ Yes" : "✗ No"}
                </span>
              </div>
              
              {cacheInfo.exists && (
                <>
                  <div>
                    <span className="font-medium">Cache Age:</span> {cacheInfo.ageMinutes} minutes
                  </div>
                  <div>
                    <span className="font-medium">Cached Name:</span> {cacheInfo.cachedUser?.name || "Not set"}
                  </div>
                </>
              )}

              {cacheInfo.error && (
                <div className="text-red-600 text-sm">Error: {cacheInfo.error}</div>
              )}
            </div>
          ) : (
            <div>Loading cache info...</div>
          )}
          
          <button
            onClick={clearCache}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Cache
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2">🧪 Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            <strong>First Load:</strong> Cache may not exist yet. Time should be 100-2000ms.
          </li>
          <li>
            <strong>Refresh Page:</strong> Cache should exist now. Time should be &lt;50ms.
          </li>
          <li>
            <strong>Clear Cache:</strong> Click "Clear Cache" button, then refresh. Watch time increase.
          </li>
          <li>
            <strong>Multiple Refreshes:</strong> Each refresh should be instant (&lt;50ms) with cache.
          </li>
        </ol>
      </div>

      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
        <button 
          onClick={() => window.open(window.location.href, '_blank')} 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Open in New Tab
        </button>
      </div>
    </div>
  );
}
