"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DebugSession() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      
      // Get all cookies
      const allCookies = document.cookie.split('; ');
      
      // Get session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      setInfo({
        timestamp: new Date().toISOString(),
        allCookies: allCookies,
        hasSession: !!session,
        session: session ? {
          userId: session.user.id,
          email: session.user.email,
          expiresAt: session.expires_at
        } : null,
        error: error?.message || null
      });
      
      console.log("Session check:", {
        hasSession: !!session,
        session,
        error
      });
    };
    
    checkSession();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Session Debug</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg">
        {info ? (
          <>
            <div className={`p-4 mb-4 rounded ${info.hasSession ? 'bg-green-200' : 'bg-red-200'}`}>
              <h2 className="text-xl font-bold">
                {info.hasSession ? '✓ Session Found' : '✗ No Session'}
              </h2>
            </div>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(info, null, 2)}
            </pre>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      
      <div className="mt-6">
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Refresh Page
        </button>
        <a 
          href="/login" 
          className="ml-4 px-4 py-2 bg-gray-500 text-white rounded inline-block"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
