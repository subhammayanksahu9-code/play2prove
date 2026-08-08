"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {supabase} from "../../lib/supabase";
import {useRouter} from "next/navigation";

export default function SignupPage() {
    const router = useRouter();

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
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    useEffect(() => {
        if (!successMessage) return;

        const timer = setTimeout(() => {
            router.push("/login");
        }, 3000);

        return () => clearTimeout(timer);
    }, [successMessage, router]);

    // ===============================
    // INPUT REFERENCES
    // ===============================

    const nameRef = useRef(null);

    const emailRef = useRef(null);

    const phoneRef = useRef(null);

    const passwordRef = useRef(null);

    const confirmPasswordRef = useRef(null);

    // ===============================
    // CLEAN VALUES
    // ===============================

    const cleanName = fullName.trim();

    const cleanEmail = email.trim().toLowerCase();

    const cleanPhone = phone.replace(/\D/g, "");

    const cleanReferral = referralCode.trim().toUpperCase();

    // ===============================
    // LIVE INPUT FORMATTERS
    // ===============================

    function handleNameChange(value) {
        const cleaned = value.replace(/\s+/g, " ").replace(/[^A-Za-z ]/g, "");

        setFullName(cleaned);
    }

    function handleEmailChange(value) {
        setEmail(value.trim().toLowerCase());
    }

    function handlePhoneChange(value) {
        const cleaned = value.replace(/\D/g, "").slice(0, 10);

        setPhone(cleaned);
    }

    function handleReferralChange(value) {
        setReferralCode(value.replace(/[^A-Za-z0-9-]/g, "").toUpperCase());
    }

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

    const passwordStrength = getPasswordStrength(passwordScore);

    const passwordStrengthColor = getPasswordColor(passwordScore);

    // ===============================
    // HANDLE SIGNUP
    // ===============================
    // ===============================
    // ENTER KEY HANDLER
    // ===============================

    function handleEnter(e) {
        if (e.key === "Enter") {
            e.preventDefault();

            handleSignup(e);
        }
    }

    async function handleSignup(e) {
        e.preventDefault();

        clearAlerts();

        if (!isValidName(cleanName)) {
            nameRef.current?.focus();

            setErrorMessage("Please enter your full name.");

            return;
        }

        if (!isValidEmail(cleanEmail)) {
            emailRef.current?.focus();

            setErrorMessage("Please enter a valid email address.");

            return;
        }

        if (!isValidPhone(cleanPhone)) {
            phoneRef.current?.focus();

            setErrorMessage(
                "Please enter a valid 10-digit Indian mobile number."
            );

            return;
        }

        if (!passwordValid) {
            passwordRef.current?.focus();

            setErrorMessage(
                "Please create a stronger password by completing all password requirements."
            );

            return;
        }

        if (password !== confirmPassword) {
            confirmPasswordRef.current?.focus();

            setErrorMessage("Passwords do not match.");

            return;
        }

        // Prevent multiple submit clicks

        if (loading) {
            return;
        }
        setLoading(true);

        try {
            const {data: phoneExists, error: phoneCheckError} =
                await supabase.rpc("check_phone_exists", {
                    p_phone: cleanPhone
                });

            if (phoneCheckError) {
                throw phoneCheckError;
            }

            if (phoneExists) {
                setErrorMessage(
                    "This mobile number is already registered. Please sign in using your existing account."
                );

                return;
            }
            // ===============================
            // BASIC SECURITY CHECKS
            // ===============================

            if (cleanPhone.length !== 10) {
                throw new Error("Please enter a valid 10-digit mobile number.");
            }

            if (!/^[6-9]/.test(cleanPhone)) {
                throw new Error("Mobile number must start with 6, 7, 8 or 9.");
            }

            if (cleanName.length > 60) {
                throw new Error("Full name is too long.");
            }

            if (cleanEmail.length > 120) {
                throw new Error("Email address is too long.");
            }

            if (
                cleanReferral.length > 0 &&
                !/^[A-Z0-9-]{4,20}$/.test(cleanReferral)
            ) {
                throw new Error("Please enter a valid referral code.");
            }

            setErrorMessage("");

            setSuccessMessage("");

            const {data, error} = await supabase.auth.signUp({
                email: cleanEmail,

                password,

                options: {
                    data: {
                        full_name: cleanName,

                        phone: cleanPhone,

                        referral_code: cleanReferral || null
                    }
                }
            });

            if (error) {
                throw error;
            }
            if (!data.user) {
                throw new Error("Unable to create your account.");
            }

            if (data.user.identities && data.user.identities.length === 0) {
                throw new Error(
                    "This email is already registered. Please sign in using your existing account."
                );
            }

            setSuccessMessage(
                "Account created successfully. Please verify your email. Redirecting to Login..."
            );

            clearForm();
        } catch (error) {
            const msg = (error.message || "").toLowerCase();

            // ===============================
            // FRIENDLY ERROR HANDLING
            // ===============================

            if (isPhoneAlreadyRegistered(error)) {
                setErrorMessage(
                    "This mobile number is already linked to another account. Please sign in using the email associated with this mobile number."
                );
            } else if (isEmailAlreadyRegistered(error)) {
                setErrorMessage(
                    "This email is already registered. Please sign in using your existing account."
                );
            } else if (isRateLimit(error)) {
                setErrorMessage(
                    "Too many signup attempts were made. Please wait 2–5 minutes before trying again."
                );
            } else if (isNetworkError(error)) {
                setErrorMessage(
                    "Unable to connect to the server. Please check your internet connection and try again."
                );
            } else if (msg.includes("invalid login credentials")) {
                setErrorMessage("The email or password is incorrect.");
            } else if (msg.includes("email not confirmed")) {
                setErrorMessage("Please verify your email before signing in.");
            } else {
                setErrorMessage(
                    error.message ||
                        "Something went wrong while creating your account."
                );
            }
        } finally {
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

                <form
                    onSubmit={handleSignup}
                    onKeyDown={handleEnter}
                    autoComplete="on"
                    noValidate
                >
                    <label>Full Name</label>

                    <input
                        type="text"
                        value={fullName}
                        maxLength={60}
                        ref={nameRef}
                        onChange={e => handleNameChange(e.target.value)}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        spellCheck={false}
                        autoCapitalize="words"
                        style={inputStyle}
                    />

                    <label>Email Address</label>

                    <input
                        type="email"
                        maxLength={120}
                        ref={emailRef}
                        value={email}
                        onChange={e => handleEmailChange(e.target.value)}
                        placeholder="Enter your email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        style={inputStyle}
                    />

                    <label>Mobile Number</label>

                    <input
                        type="tel"
                        value={phone}
                        ref={phoneRef}
                        maxLength={10}
                        onChange={e => handlePhoneChange(e.target.value)}
                        placeholder="10-digit mobile number"
                        autoComplete="tel"
                        inputMode="numeric"
                        style={inputStyle}
                    />
                    <label>
                        Referral Code
                        <span
                            style={{
                                color: "#9ca3af",
                                fontSize: "12px",
                                marginLeft: "8px"
                            }}
                        >
                            (Optional)
                        </span>
                    </label>

                    <input
                        type="text"
                        value={referralCode}
                        onChange={e => handleReferralChange(e.target.value)}
                        placeholder="Enter referral code"
                        maxLength={20}
                        style={inputStyle}
                    />

                    <label>Password</label>

                    <div
                        style={{
                            position: "relative",

                            marginBottom: "18px"
                        }}
                    >
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Create Password"
                            maxLength={100}
                            autoComplete="new-password"
                            ref={passwordRef}
                            style={inputStyle}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: "absolute",

                                right: "12px",

                                top: "50%",

                                transform: "translateY(-50%)",

                                background: "transparent",

                                border: "none",

                                color: "#22c55e",

                                cursor: "pointer",

                                fontWeight: "700"
                            }}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    <div
                        style={{
                            background: "#111827",

                            border: "1px solid #1f2937",

                            borderRadius: "10px",

                            padding: "14px",

                            marginBottom: "20px"
                        }}
                    >
                        <div style={passwordItem(passwordChecks.length)}>
                            {passwordChecks.length ? "🟢" : "⚪"}

                            <span>8 or more characters</span>
                        </div>

                        <div style={passwordItem(passwordChecks.uppercase)}>
                            {passwordChecks.uppercase ? "🟢" : "⚪"}

                            <span>One uppercase letter (A–Z)</span>
                        </div>

                        <div style={passwordItem(passwordChecks.lowercase)}>
                            {passwordChecks.lowercase ? "🟢" : "⚪"}

                            <span>One lowercase letter (a–z)</span>
                        </div>

                        <div style={passwordItem(passwordChecks.number)}>
                            {passwordChecks.number ? "🟢" : "⚪"}

                            <span>One number (0–9)</span>
                        </div>

                        <div style={passwordItem(passwordChecks.special)}>
                            {passwordChecks.special ? "🟢" : "⚪"}

                            <span>One special character</span>
                        </div>

                        <div
                            style={{
                                marginTop: "14px",

                                height: "8px",

                                background: "#222",

                                borderRadius: "999px",

                                overflow: "hidden"
                            }}
                        >
                            <div
                                style={{
                                    width: passwordPercentage + "%",

                                    height: "100%",

                                    background: "#22c55e",

                                    transition: "0.35s"
                                }}
                            />
                        </div>
                        <div
                            style={{
                                marginTop: "12px",

                                display: "flex",

                                justifyContent: "space-between",

                                alignItems: "center"
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "13px",

                                    color: "#9ca3af"
                                }}
                            >
                                Password Strength
                            </span>

                            <span
                                style={{
                                    fontSize: "13px",

                                    fontWeight: "700",

                                    color: passwordStrengthColor
                                }}
                            >
                                {passwordStrength}
                            </span>
                        </div>

                        {password.length > 0 && !passwordValid && (
                            <div
                                style={{
                                    marginTop: "12px",

                                    color: "#f59e0b",

                                    fontSize: "13px",

                                    lineHeight: "22px"
                                }}
                            >
                                Complete all password requirements to continue.
                            </div>
                        )}

                        {password.length > 0 && passwordValid && (
                            <div
                                style={{
                                    marginTop: "12px",

                                    color: "#22c55e",

                                    fontSize: "13px",

                                    fontWeight: "600"
                                }}
                            >
                                ✓ Password meets all security requirements.
                            </div>
                        )}
                    </div>

                    <label>Confirm Password</label>

                    <div
                        style={{
                            position: "relative",

                            marginBottom: "22px"
                        }}
                    >
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            autoComplete="new-password"
                            ref={confirmPasswordRef}
                            maxLength={100}
                            style={inputStyle}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            style={{
                                position: "absolute",

                                right: "12px",

                                top: "50%",

                                transform: "translateY(-50%)",

                                background: "transparent",

                                border: "none",

                                color: "#22c55e",

                                cursor: "pointer",

                                fontWeight: "700"
                            }}
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {confirmPassword.length > 0 &&
                        password === confirmPassword && (
                            <div
                                style={{
                                    marginTop: "-10px",

                                    marginBottom: "18px",

                                    color: "#22c55e",

                                    fontSize: "14px",

                                    fontWeight: "600",

                                    display: "flex",

                                    alignItems: "center",

                                    gap: "8px"
                                }}
                            >
                                ✓ Passwords match
                            </div>
                        )}

                    {confirmPassword.length > 0 &&
                        password !== confirmPassword && (
                            <div
                                style={{
                                    marginTop: "-10px",

                                    marginBottom: "18px",

                                    color: "#ef4444",

                                    fontSize: "14px",

                                    fontWeight: "600",

                                    display: "flex",

                                    alignItems: "center",

                                    gap: "8px"
                                }}
                            >
                                ✗ Passwords do not match
                            </div>
                        )}

                    {successMessage && (
                        <div
                            style={{
                                background: "#052e16",

                                border: "1px solid #22c55e",

                                color: "#dcfce7",

                                padding: "14px",

                                borderRadius: "10px",

                                marginBottom: "18px",

                                lineHeight: "24px"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "20px"
                                    }}
                                >
                                    ✅
                                </span>

                                <span>{successMessage}</span>
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div
                            style={{
                                background: "#3b0a0a",

                                border: "1px solid #ef4444",

                                color: "#fecaca",

                                padding: "14px",

                                borderRadius: "10px",

                                marginBottom: "18px",

                                lineHeight: "24px"
                            }}
                        >
                            ❌ {errorMessage}
                        </div>
                    )}
                    <div
                        style={{
                            display: "flex",

                            alignItems: "flex-start",

                            gap: "10px",

                            marginBottom: "20px"
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={e => setAcceptedTerms(e.target.checked)}
                            style={{
                                marginTop: "4px",

                                cursor: "pointer"
                            }}
                        />

                        <label
                            style={{
                                fontSize: "14px",

                                lineHeight: "22px",

                                color: "#d1d5db"
                            }}
                        >
                            I agree to the{" "}
                            <a
                                href="/terms"
                                target="_blank"
                                style={{
                                    color: "#22c55e",

                                    textDecoration: "none"
                                }}
                            >
                                Terms & Conditions
                            </a>{" "}
                            and{" "}
                            <a
                                href="/privacy"
                                target="_blank"
                                style={{
                                    color: "#22c55e",

                                    textDecoration: "none"
                                }}
                            >
                                Privacy Policy
                            </a>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !passwordValid ||
                            password !== confirmPassword ||
                            !fullName ||
                            !email ||
                            !phone ||
                            !acceptedTerms
                        }
                        style={{
                            width: "100%",

                            border: "none",

                            borderRadius: "12px",

                            padding: "15px",

                            background:
                                loading ||
                                !passwordValid ||
                                password !== confirmPassword ||
                                !fullName ||
                                !email ||
                                !phone ||
                                !acceptedTerms
                                    ? "#4b5563"
                                    : "#16a34a",

                            color: "#ffffff",

                            fontSize: "17px",

                            fontWeight: "700",

                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? (
                            <span
                                style={{
                                    display: "flex",

                                    justifyContent: "center",

                                    alignItems: "center",

                                    gap: "10px"
                                }}
                            >
                                <span
                                    style={{
                                        width: "18px",

                                        height: "18px",

                                        border: "3px solid rgba(255,255,255,.35)",

                                        borderTop: "3px solid #ffffff",

                                        borderRadius: "50%",

                                        animation: "spin 0.8s linear infinite",

                                        display: "inline-block"
                                    }}
                                />
                                Creating Account...
                            </span>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p
                    style={{
                        marginTop: "24px",

                        textAlign: "center",

                        color: "#9ca3af"
                    }}
                >
                    Already have an account?{" "}
                    <a
                        href="/login"
                        onClick={e => {
                            e.preventDefault();

                            router.push("/login");
                        }}
                        style={{
                            color: "#22c55e",

                            textDecoration: "none",

                            fontWeight: "700"
                        }}
                    >
                        Login
                    </a>
                </p>
            </div>

            <style>
                {`

@keyframes spin {

from {

transform: rotate(0deg);

}

to {

transform: rotate(360deg);

}

}

`}
            </style>
        </main>
    );
}

const inputStyle = {
    width: "100%",

    boxSizing: "border-box",

    padding: "14px",

    marginTop: "8px",

    marginBottom: "18px",

    borderRadius: "10px",

    border: "1px solid #30363d",

    background: "#05070a",

    color: "#ffffff",

    fontSize: "15px",

    outline: "none"
};

function passwordItem(active) {
    return {
        display: "flex",

        alignItems: "center",

        gap: "10px",

        marginBottom: "8px",

        color: active ? "#22c55e" : "#9ca3af",

        fontSize: "14px"
    };
}
// =====================================================
// PART 9
// ADVANCED HELPERS
// =====================================================

// Email already exists
function isEmailAlreadyRegistered(error) {
    const msg = (error?.message || "").toLowerCase();

    return (
        msg.includes("already registered") ||
        msg.includes("user already registered") ||
        msg.includes("email already exists")
    );
}

// Phone already exists
function isPhoneAlreadyRegistered(error) {
    const msg = (error?.message || "").toLowerCase();

    return (
        msg.includes("profiles_phone_unique") ||
        msg.includes("duplicate") ||
        msg.includes("phone")
    );
}

// Network error
function isNetworkError(error) {
    const msg = (error?.message || "").toLowerCase();

    return (
        msg.includes("network") ||
        msg.includes("fetch") ||
        msg.includes("failed to fetch")
    );
}

// Rate limit
function isRateLimit(error) {
    const msg = (error?.message || "").toLowerCase();

    return msg.includes("rate limit") || msg.includes("security purposes");
}

// Password Strength Text
function getPasswordStrength(score) {
    switch (score) {
        case 0:

        case 1:
            return "Very Weak";

        case 2:
            return "Weak";

        case 3:
            return "Average";

        case 4:
            return "Strong";

        case 5:
            return "Excellent";

        default:
            return "";
    }
}

// Password Strength Color
function getPasswordColor(score) {
    switch (score) {
        case 1:
            return "#ef4444";

        case 2:
            return "#f97316";

        case 3:
            return "#eab308";

        case 4:
            return "#22c55e";

        case 5:
            return "#16a34a";

        default:
            return "#374151";
    }
}
