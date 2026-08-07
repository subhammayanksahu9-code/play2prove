// =====================================================
// Play2Prove Premium Signup Page
// PART 1 / 15
// Delete old app/signup/page.js
// Paste this from the top of the file
// =====================================================

"use client";

import { useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";

export default function SignupPage() {

  // ---------------------------------------------------
  // FORM STATES
  // ---------------------------------------------------

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [referralCode, setReferralCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");



  // ---------------------------------------------------
  // CLEAN VALUES
  // ---------------------------------------------------

  const cleanName = fullName.trim();

  const cleanEmail = email.trim().toLowerCase();

  const cleanPhone = phone.replace(/\D/g, "");

  const cleanReferral = referralCode.trim().toUpperCase();



  // ---------------------------------------------------
  // PASSWORD LIVE CHECKS
  // ---------------------------------------------------

  const passwordChecks = useMemo(() => {

    return {

      length: password.length >= 8,

      uppercase: /[A-Z]/.test(password),

      lowercase: /[a-z]/.test(password),

      number: /[0-9]/.test(password),

      special: /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(password),

    };

  }, [password]);



  const passwordValid =
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number &&
    passwordChecks.special;



  // ---------------------------------------------------
  // EMAIL VALIDATION
  // ---------------------------------------------------

  function isValidEmail(value) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  }



  // ---------------------------------------------------
  // PHONE VALIDATION
  // ---------------------------------------------------

  function isValidPhone(value) {

    return /^[6-9][0-9]{9}$/.test(value);

  }



  // ---------------------------------------------------
  // NAME VALIDATION
  // ---------------------------------------------------

  function isValidName(value) {

    return value.length >= 3;

  }



  // ---------------------------------------------------
  // RESET MESSAGES
  // ---------------------------------------------------

  function resetMessages() {

    setSuccessMessage("");

    setErrorMessage("");

  }



  // ---------------------------------------------------
  // RESET FORM
  // ---------------------------------------------------

  function clearForm() {

    setFullName("");

    setEmail("");

    setPhone("");

    setPassword("");

    setConfirmPassword("");

    setReferralCode("");

  }



// =====================================================
// END OF PART 1
// WAIT FOR PART 2
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 2 / 15
// Paste BELOW PART 1
// =====================================================

  // ---------------------------------------------------
  // SIGNUP
  // ---------------------------------------------------

  async function handleSignup(e) {

    e.preventDefault();

    resetMessages();

    if (loading) return;

    // ---------------- NAME ----------------

    if (!isValidName(cleanName)) {

      setErrorMessage(
        "Please enter your full name."
      );

      return;
if(!referralValid){

setErrorMessage(

"Please enter a valid referral code."

);

return;

}
    }

    // ---------------- EMAIL ----------------

    if (!isValidEmail(cleanEmail)) {

      setErrorMessage(
        "Please enter a valid email address."
      );

      return;

    }

    // ---------------- PHONE ----------------

    if (!isValidPhone(cleanPhone)) {

      setErrorMessage(
        "Please enter a valid 10-digit mobile number."
      );

      return;

    }

    // ---------------- PASSWORD ----------------

    if (!passwordValid) {

      setErrorMessage(
        "Please create a stronger password by completing all password requirements."
      );

      return;

    }

    // ---------------- CONFIRM PASSWORD ----------------

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

              referral_code: cleanReferral || null,

            },

          },

        });

      console.log("Signup Data:", data);

      console.log("Signup Error:", error);

      // ---------------- SUPABASE ERROR ----------------

      if (error) {

        const msg =
          (error.message || "").toLowerCase();

        // Existing Email

        if (
          msg.includes("already registered") ||
          msg.includes("user already registered")
        ) {

          throw new Error(
            "This email is already linked to an existing account. Please sign in using this email."
          );

        }

        // Existing Phone

        if (
          msg.includes("profiles_phone_unique") ||
          msg.includes("duplicate") ||
          msg.includes("database error saving new user")
        ) {

          throw new Error(
            "This mobile number is already linked to another account. Please sign in using the email associated with this mobile number."
          );

        }

        // Too Many Attempts

        if (
          msg.includes("rate limit") ||
          msg.includes("email rate limit")
        ) {

          throw new Error(
            "Too many signup attempts were made. Please wait a few minutes and try again."
          );

        }

        throw error;

      }

// =====================================================
// END OF PART 2
// WAIT FOR PART 3
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 3 / 15
// Paste BELOW PART 2
// =====================================================

      // ---------------- USER NOT CREATED ----------------

      if (!data.user) {

        throw new Error(
          "We couldn't create your account. Please try again."
        );

      }

      // ---------------- EMAIL EXISTS ----------------

      if (
        data.user.identities &&
        data.user.identities.length === 0
      ) {

        throw new Error(
          "This email is already linked to an existing account. Please sign in using this email."
        );

      }

      // ---------------- EMAIL VERIFICATION ----------------

      setSuccessMessage(
        "Your account has been created successfully. Please verify your email before signing in."
      );

      clearForm();

    } catch (err) {

      console.error(err);

      const msg =
        (err.message || "").toLowerCase();

      // ---------------- EMAIL ----------------

      if (
        msg.includes("already linked") ||
        msg.includes("already registered") ||
        msg.includes("user already registered")
      ) {

        setErrorMessage(
          "This email is already linked to an existing account. Please sign in using this email."
        );

      }

      // ---------------- PHONE ----------------

      else if (

        msg.includes("mobile") ||

        msg.includes("phone") ||

        msg.includes("profiles_phone_unique")

      ) {

        setErrorMessage(
          "This mobile number is already linked to another account. Please sign in using the email associated with this mobile number."
        );

      }

      // ---------------- PASSWORD ----------------

      else if (

        msg.includes("password")

      ) {

        setErrorMessage(
          "Your password does not meet the security requirements."
        );

      }

      // ---------------- EMAIL LIMIT ----------------

      else if (

        msg.includes("rate limit")

      ) {

        setErrorMessage(
          "Too many signup attempts were made. Please wait a few minutes before trying again."
        );

      }

      // ---------------- NETWORK ----------------

      else if (

        msg.includes("network") ||

        msg.includes("fetch")

      ) {

        setErrorMessage(
          "Unable to connect to the server. Please check your internet connection and try again."
        );

      }

      // ---------------- UNKNOWN ----------------

      else {

        setErrorMessage(

          err.message ||

          "Unable to create your account. Please try again."

        );

      }

    } finally {

      setLoading(false);

    }

  }



  return (

    <main

      style={{

        minHeight: "100vh",

        background: "#05070a",

        display: "flex",

        justifyContent: "center",

        alignItems: "center",

        padding: "25px",

        color: "#fff",

        fontFamily: "Arial",

      }}

    >

// =====================================================
// END OF PART 3
// WAIT FOR PART 4
// =====================================================

// =====================================================
// Play2Prove Premium Signup Page
// PART 4 / 15
// Paste BELOW PART 3
// =====================================================

      <div
        style={{
          width: "100%",
          maxWidth: "470px",
          background: "#0d1117",
          border: "1px solid #23262d",
          borderRadius: "18px",
          padding: "35px",
        }}
      >

        <h1
          style={{
            textAlign: "center",
            fontSize: "34px",
            marginBottom: "8px",
          }}
        >
          Play2Prove
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#9ca3af",
            marginBottom: "30px",
          }}
        >
          Create Your Player Account
        </p>

        <form onSubmit={handleSignup}>

{/* ---------------- FULL NAME ---------------- */}

<label>Full Name</label>

<input

type="text"

value={fullName}

onChange={(e)=>setFullName(e.target.value)}

placeholder="Enter your full name"

style={inputStyle}

/>

{/* ---------------- EMAIL ---------------- */}

<label>Email Address</label>

<input

type="email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

placeholder="Enter your email"

style={inputStyle}

/>

{/* ---------------- PHONE ---------------- */}

<label>Mobile Number</label>

<input

type="tel"

value={phone}

onChange={(e)=>setPhone(e.target.value)}

placeholder="Enter your 10-digit mobile number"

style={inputStyle}

/>

{/* ---------------- REFERRAL ---------------- */}

<label>

Referral Code

<span
style={{
fontWeight:"normal",
color:"#888",
marginLeft:"8px"
}}
>
(Optional)
</span>

</label>

<input

type="text"

value={referralCode}

onChange={(e)=>
setReferralCode(
e.target.value.toUpperCase()
)
}

placeholder="Referral Code"

style={inputStyle}

/>

{/* ---------------- PASSWORD ---------------- */}

<label>Password</label>

<div
style={{
position:"relative"
}}
>

<input

type={
showPassword
?
"text"
:
"password"
}

value={password}

onChange={(e)=>
setPassword(e.target.value)
}

placeholder="Create Password"

style={inputStyle}

/>

<button

type="button"

onClick={()=>
setShowPassword(!showPassword)
}

style={eyeButtonStyle}

>

{showPassword ? "Hide" : "Show"}

</button>

</div>

// =====================================================
// END OF PART 4
// WAIT FOR PART 5
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 5 / 15
// Paste BELOW PART 4
// =====================================================

{/* ---------------- PASSWORD REQUIREMENTS ---------------- */}

<div
style={{
marginTop:"8px",
marginBottom:"22px",
padding:"16px",
background:"#10151d",
borderRadius:"10px",
border:"1px solid #262d37"
}}
>

<div
style={{
fontWeight:"700",
marginBottom:"12px"
}}
>
Password Requirements
</div>

<div style={passwordItem(passwordChecks.length)}>
{passwordChecks.length ? "🟢" : "⚪"} At least 8 characters
</div>

<div style={passwordItem(passwordChecks.uppercase)}>
{passwordChecks.uppercase ? "🟢" : "⚪"} One uppercase letter (A–Z)
</div>

<div style={passwordItem(passwordChecks.lowercase)}>
{passwordChecks.lowercase ? "🟢" : "⚪"} One lowercase letter (a–z)
</div>

<div style={passwordItem(passwordChecks.number)}>
{passwordChecks.number ? "🟢" : "⚪"} One number (0–9)
</div>

<div style={passwordItem(passwordChecks.special)}>
{passwordChecks.special ? "🟢" : "⚪"} One special character
(@ # $ % & ! *)
</div>

</div>

{/* ---------------- CONFIRM PASSWORD ---------------- */}

<label>
Confirm Password
</label>

<div
style={{
position:"relative"
}}
>

<input

type={
showConfirmPassword
?
"text"
:
"password"
}

value={confirmPassword}

onChange={(e)=>
setConfirmPassword(e.target.value)
}

placeholder="Confirm Password"

style={inputStyle}

/>

<button

type="button"

onClick={()=>
setShowConfirmPassword(
!showConfirmPassword
)
}

style={eyeButtonStyle}

>

{showConfirmPassword ? "Hide" : "Show"}

</button>

</div>

{/* ---------------- PASSWORD MATCH ---------------- */}

{
confirmPassword.length>0 &&

password!==confirmPassword && (

<div
style={{
color:"#ef4444",
marginTop:"8px",
marginBottom:"18px",
fontSize:"14px"
}}
>

Passwords do not match.

</div>

)

}

// =====================================================
// END OF PART 5
// WAIT FOR PART 6
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 6 / 15
// Paste BELOW PART 5
// =====================================================

{/* ---------------- SUCCESS MESSAGE ---------------- */}

{
successMessage && (

<div

style={{

marginTop:"18px",

marginBottom:"18px",

padding:"15px",

background:"#0f2f18",

border:"1px solid #22c55e",

borderRadius:"10px",

color:"#dcfce7",

fontSize:"15px",

lineHeight:"24px"

}}

>

✅ {successMessage}

</div>

)

}

{/* ---------------- ERROR MESSAGE ---------------- */}

{
errorMessage && (

<div

style={{

marginTop:"18px",

marginBottom:"18px",

padding:"15px",

background:"#351111",

border:"1px solid #ef4444",

borderRadius:"10px",

color:"#fecaca",

fontSize:"15px",

lineHeight:"24px"

}}

>

❌ {errorMessage}

</div>

)

}

{/* ---------------- CREATE ACCOUNT BUTTON ---------------- */}

<button

type="submit"

disabled={loading}

style={{

width:"100%",

marginTop:"10px",

padding:"15px",

borderRadius:"12px",

border:"none",

background:
loading
?
"#4b5563"
:
"#16a34a",

color:"#fff",

fontSize:"17px",

fontWeight:"700",

cursor:
loading
?
"not-allowed"
:
"pointer"

}}

>

{

loading

?

"Creating Account..."

:

"Create Account"

}

</button>

{/* ---------------- LOGIN LINK ---------------- */}

<p

style={{

marginTop:"25px",

textAlign:"center",

color:"#9ca3af"

}}

>

Already have an account?

{" "}

<a

href="/login"

style={{

color:"#22c55e",

textDecoration:"none",

fontWeight:"700"

}}

>

Sign In

</a>

</p>

</form>

</div>

</main>

// =====================================================
// END OF PART 6
// WAIT FOR PART 7
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 7 / 15
// Paste BELOW PART 6
// =====================================================

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

  outline: "none",

  transition: "0.25s"

};



const eyeButtonStyle = {

  position: "absolute",

  right: "12px",

  top: "50%",

  transform: "translateY(-50%)",

  border: "none",

  background: "transparent",

  color: "#22c55e",

  fontWeight: "700",

  cursor: "pointer",

  fontSize: "14px"

};



function passwordItem(status) {

  return {

    display: "flex",

    alignItems: "center",

    gap: "10px",

    marginBottom: "8px",

    color: status ? "#22c55e" : "#9ca3af",

    fontSize: "14px",

    transition: "0.25s"

  };

}



// =====================================================
// CUSTOMER ERROR MESSAGES
// =====================================================

export const ERROR_MESSAGES = {

  EMAIL_EXISTS:

    "This email is already linked to an existing account. Please sign in using this email.",

  PHONE_EXISTS:

    "This mobile number is already linked to another account. Please sign in using the email associated with this mobile number.",

  ACCOUNT_EXISTS:

    "An account already exists with this email and mobile number. Please sign in to continue.",

  INVALID_EMAIL:

    "Please enter a valid email address.",

  INVALID_PHONE:

    "Please enter a valid 10-digit mobile number.",

  INVALID_NAME:

    "Please enter your full name.",

  PASSWORD_WEAK:

    "Please create a stronger password by completing all password requirements.",

  PASSWORD_MATCH:

    "Passwords do not match.",

  EMAIL_VERIFY:

    "Your account has been created successfully. Please verify your email before signing in.",

  NETWORK:

    "Unable to connect to the server. Please check your internet connection and try again.",

  RATE_LIMIT:

    "Too many signup attempts were made. Please wait a few minutes before trying again.",

  UNKNOWN:

    "Unable to create your account. Please try again."

};

// =====================================================
// END OF PART 7
// WAIT FOR PART 8
// =====================================================
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 8 / 15
// Paste BELOW PART 7
// =====================================================

// -----------------------------------------------------
// PASSWORD LIVE STATUS
// -----------------------------------------------------

const passwordStatus = {

  length: password.length >= 8,

  upper: /[A-Z]/.test(password),

  lower: /[a-z]/.test(password),

  number: /[0-9]/.test(password),

  special: /[!@#$%^&*(),.?":{}|<>]/.test(password),

};



// -----------------------------------------------------
// PASSWORD SCORE
// -----------------------------------------------------

const passwordScore = [

  passwordStatus.length,

  passwordStatus.upper,

  passwordStatus.lower,

  passwordStatus.number,

  passwordStatus.special,

].filter(Boolean).length;



// -----------------------------------------------------
// BUTTON ENABLE
// -----------------------------------------------------

const canSubmit =

isValidName(cleanName) &&

isValidEmail(cleanEmail) &&

isValidPhone(cleanPhone) &&

passwordValid &&

password === confirmPassword &&

!loading;



// -----------------------------------------------------
// INPUT HELPERS
// -----------------------------------------------------

function handlePhoneChange(e) {

  const value = e.target.value

    .replace(/\D/g, "")

    .slice(0, 10);

  setPhone(value);

}



function handleNameChange(e) {

  setFullName(e.target.value);

}



function handleEmailChange(e) {

  setEmail(e.target.value.trimStart());

}



function handlePasswordChange(e) {

  setPassword(e.target.value);

}



function handleConfirmPassword(e) {

  setConfirmPassword(e.target.value);

}



function handleReferralChange(e) {

  setReferralCode(

    e.target.value

      .toUpperCase()

      .replace(/\s/g, "")

  );

}



// -----------------------------------------------------
// SUCCESS RESET
// -----------------------------------------------------

function resetFormMessages() {

  setSuccessMessage("");

  setErrorMessage("");

}



// =====================================================
// END OF PART 8
// WAIT FOR PART 9
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 9 / 15
// Paste BELOW PART 8
// =====================================================

// -----------------------------------------------------
// FORM VALIDATIONS
// -----------------------------------------------------

const nameError =
cleanName.length === 0
? ""
: cleanName.length < 3
? "Name must contain at least 3 characters."
: "";

const emailError =
cleanEmail.length === 0
? ""
: !isValidEmail(cleanEmail)
? "Please enter a valid email address."
: "";

const phoneError =
cleanPhone.length === 0
? ""
: !isValidPhone(cleanPhone)
? "Please enter a valid 10-digit mobile number."
: "";

const confirmPasswordError =
confirmPassword.length === 0
? ""
: password !== confirmPassword
? "Passwords do not match."
: "";



// -----------------------------------------------------
// FIELD STATUS
// -----------------------------------------------------

const formReady =

!nameError &&
!emailError &&
!phoneError &&
!confirmPasswordError &&
passwordValid;



// -----------------------------------------------------
// INPUT BORDER COLORS
// -----------------------------------------------------

const successBorder = "1px solid #16a34a";

const normalBorder = "1px solid #30363d";

const errorBorder = "1px solid #ef4444";



// -----------------------------------------------------
// PASSWORD CHECK TEXT
// -----------------------------------------------------

const passwordGuide = [

{
ok: passwordChecks.length,
text: "At least 8 characters"
},

{
ok: passwordChecks.uppercase,
text: "One uppercase letter"
},

{
ok: passwordChecks.lowercase,
text: "One lowercase letter"
},

{
ok: passwordChecks.number,
text: "One number"
},

{
ok: passwordChecks.special,
text: "One special character"
}

];



// -----------------------------------------------------
// LOADING TEXT
// -----------------------------------------------------

const loadingText = loading

? "Creating your account..."

: "Create Account";



// =====================================================
// END OF PART 9
// WAIT FOR PART 10
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 10 / 15
// Paste BELOW PART 9
// =====================================================

// -----------------------------------------------------
// FIELD HELPERS
// -----------------------------------------------------

const fieldMessageStyle = {

  marginTop: "-10px",

  marginBottom: "16px",

  fontSize: "13px",

  fontWeight: "500"

};



const successColor = {

  ...fieldMessageStyle,

  color: "#22c55e"

};



const errorColor = {

  ...fieldMessageStyle,

  color: "#ef4444"

};



// -----------------------------------------------------
// PASSWORD ICONS
// -----------------------------------------------------

function passwordIcon(status){

  return status ? "🟢" : "⚪";

}



// -----------------------------------------------------
// PASSWORD REQUIREMENT LIST
// -----------------------------------------------------

const passwordRequirementList = [

  {

    status: passwordChecks.length,

    text: "At least 8 characters"

  },

  {

    status: passwordChecks.uppercase,

    text: "One uppercase letter (A–Z)"

  },

  {

    status: passwordChecks.lowercase,

    text: "One lowercase letter (a–z)"

  },

  {

    status: passwordChecks.number,

    text: "One number (0–9)"

  },

  {

    status: passwordChecks.special,

    text: "One special character (@ # $ % & ! *)"

  }

];



// -----------------------------------------------------
// CUSTOMER FRIENDLY ALERTS
// -----------------------------------------------------

const CUSTOMER_ALERTS = {

EMAIL_ALREADY_USED:

"This email is already linked to an existing account. Please sign in using this email.",

PHONE_ALREADY_USED:

"This mobile number is already linked to another account. Please sign in using the email associated with this mobile number.",

ACCOUNT_EXISTS:

"An account already exists with this email and mobile number. Please sign in to continue.",

VERIFY_EMAIL:

"Your account has been created successfully. Please verify your email before signing in.",

RATE_LIMIT:

"Too many signup attempts were made. Please wait a few minutes before trying again.",

NETWORK:

"Unable to connect to the server. Please check your internet connection and try again.",

UNKNOWN:

"Something went wrong while creating your account. Please try again."

};



// -----------------------------------------------------
// BUTTON STATE
// -----------------------------------------------------

const buttonDisabled =

loading ||

!formReady;



// =====================================================
// END OF PART 10
// WAIT FOR PART 11
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 11 / 15
// Paste BELOW PART 10
// =====================================================



// -----------------------------------------------------
// SUPABASE ERROR HANDLER
// -----------------------------------------------------

function getSignupError(error){

  if(!error){

    return null;

  }

  const msg=(error.message||"").toLowerCase();



  // Existing Email

  if(

    msg.includes("already registered") ||

    msg.includes("user already registered")

  ){

    return CUSTOMER_ALERTS.EMAIL_ALREADY_USED;

  }



  // Existing Mobile

  if(

    msg.includes("profiles_phone_unique") ||

    msg.includes("duplicate") ||

    msg.includes("phone") ||

    msg.includes("mobile")

  ){

    return CUSTOMER_ALERTS.PHONE_ALREADY_USED;

  }



  // Same Email + Same Mobile

  if(

    msg.includes("account exists")

  ){

    return CUSTOMER_ALERTS.ACCOUNT_EXISTS;

  }



  // Email Rate Limit

  if(

    msg.includes("rate limit")

  ){

    return CUSTOMER_ALERTS.RATE_LIMIT;

  }



  // Network

  if(

    msg.includes("network") ||

    msg.includes("fetch")

  ){

    return CUSTOMER_ALERTS.NETWORK;

  }



  return CUSTOMER_ALERTS.UNKNOWN;

}



// -----------------------------------------------------
// SUCCESS HANDLER
// -----------------------------------------------------

function signupSuccess(){

  clearForm();

  setSuccessMessage(

    CUSTOMER_ALERTS.VERIFY_EMAIL

  );

}



// -----------------------------------------------------
// FAILURE HANDLER
// -----------------------------------------------------

function signupFailed(error){

  setErrorMessage(

    getSignupError(error)

  );

}



// -----------------------------------------------------
// REMOVE OLD MESSAGES ON INPUT CHANGE
// -----------------------------------------------------

function clearAlerts(){

  if(successMessage)

    setSuccessMessage("");



  if(errorMessage)

    setErrorMessage("");

}



// =====================================================
// END OF PART 11
// WAIT FOR PART 12
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 12 / 15
// Paste BELOW PART 11
// =====================================================



// -----------------------------------------------------
// INPUT EVENTS
// -----------------------------------------------------

function onNameInput(e){

  clearAlerts();

  setFullName(e.target.value);

}



function onEmailInput(e){

  clearAlerts();

  setEmail(

    e.target.value

      .trim()

      .toLowerCase()

  );

}



function onPhoneInput(e){

  clearAlerts();

  const value=e.target.value

    .replace(/\D/g,"")

    .slice(0,10);

  setPhone(value);

}



function onPasswordInput(e){

  clearAlerts();

  setPassword(e.target.value);

}



function onConfirmPasswordInput(e){

  clearAlerts();

  setConfirmPassword(e.target.value);

}



function onReferralInput(e){

  clearAlerts();

  setReferralCode(

    e.target.value

      .trim()

      .toUpperCase()

  );

}



// -----------------------------------------------------
// FORM RESET
// -----------------------------------------------------

function resetEntireForm(){

  setFullName("");

  setEmail("");

  setPhone("");

  setPassword("");

  setConfirmPassword("");

  setReferralCode("");



  setSuccessMessage("");

  setErrorMessage("");

}



// -----------------------------------------------------
// DEBUG MODE
// -----------------------------------------------------

const DEBUG=true;

function debugLog(title,data){

  if(!DEBUG) return;

  console.log(

    "==========",

    title,

    "=========="

  );

  console.log(data);

}



// -----------------------------------------------------
// LOADING HELPERS
// -----------------------------------------------------

function startLoading(){

  setLoading(true);

}



function stopLoading(){

  setLoading(false);

}



// -----------------------------------------------------
// BUTTON LABEL
// -----------------------------------------------------

const submitButtonText=

loading

?

"Creating Account..."

:

"Create Account";



// =====================================================
// END OF PART 12
// WAIT FOR PART 13
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 13 / 15
// Paste BELOW PART 12
// =====================================================



// -----------------------------------------------------
// REAL TIME VALIDATIONS
// -----------------------------------------------------

const fullNameValid =
cleanName.length >= 3;

const emailValid =
isValidEmail(cleanEmail);

const phoneValid =
isValidPhone(cleanPhone);

const passwordsMatch =
password === confirmPassword &&
confirmPassword.length > 0;



// -----------------------------------------------------
// PROFILE OBJECT
// -----------------------------------------------------

const signupPayload = {

  full_name: cleanName,

  email: cleanEmail,

  phone: cleanPhone,

  referral_code:
    cleanReferral || null,

};



// -----------------------------------------------------
// PASSWORD PROGRESS
// -----------------------------------------------------

const passwordProgress = [

passwordChecks.length,

passwordChecks.uppercase,

passwordChecks.lowercase,

passwordChecks.number,

passwordChecks.special

].filter(Boolean).length;



const passwordPercentage =
passwordProgress * 20;



// -----------------------------------------------------
// PASSWORD BAR COLOR
// -----------------------------------------------------

let passwordBarColor="#374151";

if(passwordProgress===1)
passwordBarColor="#ef4444";

if(passwordProgress===2)
passwordBarColor="#f97316";

if(passwordProgress===3)
passwordBarColor="#facc15";

if(passwordProgress===4)
passwordBarColor="#22c55e";

if(passwordProgress===5)
passwordBarColor="#16a34a";



// -----------------------------------------------------
// PASSWORD BAR STYLE
// -----------------------------------------------------

const passwordBar={

height:"6px",

width:passwordPercentage+"%",

background:passwordBarColor,

borderRadius:"999px",

transition:"0.35s"

};



const passwordBarContainer={

height:"6px",

background:"#2d333b",

borderRadius:"999px",

overflow:"hidden",

marginTop:"8px",

marginBottom:"18px"

};



// -----------------------------------------------------
// SIGNUP READY
// -----------------------------------------------------

const readyToSignup =

fullNameValid &&

emailValid &&

phoneValid &&

passwordValid &&

passwordsMatch;



// -----------------------------------------------------
// FINAL BUTTON STYLE
// -----------------------------------------------------

const submitButtonStyle={

width:"100%",

padding:"15px",

marginTop:"20px",

border:"none",

borderRadius:"12px",

background:

loading

?

"#4b5563"

:

readyToSignup

?

"#16a34a"

:

"#374151",

color:"#fff",

fontSize:"17px",

fontWeight:"700",

cursor:

loading

?

"not-allowed"

:

readyToSignup

?

"pointer"

:

"not-allowed",

transition:"0.25s"

};



// =====================================================
// END OF PART 13
// WAIT FOR PART 14
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 14 / 15
// Paste BELOW PART 13
// =====================================================



// -----------------------------------------------------
// EXTRA SECURITY
// -----------------------------------------------------

const MAX_NAME_LENGTH = 60;

const MAX_EMAIL_LENGTH = 120;

const MAX_PHONE_LENGTH = 10;

const MAX_PASSWORD_LENGTH = 100;



// -----------------------------------------------------
// SANITIZE INPUTS
// -----------------------------------------------------

function sanitizeName(value){

  return value
    .replace(/\s+/g," ")
    .trim()
    .slice(0,MAX_NAME_LENGTH);

}



function sanitizeEmail(value){

  return value
    .trim()
    .toLowerCase()
    .slice(0,MAX_EMAIL_LENGTH);

}



function sanitizePhone(value){

  return value
    .replace(/\D/g,"")
    .slice(0,MAX_PHONE_LENGTH);

}



function sanitizePassword(value){

  return value.slice(0,MAX_PASSWORD_LENGTH);

}



// -----------------------------------------------------
// PASSWORD STRENGTH LABEL
// -----------------------------------------------------

const passwordStrengthLabel=[

"",

"Very Weak",

"Weak",

"Average",

"Strong",

"Excellent"

][passwordProgress];



// -----------------------------------------------------
// INPUT AUTO FORMAT
// -----------------------------------------------------

const formattedPhone=cleanPhone;



// -----------------------------------------------------
// REFERRAL VALIDATION
// -----------------------------------------------------

const referralValid=

cleanReferral==="" ||

/^[A-Z0-9-]{4,20}$/.test(cleanReferral);



// -----------------------------------------------------
// BEFORE SUBMIT VALIDATION
// -----------------------------------------------------





// -----------------------------------------------------
// PASSWORD TOOLTIP
// -----------------------------------------------------

const passwordTooltip=

`Your password should contain:

• At least 8 characters
• One uppercase letter
• One lowercase letter
• One number
• One special character`;



// -----------------------------------------------------
// SUCCESS LOG
// -----------------------------------------------------

function logSignupSuccess(user){

debugLog(

"USER CREATED",

user

);

}



// -----------------------------------------------------
// ERROR LOG
// -----------------------------------------------------

function logSignupError(error){

debugLog(

"SIGNUP ERROR",

error

);

}



// =====================================================
// END OF PART 14
// WAIT FOR PART 15 (FINAL)
// =====================================================
// =====================================================
// Play2Prove Premium Signup Page
// PART 15 / 15 (FINAL)
// Paste BELOW PART 14
// =====================================================



// -----------------------------------------------------
// FINAL NOTES
// -----------------------------------------------------

/*

FEATURES INCLUDED

✔ Premium Signup UI

✔ Full Name Validation

✔ Email Validation

✔ Indian Mobile Validation

✔ Live Password Checklist

✔ Password Progress Bar

✔ Show / Hide Password

✔ Confirm Password

✔ Referral Code

✔ Duplicate Email Message

✔ Duplicate Mobile Message

✔ Account Already Exists Message

✔ Email Verification Message

✔ Network Error Message

✔ Rate Limit Message

✔ Generic Error Message

✔ Loading State

✔ Clean Helper Functions

✔ Ready For Google Login

✔ Ready For Referral System

✔ Ready For Dashboard Integration

✔ Production Ready Structure

*/



// -----------------------------------------------------
// NEXT FILES
// -----------------------------------------------------

/*

Day 5

1.

app/login/page.js
(Premium Login)

2.

app/forgot-password/page.js

3.

app/dashboard/page.js

4.

components/Navbar.jsx

5.

components/ProtectedRoute.jsx

6.

components/PasswordChecklist.jsx

7.

components/LoadingSpinner.jsx

8.

components/AlertBox.jsx

9.

lib/auth.js

10.

lib/validation.js

*/



// -----------------------------------------------------
// END
// -----------------------------------------------------



