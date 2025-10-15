"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function TestDBSpeed() {
  const [results, setResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    const supabase = createClient();
    const testResults: any[] = [];

    try {
      // Test 1: Simple auth check
      const authStart = performance.now();
      const { data: { user } } = await supabase.auth.getUser();
      const authEnd = performance.now();
      testResults.push({
        test: "Auth getUser()",
        time: `${(authEnd - authStart).toFixed(2)}ms`,
        success: !!user,
        data: user?.email,
      });

      if (!user) {
        setResults(testResults);
        setIsRunning(false);
        return;
      }

      // Test 2: Simple SELECT on profiles (no conditions)
      const simpleStart = performance.now();
      const { data: allProfiles, error: simpleError } = await supabase
        .from("profiles")
        .select("id, email")
        .limit(1);
      const simpleEnd = performance.now();
      testResults.push({
        test: "Simple SELECT (limit 1)",
        time: `${(simpleEnd - simpleStart).toFixed(2)}ms`,
        success: !simpleError,
        data: allProfiles?.[0]?.email,
        error: simpleError?.message,
      });

      // Test 3: SELECT with WHERE clause (by ID)
      const whereStart = performance.now();
      const { data: profile, error: whereError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      const whereEnd = performance.now();
      testResults.push({
        test: "SELECT with WHERE (by ID)",
        time: `${(whereEnd - whereStart).toFixed(2)}ms`,
        success: !whereError,
        data: profile?.email,
        error: whereError?.message,
      });

      // Test 4: Just count profiles
      const countStart = performance.now();
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      const countEnd = performance.now();
      testResults.push({
        test: "COUNT profiles",
        time: `${(countEnd - countStart).toFixed(2)}ms`,
        success: !countError,
        data: `${count} profiles`,
        error: countError?.message,
      });

      // Test 5: Network ping test
      const pingStart = performance.now();
      await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/", {
        method: "HEAD",
      });
      const pingEnd = performance.now();
      testResults.push({
        test: "Network Ping to Supabase",
        time: `${(pingEnd - pingStart).toFixed(2)}ms`,
        success: true,
        data: "Connected",
      });

    } catch (error: any) {
      testResults.push({
        test: "Error",
        time: "N/A",
        success: false,
        error: error.message,
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Database Speed Test</h1>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <p className="text-sm">
          This test measures the actual database query speed to identify bottlenecks.
        </p>
      </div>

      <button
        onClick={runTests}
        disabled={isRunning}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {isRunning ? "Running Tests..." : "Run Speed Tests"}
      </button>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.success
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{result.test}</h3>
                <span
                  className={`text-lg font-mono font-bold ${
                    parseFloat(result.time) > 1000 ? "text-red-600" : 
                    parseFloat(result.time) > 500 ? "text-yellow-600" : 
                    "text-green-600"
                  }`}
                >
                  {result.time}
                </span>
              </div>
              {result.data && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Data: {result.data}
                </p>
              )}
              {result.error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Error: {result.error}
                </p>
              )}
            </div>
          ))}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold mb-2">Performance Analysis:</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>&lt; 100ms: Excellent</li>
              <li>100-500ms: Good</li>
              <li>500-1000ms: Slow (may need optimization)</li>
              <li>&gt; 1000ms: Very slow (investigation needed)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
