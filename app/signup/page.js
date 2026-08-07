"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    const cleanPhone = phone.replace(/\D/g, "");

if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
  setMessage("Please enter a valid 10-digit Indian mobile number.");
  setLoading(false);
  return;
}

    try {
      // Create Supabase Auth user
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: cleanPhone,
          },
        },
      });

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (error) {
  const errorText = (error.message || "").toLowerCase();

  if (
    errorText.includes("duplicate") ||
    errorText.includes("profiles_phone_unique") ||
    errorText.includes("database error saving new user")
  ) {
    throw new Error(
      "This mobile number is already registered. Please login with your existing account."
    );
  }

  throw error;
}

      setMessage(
        "Account created successfully. Please check your email for verification."
      );

      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
    } catch (error) {
  setMessage(
    error.message ||
    "Unable to create account. Please try again."
  );
} finally {
  setLoading(false);
}
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#05070a",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          border: "1px solid #252a32",
          borderRadius: "16px",
          padding: "30px",
          background: "#0b0e13",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Play2Prove
        </h1>

        <p
          style={{
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          Create your player account
        </p>

        <form onSubmit={handleSignup}>
          <label>Full Name</label>

          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            style={inputStyle}
          />

          <label>Email Address</label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={inputStyle}
          />

          <label>Mobile Number</label>

          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter mobile number"
            style={inputStyle}
          />

          <label>Password</label>

          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create password"
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "10px",
              padding: "14px",
              marginTop: "8px",
              background: loading ? "#555" : "#16a34a",
              color: "white",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              border: "1px solid #30363d",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#9ca3af",
            marginTop: "22px",
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            style={{
              color: "#22c55e",
              textDecoration: "none",
              fontWeight: "700",
            }}
          >
            Login
          </a>
        </p>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  marginTop: "8px",
  marginBottom: "18px",
  borderRadius: "9px",
  border: "1px solid #30363d",
  background: "#05070a",
  color: "white",
  fontSize: "15px",
  outline: "none",
};
