// app/auth/callback/page.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Confirming your email securely...");

  useEffect(() => {
    let active = true;

    async function finishAuth() {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const errorCode = hash.get("error_code");
      const errorDescription = hash.get("error_description") || "";

      if (errorCode || errorDescription) {
        if (!active) return;
        setStatus("error");
        setMessage(
          /expired|invalid/i.test(errorDescription) || errorCode === "otp_expired"
            ? "This verification link has expired or has already been used. Request a fresh verification email from the login page."
            : "We couldn't verify this email link. Please request a fresh verification email and try again."
        );
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error || !data?.session) {
        setStatus("error");
        setMessage("We couldn't finish email verification. Please request a fresh verification email and try again.");
        return;
      }

      setStatus("success");
      setMessage("Email verified successfully. Opening your player account...");

      window.setTimeout(() => {
        router.replace("/profile");
      }, 1200);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        finishAuth();
      }
    });

    finishAuth();

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, [router]);

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <div style={styles.logo}>Play2Prove</div>
        <div style={{ ...styles.icon, ...(status === "error" ? styles.errorIcon : {}) }}>
          {status === "checking" ? "…" : status === "success" ? "✓" : "!"}
        </div>
        <h1 style={styles.title}>
          {status === "checking" ? "Verifying Email" : status === "success" ? "Email Verified" : "Verification Problem"}
        </h1>
        <p style={styles.text}>{message}</p>

        {status === "error" && (
          <>
            <button type="button" onClick={() => router.replace("/login")} style={styles.button}>
              Back to Login & Resend
            </button>
            <p style={styles.helper}>
              Use the newest email. Old links may no longer be valid.
            </p>
          </>
        )}
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
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    padding: "32px",
    background: "#0b0e13",
    border: "1px solid #252a32",
    borderRadius: "18px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  logo: { fontSize: "34px", fontWeight: "800", marginBottom: "22px" },
  icon: {
    width: "58px",
    height: "58px",
    margin: "0 auto 16px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "#052e16",
    border: "1px solid #22c55e",
    color: "#22c55e",
    fontSize: "28px",
    fontWeight: "800",
  },
  errorIcon: {
    background: "#3f0b0b",
    border: "1px solid #ef4444",
    color: "#ef4444",
  },
  title: { fontSize: "28px", margin: "0 0 10px" },
  text: { color: "#cbd5e1", lineHeight: "1.6" },
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
  helper: { marginTop: "14px", color: "#94a3b8", fontSize: "13px" },
};
