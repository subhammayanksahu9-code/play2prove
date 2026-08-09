"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

async function loadProfile() {
  setLoading(true);
  setError("");
  setMessage("");

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (!session?.user) {
      window.location.replace("/login");
      return;
    }

    const currentUser = session.user;

    setUser(currentUser);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    setProfile(profileData);

    setFullName(
      profileData?.full_name ||
        currentUser.user_metadata?.full_name ||
        ""
    );

    setUsername(
      profileData?.username ||
        currentUser.user_metadata?.username ||
        ""
    );

    setPhone(
      profileData?.phone ||
        currentUser.user_metadata?.phone ||
        ""
    );
  } catch (err) {
    console.error("Profile loading error:", err);

    setError(
      err?.message ||
        "Unable to load your profile. Please try again."
    );
  } finally {
    setLoading(false);
  }
}

  async function saveProfile() {
    if (!user) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      /*
       * We first check which columns actually exist in the
       * returned profile row. This prevents unnecessary
       * database errors if a particular optional column
       * does not exist in your current profiles table.
       */

      const updateData = {};

      if (!profile || Object.prototype.hasOwnProperty.call(profile, "full_name")) {
        updateData.full_name = fullName.trim();
      }

      if (!profile || Object.prototype.hasOwnProperty.call(profile, "username")) {
        updateData.username = username.trim();
      }

      if (!profile || Object.prototype.hasOwnProperty.call(profile, "phone")) {
        updateData.phone = phone.trim();
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id)
        .select("*")
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(updatedProfile);
      setEditMode(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);

      setError(
        err?.message ||
          "Unable to logout. Please try again."
      );

      setLoggingOut(false);
    }
  }

  function goTo(path) {
    window.location.href = path;
  }

  function getDisplayName() {
    return (
      fullName ||
      username ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Player"
    );
  }

  function getPlayerId() {
    return (
      profile?.player_id ||
      profile?.playerid ||
      profile?.player_id_number ||
      "Not assigned"
    );
  }

  function getCreatedDate() {
    const date =
      profile?.created_at ||
      user?.created_at;

    if (!date) return "—";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <h2>Loading Profile...</h2>
          <p>Please wait while we load your player account.</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main style={styles.page}>
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <header style={styles.topbar}>
        <button
          onClick={() => goTo("/")}
          style={styles.backButton}
        >
          ← Home
        </button>

        <div style={styles.logo}>
          <div style={styles.logoBox}>P2P</div>

          <div>
            <div style={styles.logoTitle}>Play2Prove</div>
            <div style={styles.logoSubtitle}>
              PLAY • COMPETE • EARN • PROVE
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={styles.logoutTop}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </header>

      <div style={styles.container}>
        <section style={styles.profileHero}>
          <div style={styles.avatar}>
            {getDisplayName().charAt(0).toUpperCase()}
          </div>

          <div style={styles.heroInfo}>
            <span style={styles.playerBadge}>
              ● PLAYER ACCOUNT
            </span>

            <h1 style={styles.profileName}>
              {getDisplayName()}
            </h1>

            <p style={styles.email}>
              {user.email}
            </p>

            <div style={styles.playerIdBadge}>
              PLAYER ID: {getPlayerId()}
            </div>
          </div>

          <button
            onClick={() => {
              setEditMode(!editMode);
              setError("");
              setMessage("");
            }}
            style={styles.editButton}
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </section>

        {error && (
          <div style={styles.errorBox}>
            <strong>✕</strong>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={styles.successBox}>
            <strong>✓</strong>
            <span>{message}</span>
          </div>
        )}

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>PLAYER ID</span>
            <strong style={styles.statValue}>
              {getPlayerId()}
            </strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statLabel}>ACCOUNT</span>
            <strong style={styles.statValue}>
              Active
            </strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statLabel}>MEMBER SINCE</span>
            <strong style={styles.statValue}>
              {getCreatedDate()}
            </strong>
          </div>
        </section>

        <section style={styles.contentGrid}>
          <div style={styles.mainCard}>
            <div style={styles.cardHeader}>
              <div>
                <span style={styles.eyebrow}>ACCOUNT INFORMATION</span>
                <h2 style={styles.cardTitle}>Player Profile</h2>
              </div>

              {!editMode && (
                <span style={styles.secureBadge}>
                  🔒 SECURE
                </span>
              )}
            </div>

            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Full Name
                </label>

                {editMode ? (
                  <input
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.valueBox}>
                    {fullName || "Not provided"}
                  </div>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Username
                </label>

                {editMode ? (
                  <input
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    placeholder="Enter username"
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.valueBox}>
                    {username || "Not provided"}
                  </div>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Email Address
                </label>

                <div style={styles.valueBox}>
                  {user.email || "Not available"}
                </div>

                <small style={styles.helper}>
                  Email is managed securely through your
                  authentication account.
                </small>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Mobile Number
                </label>

                {editMode ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="Enter mobile number"
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.valueBox}>
                    {phone || "Not provided"}
                  </div>
                )}
              </div>
            </div>

            {editMode && (
              <div style={styles.saveRow}>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  style={styles.saveButton}
                >
                  {saving
                    ? "Saving..."
                    : "Save Profile"}
                </button>
              </div>
            )}
          </div>

          <aside style={styles.sideColumn}>
            <div style={styles.quickCard}>
              <span style={styles.eyebrow}>
                PLAYER CENTER
              </span>

              <h3 style={styles.quickTitle}>
                Manage Account
              </h3>

              <button
                onClick={() => goTo("/dashboard")}
                style={styles.quickButton}
              >
                <span>▣</span>
                Dashboard
                <span>→</span>
              </button>

              <button
                onClick={() => goTo("/tournaments")}
                style={styles.quickButton}
              >
                <span>♛</span>
                Tournaments
                <span>→</span>
              </button>

              <button
                onClick={() => goTo("/matches")}
                style={styles.quickButton}
              >
                <span>⚔</span>
                My Matches
                <span>→</span>
              </button>

              <button
                onClick={() => goTo("/wallet")}
                style={styles.quickButton}
              >
                <span>▣</span>
                Wallet
                <span>→</span>
              </button>
            </div>

            <div style={styles.securityCard}>
              <div style={styles.securityIcon}>🔐</div>

              <div>
                <h3 style={styles.securityTitle}>
                  Account Security
                </h3>

                <p style={styles.securityText}>
                  Keep your account details secure.
                  Never share your password or OTP with
                  anyone.
                </p>

                <button
                  onClick={() =>
                    goTo("/reset-password")
                  }
                  style={styles.passwordButton}
                >
                  Change Password →
                </button>
              </div>
            </div>

            <div style={styles.logoutCard}>
              <h3 style={styles.logoutTitle}>
                Sign out
              </h3>

              <p style={styles.logoutText}>
                Sign out from your Play2Prove player
                account on this device.
              </p>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={styles.logoutButton}
              >
                {loggingOut
                  ? "Signing out..."
                  : "Logout Account"}
              </button>
            </div>
          </aside>
        </section>

        <section style={styles.bottomSection}>
          <div>
            <span style={styles.eyebrow}>
              PLAY2PROVE
            </span>

            <h2 style={styles.bottomTitle}>
              Your Player Account
            </h2>

            <p style={styles.bottomText}>
              Your tournaments, matches, wallet and
              player information will be connected here
              as the platform grows.
            </p>
          </div>

          <button
            onClick={() => goTo("/")}
            style={styles.homeButton}
          >
            Back to Home →
          </button>
        </section>
      </div>

      <nav style={styles.bottomNav}>
        <button
          onClick={() => goTo("/")}
          style={styles.navButton}
        >
          <span>⌂</span>
          HOME
        </button>

        <button
          onClick={() => goTo("/tournaments")}
          style={styles.navButton}
        >
          <span>♛</span>
          TOURNAMENTS
        </button>

        <button
          onClick={() => goTo("/matches")}
          style={styles.navButton}
        >
          <span>⚔</span>
          MATCHES
        </button>

        <button
          onClick={() => goTo("/wallet")}
          style={styles.navButton}
        >
          <span>▣</span>
          WALLET
        </button>

        <button
          style={{
            ...styles.navButton,
            ...styles.navActive,
          }}
        >
          <span>○</span>
          PROFILE
        </button>
      </nav>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#05070a",
    color: "#ffffff",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    paddingBottom: "100px",
    position: "relative",
    overflow: "hidden",
  },

  backgroundGlowOne: {
    position: "fixed",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "rgba(255, 90, 0, 0.08)",
    filter: "blur(120px)",
    top: "50px",
    left: "-200px",
    pointerEvents: "none",
  },

  backgroundGlowTwo: {
    position: "fixed",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "rgba(80, 50, 255, 0.07)",
    filter: "blur(120px)",
    bottom: "100px",
    right: "-200px",
    pointerEvents: "none",
  },

  topbar: {
    height: "72px",
    borderBottom: "1px solid #20252d",
    background:
      "rgba(5, 7, 10, 0.94)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(12px)",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logoBox: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    background:
      "linear-gradient(135deg, #ff5a00, #ff7a00)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "12px",
  },

  logoTitle: {
    fontSize: "17px",
    fontWeight: "800",
  },

  logoSubtitle: {
    fontSize: "8px",
    color: "#6b7280",
    letterSpacing: "1px",
    marginTop: "2px",
  },

  backButton: {
    background: "transparent",
    color: "#c7ccd4",
    border: "1px solid #30363d",
    borderRadius: "8px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: "600",
  },

  logoutTop: {
    background: "transparent",
    color: "#ff6b35",
    border: "1px solid #71351f",
    borderRadius: "8px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: "700",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "35px 20px",
    position: "relative",
    zIndex: 2,
  },

  profileHero: {
    background:
      "linear-gradient(135deg, #11161d, #0a0d12)",
    border: "1px solid #252b34",
    borderRadius: "18px",
    padding: "30px",
    display: "flex",
    alignItems: "center",
    gap: "22px",
    marginBottom: "20px",
  },

  avatar: {
    width: "88px",
    height: "88px",
    minWidth: "88px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #ff5a00, #ff7a00)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "900",
    boxShadow:
      "0 0 35px rgba(255, 90, 0, 0.2)",
  },

  heroInfo: {
    flex: 1,
  },

  playerBadge: {
    color: "#22c55e",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  profileName: {
    fontSize: "32px",
    margin: "7px 0 5px",
  },

  email: {
    color: "#8f98a5",
    margin: "0 0 12px",
  },

  playerIdBadge: {
    display: "inline-block",
    background: "#080b0f",
    border: "1px solid #30363d",
    color: "#cbd5e1",
    borderRadius: "7px",
    padding: "7px 10px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },

  editButton: {
    background: "#ff5a00",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "12px 18px",
    fontWeight: "800",
    cursor: "pointer",
  },

  errorBox: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    background: "#3b0b0b",
    border: "1px solid #ef4444",
    color: "#fecaca",
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  successBox: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    background: "#052e16",
    border: "1px solid #22c55e",
    color: "#bbf7d0",
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },

  statCard: {
    background: "#0b0f14",
    border: "1px solid #252b34",
    borderRadius: "12px",
    padding: "18px",
  },

  statLabel: {
    display: "block",
    color: "#687180",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.2px",
    marginBottom: "8px",
  },

  statValue: {
    fontSize: "16px",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.6fr) minmax(280px, 0.8fr)",
    gap: "20px",
    alignItems: "start",
  },

  mainCard: {
    background: "#0b0f14",
    border: "1px solid #252b34",
    borderRadius: "16px",
    padding: "25px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "25px",
  },

  eyebrow: {
    color: "#ff5a00",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "1.5px",
  },

  cardTitle: {
    margin: "5px 0 0",
    fontSize: "23px",
  },

  secureBadge: {
    color: "#22c55e",
    fontSize: "9px",
    fontWeight: "800",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    color: "#9ca3af",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "8px",
  },

  valueBox: {
    minHeight: "46px",
    boxSizing: "border-box",
    background: "#07090c",
    border: "1px solid #252b34",
    borderRadius: "9px",
    padding: "13px",
    display: "flex",
    alignItems: "center",
    color: "#e5e7eb",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    minHeight: "46px",
    boxSizing: "border-box",
    background: "#07090c",
    border: "1px solid #3a424d",
    borderRadius: "9px",
    padding: "13px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },

  helper: {
    color: "#667080",
    fontSize: "10px",
    marginTop: "6px",
    lineHeight: "1.5",
  },

  saveRow: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "flex-end",
  },

  saveButton: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "12px 22px",
    fontWeight: "800",
    cursor: "pointer",
  },

  sideColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  quickCard: {
    background: "#0b0f14",
    border: "1px solid #252b34",
    borderRadius: "16px",
    padding: "20px",
  },

  quickTitle: {
    margin: "5px 0 16px",
    fontSize: "19px",
  },

  quickButton: {
    width: "100%",
    display: "grid",
    gridTemplateColumns:
      "25px 1fr 20px",
    alignItems: "center",
    textAlign: "left",
    background: "#080b0f",
    color: "#d8dde5",
    border: "1px solid #242a32",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  securityCard: {
    background:
      "linear-gradient(135deg, #0b1510, #0b0f14)",
    border: "1px solid #21462d",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    gap: "13px",
  },

  securityIcon: {
    fontSize: "22px",
  },

  securityTitle: {
    margin: "0 0 7px",
    fontSize: "16px",
  },

  securityText: {
    color: "#8f9a94",
    fontSize: "11px",
    lineHeight: "1.6",
    margin: "0 0 12px",
  },

  passwordButton: {
    background: "transparent",
    border: "none",
    color: "#22c55e",
    padding: 0,
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "11px",
  },

  logoutCard: {
    background: "#100b0b",
    border: "1px solid #3a2020",
    borderRadius: "16px",
    padding: "20px",
  },

  logoutTitle: {
    margin: "0 0 7px",
    fontSize: "16px",
  },

  logoutText: {
    color: "#8f8585",
    fontSize: "11px",
    lineHeight: "1.5",
    margin: "0 0 14px",
  },

  logoutButton: {
    width: "100%",
    background: "#250c0c",
    color: "#f87171",
    border: "1px solid #662020",
    borderRadius: "8px",
    padding: "11px",
    cursor: "pointer",
    fontWeight: "800",
  },

  bottomSection: {
    marginTop: "20px",
    background:
      "linear-gradient(135deg, #11151c, #0b0e13)",
    border: "1px solid #252b34",
    borderRadius: "16px",
    padding: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  bottomTitle: {
    margin: "5px 0",
    fontSize: "24px",
  },

  bottomText: {
    color: "#8b94a1",
    maxWidth: "650px",
    fontSize: "13px",
    lineHeight: "1.6",
    margin: 0,
  },

  homeButton: {
    background: "#ff5a00",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "12px 18px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  bottomNav: {
    position: "fixed",
    bottom: "14px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(560px, calc(100% - 30px))",
    background: "rgba(10, 13, 18, 0.96)",
    border: "1px solid #30363d",
    borderRadius: "14px",
    padding: "7px",
    display: "grid",
    gridTemplateColumns:
      "repeat(5, 1fr)",
    gap: "4px",
    zIndex: 50,
    backdropFilter: "blur(14px)",
  },

  navButton: {
    background: "transparent",
    border: "none",
    color: "#69717e",
    padding: "8px 4px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "8px",
    fontWeight: "800",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },

  navActive: {
    color: "#ff5a00",
    background: "#1a1110",
  },

  loadingCard: {
    width: "min(430px, calc(100% - 40px))",
    margin: "20vh auto",
    background: "#0b0f14",
    border: "1px solid #252b34",
    borderRadius: "16px",
    padding: "35px",
    textAlign: "center",
  },

  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #30363d",
    borderTop: "3px solid #ff5a00",
    borderRadius: "50%",
    margin: "0 auto 18px",
    animation: "spin 1s linear infinite",
  },
};
