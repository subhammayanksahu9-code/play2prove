"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      window.location.href = "/dashboard";
    }

    setLoading(false);
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Play2Prove</h1>
        <p style={styles.subtitle}>Login to your player account</p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={styles.input}
          />

          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <div style={styles.message}>{message}</div>}

        <p style={styles.bottom}>
          Don't have an account?{" "}
          <a href="/signup" style={styles.link}>
            Create Account
          </a>
        </p>
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
    maxWidth: "430px",
    background: "#0b0e13",
    border: "1px solid #252a32",
    borderRadius: "16px",
    padding: "30px",
  },

  title: {
    textAlign: "center",
    fontSize: "34px",
    marginBottom: "8px",
  },

  subtitle: {
    textAlign: "center",
    color: "#9ca3af",
    marginBottom: "28px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    marginTop: "8px",
    marginBottom: "20px",
    background: "#05070a",
    border: "1px solid #30363d",
    borderRadius: "9px",
    color: "#fff",
    fontSize: "15px",
  },

  button: {
    width: "100%",
    padding: "14px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },

  message: {
    marginTop: "20px",
    padding: "12px",
    border: "1px solid #30363d",
    borderRadius: "8px",
  },

  bottom: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: "22px",
  },

  link: {
    color: "#22c55e",
    textDecoration: "none",
    fontWeight: "700",
  },
};
