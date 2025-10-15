"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestStorage() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    const checkStorage = async () => {
      // Check cookies
      const cookies = document.cookie;
      console.log("All cookies:", cookies);
      
      // Check localStorage
      const localStorage = window.localStorage;
      const storageKeys = Object.keys(localStorage);
      console.log("LocalStorage keys:", storageKeys);
      
      // Check specific storage
      const ncitAuthCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('ncithub-auth='));
      
      const localStorageAuth = localStorage.getItem('ncithub-auth');
      
      // Test Supabase client
      const supabase = createClient();
      const { data: session, error } = await supabase.auth.getSession();
      
      const sessionInfo = {
        cookies: cookies,
        ncitAuthCookie: ncitAuthCookie || "Not found",
        localStorageAuth: localStorageAuth || "Not found",
        storageKeys: storageKeys,
        supabaseSession: session,
        supabaseError: error,
        hasSessionUser: !!session?.user,
        sessionUserId: session?.user?.id,
        sessionUserEmail: session?.user?.email,
      };
      
      console.log("Storage info:", sessionInfo);
      setInfo(sessionInfo);
    };
    
    checkStorage();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Storage & Session Test</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(info, null, 2)}
        </pre>
      </div>
    </div>
  );
}
