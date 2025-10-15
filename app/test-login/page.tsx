"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginTest() {
  const [email, setEmail] = useState("test@ncit.edu.np");
  const [password, setPassword] = useState("password123");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log("Attempting login with:", { email, password });
      const result = await signIn(email, password);
      console.log("Login result:", result);
      setResult(result);
    } catch (error) {
      console.error("Login error:", error);
      setResult({ error: error?.toString() });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Login Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
        
        <Button 
          onClick={handleLogin} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Logging in..." : "Test Login"}
        </Button>
      </div>

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
