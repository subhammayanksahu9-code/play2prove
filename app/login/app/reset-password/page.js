// app/reset-password/page.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    let mounted = true;

    async function checkResetSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data?.session) {
        setMessage(
          "This password reset link is invalid or has expired. Please request a new reset link."
        );
        setMessageType("error");
      }

      setCheckingSession(false);
    }

    checkResetSession();

    return () => {
      mounted = false;
    };
  }, []);

  function handlePasswordChange(value) {
    setPassword(value);

    setChecks({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    });
  }

  const passwordValid = Object.values(checks).every(Boolean);

  async function handleResetPassword(e) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!passwordValid) {
      setMessage("Please complete all password requirements.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("Update password error:", error);

        setMessage(error.message);
        setMessageType("error");
        setLoading(false);
        return;
      }

      setMessage(
        "Password changed successfully. Redirecting to login..."
      );
      setMessageType("success");

      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);

      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    }

    setLoading(false);
  }

  if (checkingSession) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.logo}>Play2Prove</div>
          <h1 style={styles.title}>Checking Reset Link...</h1>
          <p style={styles.subtitle}>Please wait.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <div style={styles.logo}>Play2Prove</div>

        <h1 style={styles.title}>Reset Password</h1>

        <p style={styles.subtitle}>
          Create a new secure password for your account.
        </p>

        {messageType === "error" &&
        message.includes("invalid or has expired") ? (
          <>
            <div style={styles.errorMessage}>
              {message}
            </div>

            <button
              type="button"
              onClick={() => router.replace("/login")}
              style={styles.button}
            >
              Back to Login
            </button>
          </>
        ) : (
          <form onSubmit={handleResetPassword}>
            <label style={styles.label}>New Password</label>

            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  handlePasswordChange(e.target.value)
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                required
                style={styles.passwordInput}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                style={styles.showButton}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div style={styles.requirements}>
              <Requirement
                valid={checks.length}
                text="8 or more characters"
              />

              <Requirement
                valid={checks.uppercase}
                text="One uppercase letter (A-Z)"
              />

              <Requirement
                valid={checks.lowercase}
                text="One lowercase letter (a-z)"
              />

              <Requirement
                valid={checks.number}
                text="One number (0-9)"
              />

              <Requirement
                valid={checks.special}
                text="One special character"
              />
            </div>

            <label style={styles.label}>Confirm Password</label>

            <div style={styles.passwordWrapper}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
                style={styles.passwordInput}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm((value) => !value)
                }
                style={styles.showButton}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>

            {confirmPassword && (
              <div
                style={{
                  ...styles.matchMessage,
                  color:
                    password === confirmPassword
                      ? "#22c55e"
                      : "#ef4444",
                }}
              >
                {password === confirmPassword
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </div>
            )}

            {message && (
              <div
                style={
                  messageType === "error"
                    ? styles.errorMessage
                    : styles.successMessage
                }
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passwordValid}
              style={{
                ...styles.button,
                opacity:
                  loading || !passwordValid ? 0.6 : 1,
              }}
            >
              {loading
                ? "Updating Password..."
                : "Update Password"}
            </button>
          </form>
        )}

        <p style={styles.bottom}>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            style={styles.backLink}
          >
            ← Back to Login
          </button>
        </p>
      </div>
    </main>
  );
}

function Requirement({ valid, text }) {
  return (
    <div
      style={{
        ...styles.requirement,
        color: valid ? "#22c55e" : "#9ca3af",
      }}
    >
      <span style={styles.check}>
        {valid ? "✓" : "○"}
      </span>

      {text}
    </div>
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
    fontSize: "27px",
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
    marginTop: "18px",
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

  requirements: {
    marginTop: "14px",
    padding: "14px",
    background: "#111827",
    borderRadius: "10px",
  },

  requirement: {
    fontSize: "14px",
    marginBottom: "8px",
  },

  check: {
    display: "inline-block",
    width: "24px",
    fontWeight: "700",
  },

  matchMessage: {
    marginTop: "10px",
    fontSize: "14px",
    fontWeight: "600",
  },

  button: {
    width: "100%",
    marginTop: "20px",
    padding: "14px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },

  errorMessage: {
    marginTop: "18px",
    padding: "14px",
    borderRadius: "9px",
    background: "#3f0b0b",
    border: "1px solid #ef4444",
    color: "#fecaca",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  successMessage: {
    marginTop: "18px",
    padding: "14px",
    borderRadius: "9px",
    background: "#052e16",
    border: "1px solid #22c55e",
    color: "#bbf7d0",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  bottom: {
    textAlign: "center",
    marginTop: "22px",
  },

  backLink: {
    background: "transparent",
    border: "none",
    color: "#22c55e",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
  },
};
