"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SignupPage() {

  // ===============================
  // USER INPUTS
  // ===============================

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [referralCode, setReferralCode] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  // ===============================
  // UI STATES
  // ===============================

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ===============================
  // CLEAN VALUES
  // ===============================

  const cleanName = fullName.trim();

  const cleanEmail = email.trim().toLowerCase();

  const cleanPhone = phone.replace(/\D/g, "");

  const cleanReferral = referralCode.trim().toUpperCase();

  // ===============================
  // PASSWORD CHECKS
  // ===============================

  const passwordChecks = useMemo(() => {

    return {

      length: password.length >= 8,

      uppercase: /[A-Z]/.test(password),

      lowercase: /[a-z]/.test(password),

      number: /\d/.test(password),

      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)

    };

  }, [password]);
    // ===============================
  // PASSWORD VALID
  // ===============================

  const passwordValid =

    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number &&
    passwordChecks.special;

  // ===============================
  // VALIDATION FUNCTIONS
  // ===============================

  function isValidName(name) {

    return name.length >= 3;

  }

  function isValidEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  }

  function isValidPhone(value) {

    return /^[6-9][0-9]{9}$/.test(value);

  }

  // ===============================
  // CLEAR FORM
  // ===============================

  function clearForm() {

    setFullName("");

    setEmail("");

    setPhone("");

    setReferralCode("");

    setPassword("");

    setConfirmPassword("");

  }

  // ===============================
  // CLEAR ALERTS
  // ===============================

  function clearAlerts() {

    setErrorMessage("");

    setSuccessMessage("");

  }

  // ===============================
  // PASSWORD SCORE
  // ===============================

  const passwordScore = [

    passwordChecks.length,

    passwordChecks.uppercase,

    passwordChecks.lowercase,

    passwordChecks.number,

    passwordChecks.special

  ].filter(Boolean).length;

  const passwordPercentage = passwordScore * 20;
    // ===============================
  // HANDLE SIGNUP
  // ===============================

  async function handleSignup(e) {

    e.preventDefault();

    clearAlerts();

    if (!isValidName(cleanName)) {

      setErrorMessage(
        "Please enter your full name."
      );

      return;

    }

    if (!isValidEmail(cleanEmail)) {

      setErrorMessage(
        "Please enter a valid email address."
      );

      return;

    }

    if (!isValidPhone(cleanPhone)) {

      setErrorMessage(
        "Please enter a valid 10-digit Indian mobile number."
      );

      return;

    }

    if (!passwordValid) {

      setErrorMessage(
        "Please create a stronger password by completing all password requirements."
      );

      return;

    }

    if (password !== confirmPassword) {

      setErrorMessage(
        "Passwords do not match."
      );

      return;

    }

    setLoading(true);

    try {

      const { data, error } =
        await supabase.auth.signUp({

          email: cleanEmail,

          password,

          options: {

            data: {

              full_name: cleanName,

              phone: cleanPhone,

              referral_code:
                cleanReferral || null

            }

          }

        });

      if (error) {

        throw error;

      }
            if (!data.user) {

        throw new Error(
          "Unable to create your account."
        );

      }

      if (

        data.user.identities &&
        data.user.identities.length === 0

      ) {

        throw new Error(
          "This email is already registered. Please sign in using your existing account."
        );

      }

      setSuccessMessage(

        "Account created successfully. Please verify your email before signing in."

      );

      clearForm();

    } catch (error) {

      const msg =
        (error.message || "").toLowerCase();

      if (

        msg.includes("profiles_phone_unique") ||

        msg.includes("duplicate") ||

        msg.includes("phone")

      ) {

        setErrorMessage(

          "This mobile number is already linked to another account. Please sign in using the email associated with this mobile number."

        );

      }

      else if (

        msg.includes("already registered") ||

        msg.includes("user already registered")

      ) {

        setErrorMessage(

          "This email is already registered. Please sign in using your existing account."

        );

      }

      else if (

        msg.includes("rate limit")

      ) {

        setErrorMessage(

          "Too many signup attempts were made. Please wait a few minutes before trying again."

        );

      }

      else {

        setErrorMessage(

          error.message ||

          "Unable to create your account. Please try again."

        );

      }

    }

    finally {

      setLoading(false);

    }

  }
    // ===============================
  // UI START
  // ===============================

  return (

    <main

      style={{

        minHeight: "100vh",

        background: "#05070a",

        display: "flex",

        justifyContent: "center",

        alignItems: "center",

        padding: "24px",

        fontFamily: "Arial, sans-serif"

      }}

    >

      <div

        style={{

          width: "100%",

          maxWidth: "470px",

          background: "#0d1117",

          border: "1px solid #24292f",

          borderRadius: "18px",

          padding: "34px",

          color: "#ffffff"

        }}

      >

        <h1

          style={{

            textAlign: "center",

            fontSize: "34px",

            marginBottom: "8px"

          }}

        >

          Play2Prove

        </h1>

        <p

          style={{

            textAlign: "center",

            color: "#9ca3af",

            marginBottom: "30px"

          }}

        >

          Create Your Player Account

        </p>

        <form onSubmit={handleSignup}>

          <label>

            Full Name

          </label>

          <input

            type="text"

            value={fullName}

            onChange={(e)=>setFullName(e.target.value)}

            placeholder="Enter your full name"

            style={inputStyle}

          />

          <label>

            Email Address

          </label>

          <input

            type="email"

            value={email}

            onChange={(e)=>setEmail(e.target.value)}

            placeholder="Enter your email"

            style={inputStyle}

          />

          <label>

            Mobile Number

          </label>

          <input

            type="tel"

            value={phone}

            maxLength={10}

            onChange={(e)=>

              setPhone(

                e.target.value

                  .replace(/\D/g,"")

              )

            }

            placeholder="10-digit mobile number"

            style={inputStyle}

          />
                // ===============================
  // UI START
  // ===============================

  return (

    <main

      style={{

        minHeight: "100vh",

        background: "#05070a",

        display: "flex",

        justifyContent: "center",

        alignItems: "center",

        padding: "24px",

        fontFamily: "Arial, sans-serif"

      }}

    >

      <div

        style={{

          width: "100%",

          maxWidth: "470px",

          background: "#0d1117",

          border: "1px solid #24292f",

          borderRadius: "18px",

          padding: "34px",

          color: "#ffffff"

        }}

      >

        <h1

          style={{

            textAlign: "center",

            fontSize: "34px",

            marginBottom: "8px"

          }}

        >

          Play2Prove

        </h1>

        <p

          style={{

            textAlign: "center",

            color: "#9ca3af",

            marginBottom: "30px"

          }}

        >

          Create Your Player Account

        </p>

        <form onSubmit={handleSignup}>

          <label>

            Full Name

          </label>

          <input

            type="text"

            value={fullName}

            onChange={(e)=>setFullName(e.target.value)}

            placeholder="Enter your full name"

            style={inputStyle}

          />

          <label>

            Email Address

          </label>

          <input

            type="email"

            value={email}

            onChange={(e)=>setEmail(e.target.value)}

            placeholder="Enter your email"

            style={inputStyle}

          />

          <label>

            Mobile Number

          </label>

          <input

            type="tel"

            value={phone}

            maxLength={10}

            onChange={(e)=>

              setPhone(

                e.target.value

                  .replace(/\D/g,"")

              )

            }

            placeholder="10-digit mobile number"

            style={inputStyle}

          />
          
  
