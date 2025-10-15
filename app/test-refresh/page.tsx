"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect } from "react";

export default function TestRefreshPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("TestRefresh: Component mounted");
    console.log("TestRefresh: Auth state:", {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      userEmail: user?.email,
      userName: user?.name,
      userRole: user?.role,
    });
  }, [user, isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Session Persistence Test</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              isAuthenticated 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}>
              {isAuthenticated ? "✓ Authenticated" : "✗ Not Authenticated"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium">Loading:</span>
            <span>{isLoading ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>

      {isAuthenticated && user ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <div><span className="font-medium">Email:</span> {user.email}</div>
            <div><span className="font-medium">Name:</span> {user.name || "Not set"}</div>
            <div><span className="font-medium">Role:</span> {user.role}</div>
            <div><span className="font-medium">Department:</span> {user.department || "Not set"}</div>
            {user.semester && <div><span className="font-medium">Semester:</span> {user.semester}</div>}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">
            No user logged in. Please <a href="/login" className="text-blue-600 hover:underline">login</a> first.
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Login using the login page</li>
          <li>Return to this page and verify your user info appears</li>
          <li>Refresh the page (F5 or Cmd+R)</li>
          <li>Verify the session persists and user info still appears</li>
          <li>Open this page in a new tab</li>
          <li>Verify the session persists in the new tab</li>
        </ol>
      </div>

      <div className="mt-4">
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
