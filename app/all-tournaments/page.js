"use client";

import { useEffect } from "react";

export default function AllTournamentsPage() {

  useEffect(() => {

    window.location.replace(
      "/tournaments?all=true"
    );

  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#05050a",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            marginBottom: "12px",
          }}
        >
          ✦
        </div>

        <strong>
          OPENING ALL TOURNAMENTS...
        </strong>
      </div>
    </main>
  );
}
