"use client";

import { useEffect } from "react";

export default function VerifyEmailPage() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#05070a",color:"#fff",fontFamily:"Arial,sans-serif"}}>Taking you to login...</main>;
}
