"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SessionPersistenceCheck() {
  const [status, setStatus] = useState<any>(null);
  const [email, setEmail] = useState("subash.221748@ncit.edu.np");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const checkSession = async () => {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    const allCookies = document.cookie.split('; ');
    const authCookie = allCookies.find(c => c.includes('auth-token'));
    
    setStatus({
      timestamp: new Date().toLocaleTimeString(),
      hasSession: !!session,
      sessionUser: session?.user?.email || null,
      cookies: allCookies.length,
      authCookie: authCookie ? '✓ Found' : '✗ Not found',
      error: error?.message || null
    });
    
    console.log("Session check result:", { session, error, cookies: allCookies });
  };

  const login = async () => {
    if (!password) {
      alert("Enter password!");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert("✓ Login successful! Now refresh the page to test session persistence.");
      await checkSession();
    }
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await checkSession();
  };

  useEffect(() => {
    checkSession();
    
    // Auto-check every 2 seconds
    const interval = setInterval(checkSession, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-2">Session Persistence Test</h1>
          <p className="text-gray-600 mb-6">
            Auto-refreshing every 2 seconds • Last check: {status?.timestamp || 'Not checked'}
          </p>

          {/* Session Status */}
          <div className={`p-4 rounded-lg mb-6 ${status?.hasSession ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
            <h2 className="text-2xl font-bold">
              {status?.hasSession ? '✓ SESSION ACTIVE' : '✗ NO SESSION'}
            </h2>
            {status?.sessionUser && (
              <p className="text-lg mt-2">Logged in as: <strong>{status.sessionUser}</strong></p>
            )}
          </div>

          {/* Details */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Details:</h3>
            <pre className="text-xs">{JSON.stringify(status, null, 2)}</pre>
          </div>

          {/* Login Form */}
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-lg">Login:</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Password"
              onKeyPress={(e) => e.key === 'Enter' && login()}
            />
            <div className="flex gap-4">
              <button
                onClick={login}
                className="flex-1 bg-blue-500 text-white p-3 rounded font-bold hover:bg-blue-600"
              >
                Login
              </button>
              <button
                onClick={logout}
                className="flex-1 bg-red-500 text-white p-3 rounded font-bold hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
            <h3 className="font-bold mb-2">📋 Test Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Enter your password and click <strong>Login</strong></li>
              <li>Wait for "SESSION ACTIVE" to appear above</li>
              <li>Press <strong>F5 or Cmd+R</strong> to refresh this page</li>
              <li>Check if "SESSION ACTIVE" is still shown after refresh</li>
              <li>Open this URL in a new tab: <code className="bg-white px-2 py-1 rounded">localhost:3000/debug-session</code></li>
              <li>Verify the session persists in the new tab</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-500 text-white p-3 rounded font-bold hover:bg-gray-600"
            >
              🔄 Refresh Page
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="flex-1 bg-purple-500 text-white p-3 rounded font-bold hover:bg-purple-600"
            >
              → Go to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
