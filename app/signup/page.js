// app/signup/page.js

"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

function getEmailRedirectUrl() {
  const configuredSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const base = configuredSite || window.location.origin;
  return `${base.replace(/\/$/, "")}/auth/callback`;
}

function friendlyError(error) {
  const text = (error?.message || "").toLowerCase();

  if (text.includes("already registered") || text.includes("user already registered")) {
    return "This email is already registered. Please sign in instead.";
  }

  if (text.includes("rate limit") || text.includes("too many requests")) {
    return "Email sending is temporarily rate-limited. Please wait a few minutes before requesting another email.";
  }

  if (text.includes("network") || text.includes("failed to fetch") || text.includes("fetch")) {
    return "We couldn't connect to the authentication server. Please check your internet connection and try again.";
  }

  return error?.message || "Something went wrong while creating your account.";
}

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const cleanName = fullName.trim().replace(/\s+/g, " ");
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.replace(/\D/g, "");
  const cleanReferral = referralCode.trim().toUpperCase();

  const passwordChecks = useMemo(() => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);

  const passwordValid = Object.values(passwordChecks).every(Boolean);

  function validate() {
    if (cleanName.length < 3 || cleanName.length > 60) {
      nameRef.current?.focus();
      return "Please enter a valid full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 120) {
      emailRef.current?.focus();
      return "Please enter a valid email address.";
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      phoneRef.current?.focus();
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    if (cleanReferral && !/^[A-Z0-9-]{4,20}$/.test(cleanReferral)) {
      return "Please enter a valid referral code.";
    }

    if (!passwordValid) {
      passwordRef.current?.focus();
      return "Please complete all password security requirements.";
    }

    if (password !== confirmPassword) {
      confirmRef.current?.focus();
      return "Passwords do not match.";
    }

    if (!acceptedTerms) {
      return "Please accept the Terms & Conditions and Privacy Policy.";
    }

    return "";
  }

  async function handleSignup(event) {
    event.preventDefault();
    setErrorMessage("");

    if (loading) return;

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      const { data: phoneExists, error: phoneError } = await supabase.rpc("check_phone_exists", {
        p_phone: cleanPhone,
      });

      if (phoneError) throw phoneError;

      if (phoneExists) {
        setErrorMessage("This mobile number is already registered. Please use the email linked to that account.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: getEmailRedirectUrl(),
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            referral_code: cleanReferral || null,
          },
        },
      });

      if (error) throw error;

      if (!data?.user) {
        throw new Error("Unable to create your account.");
      }

      if (data.user.identities && data.user.identities.length === 0) {
        setErrorMessage("This email is already registered. Please sign in instead.");
        return;
      }

      router.replace(`/verify-email?email=${encodeURIComponent(cleanEmail)}`);
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage(friendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  const requirements = [
    [passwordChecks.length, "8 or more characters"],
    [passwordChecks.uppercase, "One uppercase letter (A–Z)"],
    [passwordChecks.lowercase, "One lowercase letter (a–z)"],
    [passwordChecks.number, "One number (0–9)"],
    [passwordChecks.special, "One special character"],
  ];

  return (
    <main style={styles.main}>
      <button type="button" onClick={() => router.replace("/login")} style={styles.backButton}>
        ← Back
      </button>

      <div style={styles.card}>
        <div style={styles.logo}>Play2Prove</div>
        <h1 style={styles.title}>Create Your Player Account</h1>
        <p style={styles.subtitle}>Secure signup with email verification</p>

        <form onSubmit={handleSignup} noValidate>
          <label style={styles.label}>Full Name</label>
          <input
            ref={nameRef}
            type="text"
            value={fullName}
            maxLength={60}
            onChange={(e) => setFullName(e.target.value.replace(/[^A-Za-z ]/g, ""))}
            placeholder="Enter your full name"
            autoComplete="name"
            style={styles.input}
          />

          <label style={styles.label}>Email Address</label>
          <input
            ref={emailRef}
            type="email"
            value={email}
            maxLength={120}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder="Enter your email"
            autoComplete="email"
            style={styles.input}
          />

          <label style={styles.label}>Mobile Number</label>
          <input
            ref={phoneRef}
            type="tel"
            value={phone}
            maxLength={10}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile number"
            inputMode="numeric"
            autoComplete="tel"
            style={styles.input}
          />

          <label style={styles.label}>
            Referral Code <span style={styles.optional}>(Optional)</span>
          </label>
          <input
            type="text"
            value={referralCode}
            maxLength={20}
            onChange={(e) => setReferralCode(e.target.value.replace(/[^A-Za-z0-9-]/g, "").toUpperCase())}
            placeholder="Enter referral code"
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <div style={styles.passwordWrap}>
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              value={password}
              maxLength={100}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create Password"
              autoComplete="new-password"
              style={styles.passwordInput}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} style={styles.showButton}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div style={styles.requirements}>
            {requirements.map(([valid, text]) => (
              <div key={text} style={{ ...styles.requirement, color: valid ? "#22c55e" : "#9ca3af" }}>
                {valid ? "✓" : "○"} {text}
              </div>
            ))}
          </div>

          <label style={styles.label}>Confirm Password</label>
          <div style={styles.passwordWrap}>
            <input
              ref={confirmRef}
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              maxLength={100}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              autoComplete="new-password"
              style={styles.passwordInput}
            />
            <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} style={styles.showButton}>
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          {confirmPassword && (
            <div style={{ ...styles.match, color: password === confirmPassword ? "#22c55e" : "#ef4444" }}>
              {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
            </div>
          )}

          <label style={styles.termsRow}>
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
            <span>
              I agree to the <Link href="/terms" style={styles.link}>Terms & Conditions</Link> and <Link href="/privacy" style={styles.link}>Privacy Policy</Link>.
            </span>
          </label>

          {errorMessage && <div style={styles.error}>{errorMessage}</div>}

          <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.65 : 1 }}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.bottom}>
          Already have an account? <Link href="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </main>
  );
}

const styles = {
  main: { minHeight: "100vh", background: "#05070a", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", padding: "24px", fontFamily: "Arial, sans-serif", boxSizing: "border-box" },
  card: { width: "100%", maxWidth: "470px", background: "#0d1117", border: "1px solid #24292f", borderRadius: "18px", padding: "34px", boxSizing: "border-box" },
  backButton: { position: "fixed", top: "20px", left: "20px", padding: "10px 16px", background: "#0d1117", color: "#fff", border: "1px solid #30363d", borderRadius: "9px", fontWeight: "700", cursor: "pointer" },
  logo: { textAlign: "center", fontSize: "34px", fontWeight: "800", marginBottom: "8px" },
  title: { textAlign: "center", fontSize: "26px", margin: "0 0 8px" },
  subtitle: { textAlign: "center", color: "#9ca3af", marginBottom: "28px" },
  label: { display: "block", fontWeight: "700", marginBottom: "8px", marginTop: "12px" },
  optional: { color: "#9ca3af", fontSize: "12px", fontWeight: "400" },
  input: { width: "100%", boxSizing: "border-box", padding: "14px", marginBottom: "4px", background: "#05070a", border: "1px solid #30363d", borderRadius: "9px", color: "#fff", fontSize: "15px", outline: "none" },
  passwordWrap: { position: "relative", width: "100%" },
  passwordInput: { width: "100%", boxSizing: "border-box", padding: "14px 70px 14px 14px", background: "#05070a", border: "1px solid #30363d", borderRadius: "9px", color: "#fff", fontSize: "15px", outline: "none" },
  showButton: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "#22c55e", fontWeight: "700", cursor: "pointer" },
  requirements: { marginTop: "10px", marginBottom: "8px", padding: "12px", background: "#111827", border: "1px solid #1f2937", borderRadius: "10px" },
  requirement: { fontSize: "13px", lineHeight: "1.8" },
  match: { margin: "8px 0 4px", fontSize: "13px", fontWeight: "700" },
  termsRow: { display: "flex", alignItems: "flex-start", gap: "9px", margin: "18px 0", color: "#d1d5db", fontSize: "13px", lineHeight: "1.6" },
  link: { color: "#22c55e", fontWeight: "700", textDecoration: "none" },
  error: { padding: "12px", borderRadius: "9px", background: "#3f0b0b", border: "1px solid #ef4444", color: "#fecaca", marginBottom: "14px", lineHeight: "1.5" },
  button: { width: "100%", padding: "15px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "11px", fontSize: "16px", fontWeight: "700", cursor: "pointer" },
  bottom: { textAlign: "center", color: "#9ca3af", marginTop: "22px" },
};
