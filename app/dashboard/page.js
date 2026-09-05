// app/dashboard/page.js

"use client";

import { useEffect } from "react";

export default function DashboardPage() {
  useEffect(() => {
    window.location.replace("/profile");
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#05070a",
        color: "#fff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      Opening Player Center...
    </main>
  );
}
