// app/verify-email/page.js

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

function maskEmail(email) {
  if (!email || !email.includes("@")) return "your email address";
  const [name, domain] = email.split("@");
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${name.length > 2 ? "•••" : "•"}@${domain}`;
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail((searchParams.get("email") || "").trim().toLowerCase());

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const errorCode = hashParams.get("error_code");
    const errorDescription = hashParams.get("error_description") || "";

    if (errorCode === "otp_expired" || /expired|invalid/i.test(errorDescription)) {
      setError("That verification link has expired or has already been used. Request a fresh email below.");
    }
  }, [searchParams]);

  async function resendVerification() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address first.");
      setMessage("");
      return;
    }

    if (cooldown > 0 || sending) return;

    setSending(true);
    setError("");
    setMessage("");

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (resendError) {
        const text = (resendError.message || "").toLowerCase();
        if (text.includes("rate limit") || text.includes("too many")) {
          throw new Error("Email sending is temporarily rate-limited. Please wait a few minutes before requesting another email.");
        }
        throw resendError;
      }

      setMessage("Fresh verification email sent. Open the newest email and use that link.");
      setCooldown(60);

      const interval = window.setInterval(() => {
        setCooldown((value) => {
          if (value <= 1) {
            window.clearInterval(interval);
            return 0;
          }
          return value - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Verification resend error:", err);
      setError(err?.message || "Unable to send a new verification email. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <div style={styles.logo}>Play2Prove</div>
        <div style={styles.icon}>✓</div>
        <h1 style={styles.title}>Verify Your Email</h1>
        <p style={styles.subtitle}>
          We need to verify your email before you can sign in to your player account.
        </p>

        <div style={styles.emailBox}>
          <span style={styles.emailLabel}>Verification email</span>
          <strong style={styles.emailValue}>{maskEmail(email)}</strong>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        <div style={styles.steps}>
          <div><b>1.</b> Check your inbox and spam/junk folder.</div>
          <div><b>2.</b> Open the newest Play2Prove verification email.</div>
          <div><b>3.</b> Use the link only once. Older links may expire.</div>
        </div>

        <button
          type="button"
          onClick={resendVerification}
          disabled={sending || cooldown > 0}
          style={{ ...styles.button, opacity: sending || cooldown > 0 ? 0.6 : 1 }}
        >
          {sending ? "Sending Verification Email..." : cooldown > 0 ? `Resend available in ${cooldown}s` : "Send New Verification Email"}
        </button>

        <button type="button" onClick={() => router.replace("/login")} style={styles.secondaryButton}>
          Back to Login
        </button>
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background: "#05070a",
    color: "#fff",
    fontFamily: "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#0b0e13",
    border: "1px solid #252a32",
    borderRadius: "18px",
    padding: "32px",
    boxSizing: "border-box",
    textAlign: "center",
  },
  logo: { fontSize: "34px", fontWeight: "800", marginBottom: "18px" },
  icon: {
    width: "58px",
    height: "58px",
    margin: "0 auto 14px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "#052e16",
    border: "1px solid #22c55e",
    color: "#22c55e",
    fontSize: "28px",
    fontWeight: "800",
  },
  title: { fontSize: "28px", margin: "0 0 8px" },
  subtitle: { color: "#9ca3af", lineHeight: "1.55", marginBottom: "22px" },
  emailBox: {
    textAlign: "left",
    padding: "14px",
    borderRadius: "10px",
    background: "#111827",
    border: "1px solid #334155",
    marginBottom: "14px",
  },
  emailLabel: { display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "4px" },
  emailValue: { fontSize: "15px" },
  error: {
    textAlign: "left",
    padding: "13px",
    borderRadius: "10px",
    background: "#3f0b0b",
    border: "1px solid #ef4444",
    color: "#fecaca",
    lineHeight: "1.5",
    marginBottom: "12px",
  },
  success: {
    textAlign: "left",
    padding: "13px",
    borderRadius: "10px",
    background: "#052e16",
    border: "1px solid #22c55e",
    color: "#bbf7d0",
    lineHeight: "1.5",
    marginBottom: "12px",
  },
  steps: {
    textAlign: "left",
    padding: "14px",
    borderRadius: "10px",
    background: "#0f172a",
    border: "1px solid #1e293b",
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: "1.8",
    marginBottom: "18px",
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
  secondaryButton: {
    width: "100%",
    marginTop: "12px",
    padding: "13px",
    background: "transparent",
    color: "#22c55e",
    border: "1px solid #334155",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
};
