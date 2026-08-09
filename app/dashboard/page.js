"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Dashboard session error:", error);
          window.location.replace("/login");
          return;
        }

        if (!session?.user) {
          window.location.replace("/login");
          return;
        }

        setUser(session.user);
      } catch (error) {
        console.error("Dashboard loading error:", error);
        window.location.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    checkUser();
  }, []);

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.replace("/login");
    }
  }

  if (loading) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loaderCard}>
          <div style={styles.logoSmall}>P2P</div>
          <h2 style={styles.loadingTitle}>Loading Dashboard</h2>
          <p style={styles.loadingText}>
            Preparing your player account...
          </p>
          <div style={styles.loadingBar}>
            <div style={styles.loadingBarFill}></div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Player";

  const email = user?.email || "No email available";

  const playerId =
    user?.user_metadata?.player_id ||
    `P2P-${user.id.slice(0, 8).toUpperCase()}`;

  const firstName = fullName.split(" ")[0];

  return (
    <main style={styles.page}>
      {/* =========================================================
          TOP NAVIGATION
      ========================================================= */}
      <header style={styles.topbar}>
        <div style={styles.brand} onClick={() => goHome()}>
          <div style={styles.brandLogo}>P2P</div>

          <div>
            <div style={styles.brandName}>Play2Prove</div>
            <div style={styles.brandTagline}>
              PLAY • COMPETE • EARN • PROVE
            </div>
          </div>
        </div>

        <div style={styles.topActions}>
          <button
            type="button"
            style={styles.homeButton}
            onClick={() => goHome()}
          >
            🏠 Home
          </button>

          <button
            type="button"
            style={styles.profileButton}
            onClick={() => goProfile()}
          >
            <span style={styles.profileAvatar}>
              {firstName.charAt(0).toUpperCase()}
            </span>

            <span style={styles.profileName}>
              {firstName}
            </span>
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN LAYOUT
      ========================================================= */}
      <div style={styles.layout}>

        {/* =======================================================
            SIDEBAR
        ======================================================= */}
        <aside style={styles.sidebar}>

          <div style={styles.sidebarPlayer}>
            <div style={styles.largeAvatar}>
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div style={styles.sidebarPlayerName}>
              {fullName}
            </div>

            <div style={styles.sidebarPlayerId}>
              {playerId}
            </div>
          </div>

          <nav style={styles.navigation}>

            <button
              type="button"
              style={styles.navItemActive}
              onClick={() => window.location.reload()}
            >
              <span>⌂</span>
              Dashboard
            </button>

            <button
              type="button"
              style={styles.navItem}
              onClick={() => goTournaments()}
            >
              <span>🏆</span>
              Tournaments
            </button>

            <button
              type="button"
              style={styles.navItem}
              onClick={() => goMatches()}
            >
              <span>⚔</span>
              My Matches
            </button>

            <button
              type="button"
              style={styles.navItem}
              onClick={() => goWallet()}
            >
              <span>💰</span>
              Wallet
            </button>

            <button
              type="button"
              style={styles.navItem}
              onClick={() => goProfile()}
            >
              <span>👤</span>
              Profile
            </button>

          </nav>

          <div style={styles.sidebarBottom}>
            <button
              type="button"
              style={styles.logoutSidebar}
              onClick={logout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out..." : "↪ Logout"}
            </button>
          </div>
        </aside>

        {/* =======================================================
            DASHBOARD CONTENT
        ======================================================= */}
        <section style={styles.content}>

          {/* =====================================================
              WELCOME HEADER
          ===================================================== */}
          <section style={styles.welcomeSection}>

            <div>
              <div style={styles.eyebrow}>
                PLAYER DASHBOARD
              </div>

              <h1 style={styles.welcomeTitle}>
                Welcome back,{" "}
                <span style={styles.orangeText}>
                  {firstName}
                </span>
              </h1>

              <p style={styles.welcomeText}>
                Track your tournaments, matches, winnings and
                player activity from one place.
              </p>
            </div>

            <div style={styles.accountStatus}>
              <div style={styles.statusDot}></div>

              <div>
                <div style={styles.statusTitle}>
                  Account Active
                </div>

                <div style={styles.statusText}>
                  Player account verified
                </div>
              </div>
            </div>

          </section>

          {/* =====================================================
              ACCOUNT CARD
          ===================================================== */}
          <section style={styles.accountCard}>

            <div style={styles.accountCardHeader}>
              <div>
                <div style={styles.sectionLabel}>
                  PLAYER ACCOUNT
                </div>

                <h2 style={styles.accountTitle}>
                  {fullName}
                </h2>
              </div>

              <button
                type="button"
                style={styles.outlineButton}
                onClick={() => goProfile()}
              >
                Edit Profile
              </button>
            </div>

            <div style={styles.accountGrid}>

              <div style={styles.accountItem}>
                <span style={styles.accountItemLabel}>
                  Player ID
                </span>

                <strong style={styles.accountItemValue}>
                  {playerId}
                </strong>
              </div>

              <div style={styles.accountItem}>
                <span style={styles.accountItemLabel}>
                  Email
                </span>

                <strong style={styles.accountItemValue}>
                  {email}
                </strong>
              </div>

              <div style={styles.accountItem}>
                <span style={styles.accountItemLabel}>
                  Account Status
                </span>

                <strong style={styles.activeValue}>
                  ● Active
                </strong>
              </div>

            </div>
          </section>

          {/* =====================================================
              STATISTICS
          ===================================================== */}
          <section>

            <div style={styles.sectionHeader}>
              <div>
                <div style={styles.sectionLabel}>
                  YOUR ACTIVITY
                </div>

                <h2 style={styles.sectionTitle}>
                  Player Overview
                </h2>
              </div>
            </div>

            <div style={styles.statsGrid}>

              <DashboardStat
                icon="🏆"
                title="Tournaments"
                value="0"
                subtitle="Joined"
                onClick={goTournaments}
              />

              <DashboardStat
                icon="⚔"
                title="Matches"
                value="0"
                subtitle="Played"
                onClick={goMatches}
              />

              <DashboardStat
                icon="💰"
                title="Wallet"
                value="₹0"
                subtitle="Available balance"
                onClick={goWallet}
              />

              <DashboardStat
                icon="🥇"
                title="Wins"
                value="0"
                subtitle="Victories"
                onClick={goMatches}
              />

            </div>
          </section>

          {/* =====================================================
              QUICK ACTIONS
          ===================================================== */}
          <section style={styles.quickSection}>

            <div style={styles.sectionHeader}>
              <div>
                <div style={styles.sectionLabel}>
                  QUICK ACTIONS
                </div>

                <h2 style={styles.sectionTitle}>
                  What do you want to do?
                </h2>
              </div>
            </div>

            <div style={styles.actionGrid}>

              <ActionCard
                icon="🏆"
                title="Find Tournaments"
                description="Explore available tournaments and join a game."
                button="Browse Tournaments"
                onClick={goTournaments}
              />

              <ActionCard
                icon="⚔"
                title="My Matches"
                description="View your joined matches, rooms and results."
                button="View Matches"
                onClick={goMatches}
              />

              <ActionCard
                icon="💰"
                title="My Wallet"
                description="Check your balance, entries and transaction history."
                button="Open Wallet"
                onClick={goWallet}
              />

              <ActionCard
                icon="👤"
                title="My Profile"
                description="Manage your player information and account details."
                button="View Profile"
                onClick={goProfile}
              />

            </div>
          </section>

          {/* =====================================================
              UPCOMING / EMPTY STATE
          ===================================================== */}
          <section style={styles.emptyCard}>

            <div style={styles.emptyIcon}>
              🎮
            </div>

            <div style={styles.emptyContent}>

              <div style={styles.sectionLabel}>
                READY TO PLAY?
              </div>

              <h2 style={styles.emptyTitle}>
                Your next match starts here.
              </h2>

              <p style={styles.emptyText}>
                Join a tournament and start competing.
                Your matches, results and rewards will appear
                here once you participate.
              </p>

              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => goTournaments()}
              >
                Explore Tournaments →
              </button>

            </div>
          </section>

          {/* =====================================================
              FOOTER
          ===================================================== */}
          <footer style={styles.footer}>

            <div>
              © 2026 Play2Prove
            </div>

            <div style={styles.footerLinks}>

              <button
                type="button"
                style={styles.footerButton}
                onClick={() => goHome()}
              >
                Home
              </button>

              <button
                type="button"
                style={styles.footerButton}
                onClick={() => goProfile()}
              >
                Profile
              </button>

              <button
                type="button"
                style={styles.footerButton}
                onClick={logout}
              >
                Logout
              </button>

            </div>

          </footer>

        </section>
      </div>
    </main>
  );
}


/* ===============================================================
   SMALL DASHBOARD COMPONENTS
================================================================ */

function DashboardStat({
  icon,
  title,
  value,
  subtitle,
  onClick,
}) {
  return (
    <button
      type="button"
      style={styles.statCard}
      onClick={onClick}
    >
      <div style={styles.statTop}>
        <div style={styles.statIcon}>
          {icon}
        </div>

        <span style={styles.statArrow}>
          →
        </span>
      </div>

      <div style={styles.statValue}>
        {value}
      </div>

      <div style={styles.statTitle}>
        {title}
      </div>

      <div style={styles.statSubtitle}>
        {subtitle}
      </div>
    </button>
  );
}


function ActionCard({
  icon,
  title,
  description,
  button,
  onClick,
}) {
  return (
    <div style={styles.actionCard}>

      <div style={styles.actionIcon}>
        {icon}
      </div>

      <h3 style={styles.actionTitle}>
        {title}
      </h3>

      <p style={styles.actionDescription}>
        {description}
      </p>

      <button
        type="button"
        style={styles.actionButton}
        onClick={onClick}
      >
        {button} →
      </button>

    </div>
  );
}


/* ===============================================================
   NAVIGATION HELPERS
================================================================ */

function goHome() {
  window.location.href = "/";
}

function goProfile() {
  window.location.href = "/profile";
}

function goTournaments() {
  window.location.href = "/tournaments";
}

function goMatches() {
  window.location.href = "/matches";
}

function goWallet() {
  window.location.href = "/wallet";
}


/* ===============================================================
   STYLES
================================================================ */

const styles = {

  page: {
    minHeight: "100vh",
    background: "#05070a",
    color: "#ffffff",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  /* -------------------------------------------------------------
     LOADING
  ------------------------------------------------------------- */

  loadingPage: {
    minHeight: "100vh",
    background: "#05070a",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },

  loaderCard: {
    width: "100%",
    maxWidth: "420px",
    padding: "36px",
    textAlign: "center",
    background: "#0b0e13",
    border: "1px solid #252a32",
    borderRadius: "18px",
  },

  logoSmall: {
    width: "58px",
    height: "58px",
    margin: "0 auto 20px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ff5a00",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "900",
  },

  loadingTitle: {
    margin: "0",
    fontSize: "22px",
  },

  loadingText: {
    marginTop: "10px",
    color: "#8d96a5",
  },

  loadingBar: {
    height: "5px",
    marginTop: "25px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "#20252d",
  },

  loadingBarFill: {
    width: "55%",
    height: "100%",
    borderRadius: "999px",
    background: "#ff5a00",
  },

  /* -------------------------------------------------------------
     TOP BAR
  ------------------------------------------------------------- */

  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    minHeight: "70px",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(5, 7, 10, 0.96)",
    borderBottom: "1px solid #20252d",
    backdropFilter: "blur(14px)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },

  brandLogo: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ff5a00",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "900",
  },

  brandName: {
    fontSize: "16px",
    fontWeight: "900",
  },

  brandTagline: {
    marginTop: "2px",
    color: "#697281",
    fontSize: "8px",
    letterSpacing: "1.2px",
  },

  topActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  homeButton: {
    padding: "10px 14px",
    borderRadius: "9px",
    border: "1px solid #303640",
    background: "#0c1016",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
  },

  profileButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "5px 10px 5px 5px",
    borderRadius: "10px",
    border: "1px solid #303640",
    background: "#0c1016",
    color: "#ffffff",
    cursor: "pointer",
  },

  profileAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ff5a00",
    fontSize: "13px",
    fontWeight: "900",
  },

  profileName: {
    fontSize: "13px",
    fontWeight: "700",
  },

  /* -------------------------------------------------------------
     MAIN LAYOUT
  ------------------------------------------------------------- */

  layout: {
    width: "100%",
    maxWidth: "1440px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "230px minmax(0, 1fr)",
  },

  sidebar: {
    minHeight: "calc(100vh - 70px)",
    position: "sticky",
    top: "70px",
    alignSelf: "start",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #20252d",
    background: "#080b0f",
  },

  sidebarPlayer: {
    padding: "28px 20px",
    borderBottom: "1px solid #20252d",
  },

  largeAvatar: {
    width: "52px",
    height: "52px",
    marginBottom: "12px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#161c24",
    border: "1px solid #343b46",
    color: "#ff6a00",
    fontSize: "20px",
    fontWeight: "900",
  },

  sidebarPlayerName: {
    fontSize: "14px",
    fontWeight: "800",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  sidebarPlayerId: {
    marginTop: "5px",
    color: "#6f7886",
    fontSize: "10px",
  },

  navigation: {
    padding: "18px 12px",
  },

  navItem: {
    width: "100%",
    marginBottom: "5px",
    padding: "12px 13px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1px solid transparent",
    borderRadius: "9px",
    background: "transparent",
    color: "#89919e",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },

  navItemActive: {
    width: "100%",
    marginBottom: "5px",
    padding: "12px 13px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1px solid #3a2419",
    borderRadius: "9px",
    background: "#1a100b",
    color: "#ff6a00",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "800",
  },

  sidebarBottom: {
    marginTop: "auto",
    padding: "15px 12px",
    borderTop: "1px solid #20252d",
  },

  logoutSidebar: {
    width: "100%",
    padding: "11px",
    border: "1px solid #422222",
    borderRadius: "9px",
    background: "#170c0c",
    color: "#ef5350",
    cursor: "pointer",
    fontWeight: "700",
  },

  /* -------------------------------------------------------------
     CONTENT
  ------------------------------------------------------------- */

  content: {
    minWidth: 0,
    padding: "34px",
  },

  welcomeSection: {
    marginBottom: "30px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
  },

  eyebrow: {
    marginBottom: "8px",
    color: "#ff5a00",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  welcomeTitle: {
    margin: 0,
    fontSize: "38px",
    lineHeight: "1.05",
    letterSpacing: "-1px",
  },

  orangeText: {
    color: "#ff5a00",
  },

  welcomeText: {
    maxWidth: "650px",
    marginTop: "12px",
    color: "#858e9b",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  accountStatus: {
    minWidth: "190px",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #1f4030",
    borderRadius: "11px",
    background: "#0a130e",
  },

  statusDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  statusTitle: {
    fontSize: "12px",
    fontWeight: "800",
  },

  statusText: {
    marginTop: "3px",
    color: "#6f7b73",
    fontSize: "10px",
  },

  /* -------------------------------------------------------------
     ACCOUNT CARD
  ------------------------------------------------------------- */

  accountCard: {
    marginBottom: "32px",
    padding: "24px",
    border: "1px solid #252b34",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, #10151c 0%, #0a0d12 100%)",
  },

  accountCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  sectionLabel: {
    color: "#ff5a00",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "1.7px",
  },

  accountTitle: {
    margin: "6px 0 0",
    fontSize: "21px",
  },

  outlineButton: {
    padding: "9px 13px",
    borderRadius: "8px",
    border: "1px solid #343b45",
    background: "transparent",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },

  accountGrid: {
    marginTop: "22px",
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },

  accountItem: {
    padding: "15px",
    borderRadius: "10px",
    background: "#080b0f",
    border: "1px solid #20262e",
  },

  accountItemLabel: {
    display: "block",
    marginBottom: "7px",
    color: "#69727e",
    fontSize: "10px",
  },

  accountItemValue: {
    display: "block",
    fontSize: "12px",
    overflowWrap: "anywhere",
  },

  activeValue: {
    display: "block",
    color: "#22c55e",
    fontSize: "12px",
  },

  /* -------------------------------------------------------------
     SECTIONS
  ------------------------------------------------------------- */

  sectionHeader: {
    marginBottom: "15px",
  },

  sectionTitle: {
    margin: "5px 0 0",
    fontSize: "21px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "12px",
  },

  statCard: {
    minWidth: 0,
    padding: "19px",
    border: "1px solid #252b34",
    borderRadius: "13px",
    background: "#0b0f14",
    color: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
  },

  statTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statIcon: {
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9px",
    background: "#151a21",
    fontSize: "16px",
  },

  statArrow: {
    color: "#68717d",
    fontSize: "16px",
  },

  statValue: {
    marginTop: "22px",
    fontSize: "28px",
    fontWeight: "900",
  },

  statTitle: {
    marginTop: "3px",
    fontSize: "13px",
    fontWeight: "800",
  },

  statSubtitle: {
    marginTop: "5px",
    color: "#69727e",
    fontSize: "10px",
  },

  /* -------------------------------------------------------------
     QUICK ACTIONS
  ------------------------------------------------------------- */

  quickSection: {
    marginTop: "34px",
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "12px",
  },

  actionCard: {
    padding: "19px",
    border: "1px solid #252b34",
    borderRadius: "13px",
    background: "#0b0f14",
  },

  actionIcon: {
    fontSize: "22px",
    marginBottom: "14px",
  },

  actionTitle: {
    margin: 0,
    fontSize: "15px",
  },

  actionDescription: {
    minHeight: "55px",
    margin: "9px 0 15px",
    color: "#747e8b",
    fontSize: "11px",
    lineHeight: "1.55",
  },

  actionButton: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #3a2a21",
    background: "#1a100b",
    color: "#ff6a00",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "800",
  },

  /* -------------------------------------------------------------
     EMPTY / CTA
  ------------------------------------------------------------- */

  emptyCard: {
    marginTop: "34px",
    padding: "25px",
    display: "flex",
    alignItems: "center",
    gap: "22px",
    border: "1px solid #2b2521",
    borderRadius: "15px",
    background:
      "linear-gradient(120deg, #130d09 0%, #0b0f14 65%)",
  },

  emptyIcon: {
    width: "62px",
    height: "62px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "15px",
    background: "#21140d",
    fontSize: "28px",
  },

  emptyContent: {
    minWidth: 0,
  },

  emptyTitle: {
    margin: "6px 0 0",
    fontSize: "21px",
  },

  emptyText: {
    maxWidth: "680px",
    margin: "9px 0 17px",
    color: "#7d8692",
    lineHeight: "1.55",
    fontSize: "12px",
  },

  primaryButton: {
    padding: "11px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#ff5a00",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "11px",
  },

  /* -------------------------------------------------------------
     FOOTER
  ------------------------------------------------------------- */

  footer: {
    marginTop: "50px",
    padding: "22px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #20252d",
    color: "#555e6a",
    fontSize: "10px",
  },

  footerLinks: {
    display: "flex",
    gap: "15px",
  },

  footerButton: {
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#69727e",
    cursor: "pointer",
    fontSize: "10px",
  },
};


/* ===============================================================
   RESPONSIVE MOBILE SUPPORT
================================================================ */

if (typeof window !== "undefined") {
  // Navigation helpers intentionally use normal browser navigation
  // so this page remains independent from additional Next.js packages.
}
