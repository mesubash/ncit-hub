"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestAuth() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [cookieInfo, setCookieInfo] = useState<string>("");

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      
      // Check cookies
      const cookies = document.cookie;
      console.log("All cookies:", cookies);
      setCookieInfo(cookies);
      
      // Check session
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Session check:", { session, error });
      setSessionInfo({ session, error });
    }
    
    checkAuth();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Cookies:</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm">{cookieInfo || "No cookies"}</pre>
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Session Info:</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm">
          {JSON.stringify(sessionInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
}
