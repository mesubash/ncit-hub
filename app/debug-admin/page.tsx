"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";

export default function DebugAdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [cacheData, setCacheData] = useState<any>(null);
  const [allStorage, setAllStorage] = useState<any>({});

  useEffect(() => {
    // Get all localStorage data
    const storage: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          storage[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          storage[key] = localStorage.getItem(key);
        }
      }
    }
    setAllStorage(storage);

    // Get specific cache
    if (user?.id) {
      const cached = localStorage.getItem(`user_profile_${user.id}`);
      if (cached) {
        setCacheData(JSON.parse(cached));
      }
    }
  }, [user]);

  const clearCache = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('user_profile_')) {
        localStorage.removeItem(key);
      }
    });
    alert("Cache cleared! Please refresh the page.");
  };

  const clearAllStorage = () => {
    localStorage.clear();
    alert("All localStorage cleared! Please login again.");
    window.location.href = '/login';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">🔍 Admin Access Debug</h1>

      <div className="grid gap-4">
        {/* Auth State */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🔐 Auth State</h2>
          <div className="space-y-2 font-mono text-sm">
            <div><strong>isLoading:</strong> {String(isLoading)}</div>
            <div><strong>isAuthenticated:</strong> {String(isAuthenticated)}</div>
            <div className="flex items-center gap-2">
              <strong>user.role:</strong> 
              <span className={`px-2 py-1 rounded ${
                user?.role === 'admin' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {user?.role || 'undefined'}
              </span>
            </div>
            <div><strong>user.email:</strong> {user?.email || 'undefined'}</div>
            <div><strong>user.name:</strong> {user?.name || 'undefined'}</div>
            <div><strong>user.id:</strong> {user?.id || 'undefined'}</div>
          </div>
        </div>

        {/* Cache Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">💾 Cached User Data</h2>
          {cacheData ? (
            <div className="space-y-2">
              <div className="font-mono text-sm">
                <strong>Cached Role:</strong>{' '}
                <span className={`px-2 py-1 rounded ${
                  cacheData.user?.role === 'admin' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {cacheData.user?.role}
                </span>
              </div>
              <div className="font-mono text-sm">
                <strong>Cached At:</strong> {new Date(cacheData.cachedAt).toLocaleString()}
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold">Full Cache Data</summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-auto text-xs">
                  {JSON.stringify(cacheData, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p className="text-gray-600">No cache found for current user</p>
          )}
        </div>

        {/* All LocalStorage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📦 All LocalStorage</h2>
          <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-auto text-xs max-h-96">
            {JSON.stringify(allStorage, null, 2)}
          </pre>
        </div>

        {/* Admin Guard Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🚦 Admin Guard Check</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {!isLoading ? '✅' : '⏳'} <strong>Not Loading:</strong> {String(!isLoading)}
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated ? '✅' : '❌'} <strong>Is Authenticated:</strong> {String(isAuthenticated)}
            </div>
            <div className="flex items-center gap-2">
              {user?.role === 'admin' ? '✅' : '❌'} <strong>Is Admin:</strong> {String(user?.role === 'admin')}
            </div>
            <div className="mt-4 p-4 rounded border-2 border-dashed">
              <strong>Result:</strong>{' '}
              {!isLoading && isAuthenticated && user?.role === 'admin' ? (
                <span className="text-green-600 font-bold">✅ Should have admin access</span>
              ) : (
                <span className="text-red-600 font-bold">❌ Will be blocked</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Actions</h2>
          <div className="space-x-2">
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Clear User Cache
            </button>
            <button
              onClick={clearAllStorage}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear All Storage & Re-login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
            <a
              href="/admin"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Try Admin Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
