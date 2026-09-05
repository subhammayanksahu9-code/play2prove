"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TestDatabase() {
  const [status, setStatus] = useState("Testing...");
  const [user, setUser] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function testConnection() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        setUser(sessionData?.session?.user || null);

        const response = await fetch("/api/tournaments", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok || data?.success === false) {
          throw new Error(data?.error || `API ${response.status}`);
        }

        setApiData(data);
        setStatus("Connected");
      } catch (err) {
        console.error(err);
        setError(err?.message || "Connection test failed");
        setStatus("Failed");
      }
    }

    testConnection();
  }, []);

  return (
    <main style={{ minHeight:"100vh", background:"#05070b", color:"white", padding:"40px", fontFamily:"Arial" }}>
      <h1>Play2Prove System Test</h1>
      <h2 style={{ color: status === "Connected" ? "#22c55e" : status === "Failed" ? "#ef4444" : "#f59e0b" }}>
        {status === "Connected" ? "✅ System Connected" : status === "Failed" ? "❌ Test Failed" : "⏳ Testing..."}
      </h2>
      {error && <p style={{ color:"#fca5a5" }}>{error}</p>}
      <p>Auth user: {user?.email || "Not signed in"}</p>
      <p>Google Sheet games: {apiData?.games?.length ?? "—"}</p>
      <p>Google Sheet tournaments: {apiData?.tournaments?.length ?? "—"}</p>
      {apiData && (
        <pre style={{ marginTop:20, padding:20, background:"#0b0f14", border:"1px solid #252b34", borderRadius:10, overflow:"auto" }}>
          {JSON.stringify({ source: apiData.source, games: apiData.games?.length, tournaments: apiData.tournaments?.length }, null, 2)}
        </pre>
      )}
    </main>
  );
}
