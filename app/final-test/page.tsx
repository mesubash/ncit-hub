"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FinalTest() {
  const [status, setStatus] = useState<string>("Checking...");
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const test = async () => {
      try {
        const supabase = createClient();
        
        // Check session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        setDetails({
          hasSession: !!session,
          user: session?.user?.email || null,
          error: error?.message || null,
          localStorage: typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.includes('supabase')) : [],
          cookies: typeof document !== 'undefined' ? document.cookie : 'N/A'
        });
        
        if (session) {
          setStatus("✅ SESSION WORKING - You are logged in!");
        } else {
          setStatus("⚠️ No session found - Please log in");
        }
      } catch (err: any) {
        setStatus(`❌ Error: ${err.message}`);
      }
    };
    
    test();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Session Test - Simplified Client</h1>
        
        <div className={`p-6 rounded-lg mb-6 ${status.includes('✅') ? 'bg-green-100' : status.includes('❌') ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <p className="text-2xl font-bold">{status}</p>
        </div>

        {details && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Details:</h2>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 space-x-4">
          <a href="/login" className="inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go to Login
          </a>
          <button 
            onClick={() => window.location.reload()} 
            className="inline-block px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh Page
          </button>
          <a href="/profile" className="inline-block px-6 py-3 bg-purple-500 text-white rounded hover:bg-purple-600">
            Go to Profile
          </a>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-bold mb-2">📋 Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>IMPORTANT:</strong> Open your browser DevTools (F12) → Application/Storage → Clear all cookies and localStorage for localhost</li>
            <li>Click "Go to Login" and log in with your credentials</li>
            <li>After successful login, you should be redirected</li>
            <li>Come back to this page: <code className="bg-gray-200 px-2 py-1 rounded">localhost:3000/final-test</code></li>
            <li>You should see "✅ SESSION WORKING"</li>
            <li>Refresh the page (F5) - session should persist</li>
            <li>Open in a new tab - session should persist</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
