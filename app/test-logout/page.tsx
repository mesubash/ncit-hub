"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function LogoutTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      console.log("Attempting logout...");
      await signOut();
      console.log("Logout successful");
      setResult({ success: true, message: "Logged out successfully" });
      // Reload the page to clear any cached state
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      setResult({ success: false, error: error?.toString() });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Logout Test</h1>
      
      <Button 
        onClick={handleLogout} 
        disabled={loading}
        className="w-full mb-4"
        variant="destructive"
      >
        {loading ? "Logging out..." : "Force Logout"}
      </Button>

      <p className="text-sm text-gray-600 mb-4">
        This will log out the current user and reload the page.
      </p>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
