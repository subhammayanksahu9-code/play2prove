"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TestDatabase() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("id");

      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        setGames(data || []);
      }

      setLoading(false);
    }

    testConnection();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: "40px", color: "white" }}>
        Testing Supabase connection...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#05070b",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>Play2Prove Database Test</h1>

      {error ? (
        <>
          <h2 style={{ color: "red" }}>❌ Connection Error</h2>
          <p>{error}</p>
        </>
      ) : (
        <>
          <h2 style={{ color: "#00ff88" }}>
            ✅ Supabase Connected
          </h2>

          <p>Games found: {games.length}</p>

          {games.map((game) => (
            <div
              key={game.id}
              style={{
                border: "1px solid #333",
                padding: "20px",
                marginTop: "15px",
                borderRadius: "10px",
              }}
            >
              <h3>{game.name}</h3>
              <p>Slug: {game.slug}</p>
              <p>Short Name: {game.short_name}</p>
            </div>
          ))}
        </>
      )}
    </main>
  );
}
