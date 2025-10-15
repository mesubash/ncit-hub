"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SessionPersistenceTest() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [email, setEmail] = useState("subash.221748@ncit.edu.np");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const checkSession = async () => {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log("Session check:", { 
      hasSession: !!session, 
      user: session?.user?.email,
      error 
    });
    
    setSessionInfo({
      hasSession: !!session,
      userId: session?.user?.id || null,
      email: session?.user?.email || null,
      expiresAt: session?.expires_at || null,
      error: error?.message || null,
      timestamp: new Date().toISOString(),
      refreshCount: refreshCount
    });
  };

  const login = async () => {
    if (!password) {
      alert("Please enter password");
      return;
    }
    
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Login result:", { data, error });
      
      if (error) {
        alert(`Login error: ${error.message}`);
      } else {
        alert("Login successful! Now try refreshing the page to test session persistence.");
        await checkSession();
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed");
    }
    setLoading(false);
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await checkSession();
    alert("Logged out successfully");
  };

  useEffect(() => {
    // Increment refresh count from sessionStorage
    const count = parseInt(sessionStorage.getItem('refreshCount') || '0') + 1;
    setRefreshCount(count);
    sessionStorage.setItem('refreshCount', count.toString());
    
    checkSession();
  }, []);

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">Session Persistence Test</h1>
      <p className="text-gray-600 mb-6">Page refreshed {refreshCount} time(s)</p>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Login Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            
            <div className="flex gap-4">
              <Button onClick={login} disabled={loading} className="flex-1">
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Button onClick={logout} variant="outline" className="flex-1">
                Logout
              </Button>
              <Button onClick={checkSession} variant="secondary" className="flex-1">
                Check Session
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionInfo ? (
              <div className="space-y-2">
                <div className={`p-4 rounded-lg ${sessionInfo.hasSession ? 'bg-green-100' : 'bg-red-100'}`}>
                  <p className={`text-lg font-bold ${sessionInfo.hasSession ? 'text-green-800' : 'text-red-800'}`}>
                    {sessionInfo.hasSession ? '✓ Session Active' : '✗ No Active Session'}
                  </p>
                </div>
                <pre className="text-sm bg-gray-100 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-500">Click "Check Session" to see status</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Enter your password and click <strong>Login</strong></li>
              <li>Verify that "Session Active" appears above ✓</li>
              <li><strong>Refresh this page</strong> (F5 or Cmd+R)</li>
              <li>Check if "Session Active" is still shown after refresh</li>
              <li>Open this URL in a <strong>new tab</strong>: <code className="bg-gray-200 px-2 py-1 rounded">localhost:3000/session-test</code></li>
              <li>Verify session persists across tabs</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Expected behavior:</strong> After login, the session should persist across page refreshes and new tabs until you click Logout or the session expires.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
