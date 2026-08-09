// app/login/page.js

"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

async function handleLogin(e) {
  e.preventDefault();

  setMessage("");
  setMessageType("");
  setLoading(true);

  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    setMessage("Please enter your email and password.");
    setMessageType("error");
    setLoading(false);
    return;
  }

  try {
    const { data: emailExists, error: checkError } = await supabase.rpc(
      "check_email_registered",
      {
        check_email: cleanEmail,
      }
    );

    if (checkError) {
      console.error("Email check error:", checkError);

      setMessage(
        "We couldn’t verify your account right now. Please try again."
      );
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (!emailExists) {
      setMessage(
        "This email address isn’t registered. Please check your email or create a new account."
      );
      setMessageType("error");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      const errorText = error.message.toLowerCase();

      if (
        errorText.includes("email not confirmed") ||
        errorText.includes("email_not_confirmed")
      ) {
        setMessage(
          "Your email address hasn’t been verified yet. Please check your inbox and verify your email before signing in."
        );
      } else {
        setMessage(
          "Incorrect password. Please try again, or reset your password if you’ve forgotten it."
        );
      }

      setMessageType("error");
      setLoading(false);
      return;
    }

    if (data?.user) {
      window.location.href = "/dashboard";
      return;
    }

    setMessage(
      "We couldn’t complete your login. Please try again."
    );
    setMessageType("error");

  } catch (err) {
    console.error("Login error:", err);

    setMessage(
      "Something went wrong while signing in. Please try again."
    );
    setMessageType("error");
  }

  setLoading(false);
}
  async function handleForgotPassword(e) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage("Please enter your registered email address.");
      setMessageType("error");
      return;
    }

    setForgotLoading(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo,
        }
      );

      if (error) {
        console.error("Forgot password error:", error);

        setMessage(
          "Unable to send the reset link. Please try again."
        );
        setMessageType("error");
      } else {
        setMessage(
          "If an account exists with this email, a password reset link has been sent. Please check your inbox and spam folder."
        );
        setMessageType("success");
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    }

    setForgotLoading(false);
  }

  function switchToForgot() {
    setForgotMode(true);
    setMessage("");
    setMessageType("");
  }

  function switchToLogin() {
    setForgotMode(false);
    setMessage("");
    setMessageType("");
  }

  return (
    <main style={styles.main}>
    <button
  type="button"
  onClick={() => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "/";
  }
}}
  style={styles.backButton}
>
  ← Back
</button>
      <div style={styles.card}>
        <div style={styles.logo}>Play2Prove</div>

        {!forgotMode ? (
          <>
            <h1 style={styles.title}>Welcome Back</h1>

            <p style={styles.subtitle}>
              Login to your player account
            </p>

            <form onSubmit={handleLogin}>
              <label style={styles.label}>Email Address</label>

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={styles.input}
              />

              <label style={styles.label}>Password</label>

              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={styles.passwordInput}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  style={styles.showButton}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div style={styles.forgotRow}>
                <button
                  type="button"
                  onClick={switchToForgot}
                  style={styles.forgotButton}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  opacity: loading ? 0.65 : 1,
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {message && (
              <div
                style={{
                  ...styles.message,
                  ...(messageType === "error"
                    ? styles.errorMessage
                    : styles.successMessage),
                }}
              >
                {message}
              </div>
            )}

            <p style={styles.bottom}>
              Don't have an account?{" "}
              <Link href="/signup" style={styles.link}>
                Create Account
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Forgot Password?</h1>

            <p style={styles.subtitle}>
              Enter your registered email address and we'll send you a secure
              password reset link.
            </p>

            <form onSubmit={handleForgotPassword}>
              <label style={styles.label}>Registered Email</label>

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                style={styles.input}
              />

              <button
                type="submit"
                disabled={forgotLoading}
                style={{
                  ...styles.button,
                  opacity: forgotLoading ? 0.65 : 1,
                }}
              >
                {forgotLoading
                  ? "Sending Reset Link..."
                  : "Send Reset Link"}
              </button>
            </form>

            {message && (
              <div
                style={{
                  ...styles.message,
                  ...(messageType === "error"
                    ? styles.errorMessage
                    : styles.successMessage),
                }}
              >
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={switchToLogin}
              style={styles.backButton}
            >
              ← Back to Login
            </button>
          </>
        )}
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
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    background: "#0b0e13",
    border: "1px solid #252a32",
    borderRadius: "18px",
    padding: "30px",
    boxSizing: "border-box",
  },

  logo: {
    textAlign: "center",
    fontSize: "34px",
    fontWeight: "800",
    marginBottom: "12px",
  },

  title: {
    textAlign: "center",
    fontSize: "28px",
    margin: "0 0 8px",
  },

  subtitle: {
    textAlign: "center",
    color: "#9ca3af",
    marginBottom: "28px",
    lineHeight: "1.5",
  },

  label: {
    display: "block",
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    marginBottom: "18px",
    background: "#05070a",
    border: "1px solid #30363d",
    borderRadius: "9px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
  },

  passwordWrapper: {
    position: "relative",
    width: "100%",
  },

  passwordInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 70px 14px 14px",
    background: "#05070a",
    border: "1px solid #30363d",
    borderRadius: "9px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
  },

  showButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "#22c55e",
    fontWeight: "700",
    cursor: "pointer",
  },

  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  },

  forgotButton: {
    background: "transparent",
    border: "none",
    color: "#22c55e",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    padding: "4px 0",
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
    marginTop: "18px",
    padding: "13px",
    borderRadius: "9px",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  errorMessage: {
    background: "#3f0b0b",
    border: "1px solid #ef4444",
    color: "#fecaca",
  },

  successMessage: {
    background: "#052e16",
    border: "1px solid #22c55e",
    color: "#bbf7d0",
  },

  bottom: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: "24px",
  },

  link: {
    color: "#22c55e",
    textDecoration: "none",
    fontWeight: "700",
  },

  backButton: {
  position: "fixed",
  top: "20px",
  left: "20px",
  padding: "10px 16px",
  background: "#0b0e13",
  color: "#fff",
  border: "1px solid #30363d",
  borderRadius: "9px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
  zIndex: 100,
},
};
