"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function TestRegisterPage() {
  const [email, setEmail] = useState("test" + Math.floor(Math.random() * 10000) + "@ncit.edu.np")
  const [password, setPassword] = useState("password123")
  const [name, setName] = useState("Test User")
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testRegistration = async () => {
    setIsLoading(true)
    setLogs([])
    
    try {
      const supabase = createClient()
      
      addLog("=== Starting Registration Test ===")
      addLog(`Email: ${email}`)
      addLog(`Password: ${password}`)
      addLog(`Name: ${name}`)
      
      // Step 1: Sign up
      addLog("Step 1: Calling supabase.auth.signUp...")
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            department: "Computer Engineering",
            semester: 5,
          },
        },
      })

      if (authError) {
        addLog(`❌ Auth Error: ${authError.message}`)
        return
      }

      addLog(`✅ Auth Success!`)
      addLog(`User ID: ${authData.user?.id}`)
      addLog(`Has Session: ${!!authData.session}`)
      
      if (!authData.user) {
        addLog("❌ No user returned")
        return
      }

      // Step 2: Check if profile exists
      addLog("\nStep 2: Checking if profile exists...")
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (checkError) {
        addLog(`Profile check error: ${checkError.message} (Code: ${checkError.code})`)
      }

      if (existingProfile) {
        addLog("✅ Profile already exists!")
        addLog(`Profile: ${JSON.stringify(existingProfile, null, 2)}`)
        return
      }

      addLog("Profile doesn't exist yet, creating...")

      // Step 3: Create profile
      addLog("\nStep 3: Creating profile...")
      const { data: newProfile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          email: email,
          full_name: name,
          department: "Computer Engineering",
          semester: 5,
          role: "student",
        })
        .select()
        .single()

      if (profileError) {
        addLog(`❌ Profile Creation Error: ${profileError.message}`)
        addLog(`Error Code: ${profileError.code}`)
        addLog(`Error Details: ${JSON.stringify(profileError, null, 2)}`)
        
        // Try to fetch profile again
        addLog("\nRetrying profile fetch...")
        const { data: retryProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single()
        
        if (retryProfile) {
          addLog("✅ Profile found on retry!")
          addLog(`Profile: ${JSON.stringify(retryProfile, null, 2)}`)
        } else {
          addLog("❌ Profile still not found")
        }
        
        return
      }

      addLog("✅ Profile Created Successfully!")
      addLog(`Profile: ${JSON.stringify(newProfile, null, 2)}`)
      
    } catch (err: any) {
      addLog(`❌ Unexpected Error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Registration Debug Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@ncit.edu.np"
              />
            </div>
            
            <div>
              <Label>Password</Label>
              <Input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </div>
            
            <div>
              <Label>Name</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={testRegistration}
              disabled={isLoading}
            >
              {isLoading ? "Testing..." : "Test Registration"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Click "Test Registration" to start.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
