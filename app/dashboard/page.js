"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);
      setLoading(false);
    }

    checkUser();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main style={styles.main}>
        <h2>Loading...</h2>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1>🎮 Play2Prove</h1>

        <h2>Login Successful ✅</h2>

        <p>Welcome to your player account.</p>

        <div style={styles.info}>
          <p>
            <strong>Name:</strong>{" "}
            {user?.user_metadata?.full_name || "Player"}
          </p>

          <p>
            <strong>Email:</strong> {user?.email}
          </p>

          <p>
            <strong>User ID:</strong> {user?.id}
          </p>
        </div>

        <button onClick={logout} style={styles.button}>
          Logout
        </button>
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    background: "#05070a",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "600px",
    padding: "30px",
    background: "#0b0e13",
    border: "1px solid #252a32",
    borderRadius: "16px",
  },

  info: {
    marginTop: "25px",
    padding: "20px",
    background: "#05070a",
    borderRadius: "10px",
    border: "1px solid #30363d",
    overflowWrap: "anywhere",
  },

  button: {
    marginTop: "20px",
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#dc2626",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
};
