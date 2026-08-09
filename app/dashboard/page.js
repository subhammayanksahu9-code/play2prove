"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

/* ============================================================
   PLAY2PROVE — PLAYER DASHBOARD V1
   30-DIVISION GAMING DASHBOARD
============================================================ */

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.user) {
          window.location.replace("/login");
          return;
        }

        if (mounted) {
          setUser(session.user);
          setLoading(false);
        }
      } catch (error) {
        console.error("Dashboard session error:", error);

        if (mounted) {
          window.location.replace("/login");
        }
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }

    window.location.replace("/login");
  }

  function navigate(path, name) {
    setActiveNav(name);
    setMobileMenu(false);
    window.location.href = path;
  }

  const player = useMemo(() => {
    const metadata = user?.user_metadata || {};

    const name =
      metadata.full_name ||
      metadata.name ||
      "Player";

    const firstName =
      name.split(" ")[0] || "Player";

    const playerId =
      metadata.player_id ||
      `P2P-${user?.id?.slice(0, 8)?.toUpperCase() || "PLAYER"}`;

    return {
      name,
      firstName,
      playerId,
      email: user?.email || "",
      avatarLetter: firstName.charAt(0).toUpperCase(),
    };
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="dashboardPage">

      {/* ========================================================
          01 — APP SHELL
      ======================================================== */}

      <div className="appShell">

        {/* ======================================================
            02 — TOP NAVBAR
        ====================================================== */}

        <header className="topNavbar">

          <div
            className="brandArea"
            onClick={() => navigate("/", "Home")}
          >
            <div className="brandLogo">
              P2P
            </div>

            <div>
              <div className="brandName">
                Play2Prove
              </div>

              <div className="brandSub">
                COMPETE • PROVE • WIN
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}

          <nav className="desktopTopNav">

            <button
              onClick={() => navigate("/", "Home")}
              className="topNavButton"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/tournaments", "Tournaments")}
              className="topNavButton"
            >
              Tournaments
            </button>

            <button
              onClick={() => navigate("/matches", "Matches")}
              className="topNavButton"
            >
              Matches
            </button>

          </nav>

          <div className="topRightArea">

            <button
              className="notificationButton"
              onClick={() => {
                document
                  .getElementById("notifications")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
              aria-label="Notifications"
            >
              🔔
              <span className="notificationBadge">
                3
              </span>
            </button>

            <button
              className="topProfile"
              onClick={() =>
                navigate("/profile", "Profile")
              }
            >
              <span className="topAvatar">
                {player.avatarLetter}
              </span>

              <span className="topProfileName">
                {player.firstName}
              </span>
            </button>

            <button
              className="mobileMenuButton"
              onClick={() =>
                setMobileMenu((value) => !value)
              }
            >
              ☰
            </button>

          </div>

        </header>


        {/* ======================================================
            03 — MOBILE NAVIGATION
        ====================================================== */}

        {mobileMenu && (
          <div className="mobileMenu">

            <button
              onClick={() => navigate("/", "Home")}
            >
              🏠 Home
            </button>

            <button
              onClick={() =>
                navigate(
                  "/tournaments",
                  "Tournaments"
                )
              }
            >
              🏆 Tournaments
            </button>

            <button
              onClick={() =>
                navigate("/matches", "Matches")
              }
            >
              ⚔ Matches
            </button>

            <button
              onClick={() =>
                navigate("/wallet", "Wallet")
              }
            >
              💰 Wallet
            </button>

            <button
              onClick={() =>
                navigate("/profile", "Profile")
              }
            >
              👤 Profile
            </button>

          </div>
        )}


        <div className="dashboardLayout">

          {/* ====================================================
              04 — SIDEBAR
          ==================================================== */}

          <aside className="sidebar">

            <div className="sidebarProfile">

              <div className="sidebarAvatar">
                {player.avatarLetter}

                <span className="onlineDot"></span>
              </div>

              <div className="sidebarPlayerName">
                {player.name}
              </div>

              <div className="sidebarPlayerId">
                {player.playerId}
              </div>

            </div>


            {/* ==================================================
                05 — PLAYER PROFILE HEADER / NAVIGATION
            ================================================== */}

            <nav className="sideNavigation">

              <SideNav
                icon="⌂"
                label="Dashboard"
                active={activeNav === "Dashboard"}
                onClick={() => {
                  setActiveNav("Dashboard");
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              />

              <SideNav
                icon="🏆"
                label="Tournaments"
                active={activeNav === "Tournaments"}
                onClick={() =>
                  navigate(
                    "/tournaments",
                    "Tournaments"
                  )
                }
              />

              <SideNav
                icon="⚔"
                label="My Matches"
                active={activeNav === "Matches"}
                onClick={() =>
                  navigate("/matches", "Matches")
                }
              />

              <SideNav
                icon="💰"
                label="Wallet"
                active={activeNav === "Wallet"}
                onClick={() =>
                  navigate("/wallet", "Wallet")
                }
              />

              <SideNav
                icon="👤"
                label="Profile"
                active={activeNav === "Profile"}
                onClick={() =>
                  navigate("/profile", "Profile")
                }
              />

              <SideNav
                icon="🎁"
                label="Rewards"
                onClick={() =>
                  document
                    .getElementById("rewards")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              />

              <SideNav
                icon="👥"
                label="Referral"
                onClick={() =>
                  document
                    .getElementById("referral")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              />

            </nav>


            {/* ==================================================
                06 — ONLINE STATUS
            ================================================== */}

            <div className="sidebarStatus">

              <span className="greenStatusDot"></span>

              <div>
                <strong>
                  Account Online
                </strong>

                <small>
                  Player session active
                </small>
              </div>

            </div>


            {/* ==================================================
                07 — SIDEBAR LOGOUT
            ================================================== */}

            <button
              className="sidebarLogout"
              onClick={logout}
              disabled={loggingOut}
            >
              {loggingOut
                ? "Logging out..."
                : "↪ Logout"}
            </button>

          </aside>


          {/* ====================================================
              MAIN CONTENT
          ==================================================== */}

          <section className="mainContent">


            {/* ==================================================
                08 — WELCOME HERO
            ================================================== */}

            <section className="welcomeHero">

              <div className="heroGlow"></div>

              <div className="heroContent">

                <div className="heroEyebrow">
                  PLAYER COMMAND CENTER
                </div>

                <h1>
                  Welcome back,
                  <br />
                  <span>
                    {player.firstName}
                  </span>
                </h1>

                <p>
                  Your next match is waiting.
                  Compete with players, climb the
                  leaderboard and prove your skills.
                </p>


                {/* ==================================================
                    09 — QUICK JOIN CTA
                ================================================== */}

                <div className="heroActions">

                  <button
                    className="primaryButton"
                    onClick={() =>
                      navigate(
                        "/tournaments",
                        "Tournaments"
                      )
                    }
                  >
                    🏆 Find Tournament
                  </button>

                  <button
                    className="secondaryButton"
                    onClick={() =>
                      navigate(
                        "/matches",
                        "Matches"
                      )
                    }
                  >
                    ⚔ My Matches
                  </button>

                </div>

              </div>


              {/* ==================================================
                  10 — GAMING IMAGE
              ================================================== */}

              <div className="heroVisual">

                <div className="heroImageCard">

                  <div className="imageOverlay"></div>

                  <div className="heroImageText">

                    <span>
                      PLAY2PROVE
                    </span>

                    <strong>
                      PLAY. COMPETE. WIN.
                    </strong>

                  </div>

                </div>

              </div>

            </section>


            {/* ==================================================
                11 — WALLET BALANCE
            ================================================== */}

            <section className="statsGrid">

              <StatCard
                icon="💰"
                label="Wallet Balance"
                value="₹0"
                detail="Available balance"
                action="Open Wallet"
                onClick={() =>
                  navigate("/wallet", "Wallet")
                }
              />


              {/* ==================================================
                  12 — ACTIVE TOURNAMENTS
              ================================================== */}

              <StatCard
                icon="🏆"
                label="Active Tournaments"
                value="0"
                detail="Currently joined"
                action="View All"
                onClick={() =>
                  navigate(
                    "/tournaments",
                    "Tournaments"
                  )
                }
              />


              {/* ==================================================
                  13 — UPCOMING MATCHES
              ================================================== */}

              <StatCard
                icon="⚔"
                label="Upcoming Matches"
                value="0"
                detail="Ready to play"
                action="View Matches"
                onClick={() =>
                  navigate(
                    "/matches",
                    "Matches"
                  )
                }
              />


              {/* ==================================================
                  14 — WIN RATE
              ================================================== */}

              <StatCard
                icon="🔥"
                label="Win Rate"
                value="0%"
                detail="Career performance"
                action="View Stats"
                onClick={() =>
                  document
                    .getElementById("statistics")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              />

            </section>


            {/* ==================================================
                15 — FEATURED TOURNAMENT
            ================================================== */}

            <section className="sectionBlock">

              <SectionHeading
                eyebrow="FEATURED"
                title="Tournament Spotlight"
                description="The best tournaments available for you."
              />

              <div className="featuredTournament">

                <div className="tournamentVisual">

                  <div className="tournamentImageOverlay"></div>

                  <div className="tournamentGameTag">
                    FREE FIRE
                  </div>

                  <div className="tournamentVisualTitle">
                    SHOW YOUR SKILL
                  </div>

                </div>

                <div className="tournamentInfo">

                  <div className="liveTag">
                    ● OPEN FOR REGISTRATION
                  </div>

                  <h2>
                    Featured Battle Arena
                  </h2>

                  <p>
                    Join the competition and fight
                    for your place on the leaderboard.
                  </p>

                  <div className="tournamentMeta">

                    <MetaItem
                      label="Entry"
                      value="₹ —"
                    />

                    <MetaItem
                      label="Prize Pool"
                      value="₹ —"
                    />

                    <MetaItem
                      label="Slots"
                      value="—"
                    />

                  </div>

                  <button
                    className="primaryButton"
                    onClick={() =>
                      navigate(
                        "/tournaments",
                        "Tournaments"
                      )
                    }
                  >
                    Explore Tournament →
                  </button>

                </div>

              </div>

            </section>


            {/* ==================================================
                16 — LIVE MATCHES
            ================================================== */}

            <section className="sectionBlock">

              <SectionHeading
                eyebrow="LIVE"
                title="Live Matches"
                description="Matches currently happening."
              />

              <EmptyState
                icon="🎮"
                title="No live matches"
                text="Your live matches will appear here when you join a tournament."
              />

            </section>


            {/* ==================================================
                17 — RECENT RESULTS
            ================================================== */}

            <section className="sectionBlock">

              <SectionHeading
                eyebrow="RESULTS"
                title="Recent Results"
                description="Your latest tournament performance."
              />

              <div className="resultGrid">

                <ResultCard
                  title="No matches played yet"
                  subtitle="Your results will appear here."
                  icon="🏁"
                />

                <ResultCard
                  title="Start your first battle"
                  subtitle="Join a tournament to begin."
                  icon="⚔"
                />

              </div>

            </section>


            {/* ==================================================
                18 — STATISTICS
            ================================================== */}

            <section
              id="statistics"
              className="sectionBlock"
            >

              <SectionHeading
                eyebrow="PERFORMANCE"
                title="Player Statistics"
                description="Track your competitive progress."
              />

              <div className="performanceGrid">

                <PerformanceCard
                  title="Matches"
                  value="0"
                  progress={0}
                />

                <PerformanceCard
                  title="Wins"
                  value="0"
                  progress={0}
                />

                <PerformanceCard
                  title="Win Rate"
                  value="0%"
                  progress={0}
                />

                <PerformanceCard
                  title="Earnings"
                  value="₹0"
                  progress={0}
                />

              </div>

            </section>


            {/* ==================================================
                19 — PLAYER LEVEL
            ================================================== */}

            <section className="levelCard">

              <div className="levelBadge">
                LVL
                <strong>
                  1
                </strong>
              </div>

              <div className="levelContent">

                <div className="levelTop">

                  <div>
                    <span>
                      PLAYER LEVEL
                    </span>

                    <h3>
                      Rookie
                    </h3>
                  </div>

                  <strong>
                    0 / 100 XP
                  </strong>

                </div>

                <div className="progressTrack">

                  <div
                    className="progressFill"
                    style={{
                      width: "0%",
                    }}
                  />

                </div>

                <small>
                  Play matches and complete
                  challenges to earn XP.
                </small>

              </div>

            </section>


            {/* ==================================================
                20 — WINNING STREAK
            ================================================== */}

            <section className="streakCard">

              <div className="streakIcon">
                🔥
              </div>

              <div>

                <span>
                  CURRENT WINNING STREAK
                </span>

                <strong>
                  0 Wins
                </strong>

                <p>
                  Your winning streak will appear
                  here after your first victory.
                </p>

              </div>

            </section>


            {/* ==================================================
                21 — GAME CATEGORIES
            ================================================== */}

            <section className="sectionBlock">

              <SectionHeading
                eyebrow="GAMES"
                title="Choose Your Game"
                description="Explore tournaments by game."
              />

              <div className="gameGrid">

                <GameCard
                  title="Free Fire"
                  subtitle="Battle Royale"
                  icon="🔥"
                />

                <GameCard
                  title="BGMI"
                  subtitle="Battle Royale"
                  icon="🎯"
                />

                <GameCard
                  title="Valorant"
                  subtitle="Tactical FPS"
                  icon="⚡"
                />

                <GameCard
                  title="Coming Soon"
                  subtitle="More games"
                  icon="🎮"
                />

              </div>

            </section>


            {/* ==================================================
                22 — RECOMMENDED TOURNAMENTS
            ================================================== */}

            <section className="sectionBlock">

              <SectionHeading
                eyebrow="RECOMMENDED"
                title="For You"
                description="Tournaments selected for your player profile."
              />

              <div className="recommendGrid">

                <RecommendationCard
                  game="FREE FIRE"
                  title="Daily Battle"
                  status="OPEN"
                />

                <RecommendationCard
                  game="BGMI"
                  title="Squad Challenge"
                  status="SOON"
                />

                <RecommendationCard
                  game="VALORANT"
                  title="Ranked Arena"
                  status="SOON"
                />

              </div>

            </section>


            {/* ==================================================
                23 — REWARDS
            ================================================== */}

            <section
              id="rewards"
              className="sectionBlock"
            >

              <SectionHeading
                eyebrow="REWARDS"
                title="Your Rewards"
                description="Earn rewards by playing and completing challenges."
              />

              <div className="rewardGrid">

                <RewardCard
                  icon="🎁"
                  title="Welcome Reward"
                  text="Complete your first tournament."
                />

                <RewardCard
                  icon="🏅"
                  title="First Win"
                  text="Win your first competitive match."
                />

                <RewardCard
                  icon="🔥"
                  title="Streak Master"
                  text="Build a winning streak."
                />

              </div>

            </section>


            {/* ==================================================
                24 — REFERRAL
            ================================================== */}

            <section
              id="referral"
              className="referralCard"
            >

              <div>

                <div className="sectionEyebrow">
                  REFER & EARN
                </div>

                <h2>
                  Invite your friends.
                  <br />
                  Grow your squad.
                </h2>

                <p>
                  Share your referral code and earn
                  rewards when eligible friends join.
                </p>

              </div>

              <div className="referralBox">

                <span>
                  YOUR REFERRAL CODE
                </span>

                <strong>
                  {player.playerId}
                </strong>

                <button
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText(player.playerId);
                  }}
                  className="copyButton"
                >
                  Copy Code
                </button>

              </div>

            </section>


            {/* ==================================================
                25 — NOTIFICATIONS
            ================================================== */}

            <section
              id="notifications"
              className="sectionBlock"
            >

              <SectionHeading
                eyebrow="UPDATES"
                title="Notifications"
                description="Important updates from Play2Prove."
              />

              <div className="notificationList">

                <NotificationItem
                  icon="🎮"
                  title="Welcome to Play2Prove"
                  text="Your player dashboard is ready."
                />

                <NotificationItem
                  icon="🏆"
                  title="Find your first tournament"
                  text="Explore tournaments and start competing."
                />

                <NotificationItem
                  icon="🔐"
                  title="Keep your account secure"
                  text="Never share your password with anyone."
                />

              </div>

            </section>


            {/* ==================================================
                26 — ACTIVITY FEED
            ================================================== */}

            <section className="sectionBlock">

              <SectionHeading
                eyebrow="ACTIVITY"
                title="Recent Activity"
                description="Your latest account activity."
              />

              <div className="activityTimeline">

                <ActivityItem
                  icon="👤"
                  title="Account created"
                  text="Your Play2Prove player account is active."
                />

                <ActivityItem
                  icon="🎮"
                  title="Dashboard opened"
                  text="Welcome to your player command center."
                />

                <ActivityItem
                  icon="🏆"
                  title="Ready to compete"
                  text="Join your first tournament."
                />

              </div>

            </section>


            {/* ==================================================
                27 — ACHIEVEMENTS
            ================================================== */}

            <section className="sectionBlock">

              <SectionHeading
                eyebrow="ACHIEVEMENTS"
                title="Player Achievements"
                description="Unlock achievements as you progress."
              />

              <div className="achievementGrid">

                <Achievement
                  icon="🥇"
                  title="First Win"
                  locked
                />

                <Achievement
                  icon="🔥"
                  title="Hot Streak"
                  locked
                />

                <Achievement
                  icon="🏆"
                  title="Tournament Champion"
                  locked
                />

                <Achievement
                  icon="👑"
                  title="Elite Player"
                  locked
                />

              </div>

            </section>


            {/* ==================================================
                28 — HELP & SUPPORT
            ================================================== */}

            <section className="supportCard">

              <div className="supportIcon">
                💬
              </div>

              <div className="supportContent">

                <span>
                  NEED HELP?
                </span>

                <h2>
                  We're here for you.
                </h2>

                <p>
                  Get help with tournaments,
                  matches, wallet or your account.
                </p>

              </div>

              <button
                className="secondaryButton"
                onClick={() => navigate("/support", "Support")}
              >
                Contact Support →
              </button>

            </section>


            {/* ==================================================
                29 — SECURITY / ACCOUNT STATUS
            ================================================== */}

            <section className="securityCard">

              <div>

                <div className="sectionEyebrow">
                  ACCOUNT SECURITY
                </div>

                <h2>
                  Your account is active
                </h2>

                <p>
                  Signed in as {player.email}
                </p>

              </div>

              <div className="securityStatus">

                <span className="securityDot"></span>

                Secure Session

              </div>

            </section>


            {/* ==================================================
                30 — FOOTER
            ================================================== */}

            <footer className="dashboardFooter">

              <div>

                <strong>
                  Play2Prove
                </strong>

                <span>
                  Competitive gaming platform
                </span>

              </div>

              <div className="footerLinks">

                <button
                  onClick={() =>
                    navigate("/", "Home")
                  }
                >
                  Home
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/tournaments",
                      "Tournaments"
                    )
                  }
                >
                  Tournaments
                </button>

                <button
                  onClick={() =>
                    navigate("/profile", "Profile")
                  }
                >
                  Profile
                </button>

                <button
                  onClick={logout}
                >
                  Logout
                </button>

              </div>

              <small>
                © 2026 Play2Prove
              </small>

            </footer>

          </section>
        </div>
      </div>


      {/* ========================================================
          GLOBAL CSS
      ======================================================== */}

      <style jsx global>{`

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #05070a;
        }

        button {
          font-family: inherit;
        }

        .dashboardPage {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(255, 90, 0, 0.07),
              transparent 30%
            ),
            #05070a;
          color: #fff;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* ============================================
           APP SHELL
        ============================================ */

        .appShell {
          min-height: 100vh;
        }

        /* ============================================
           TOP NAVBAR
        ============================================ */

        .topNavbar {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          border-bottom: 1px solid #20252d;
          background: rgba(5, 7, 10, 0.92);
          backdrop-filter: blur(18px);
        }

        .brandArea {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .brandLogo {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background:
            linear-gradient(
              135deg,
              #ff7200,
              #ff3d00
            );
          box-shadow:
            0 0 25px rgba(255, 90, 0, 0.25);
          font-size: 12px;
          font-weight: 1000;
        }

        .brandName {
          font-size: 17px;
          font-weight: 900;
        }

        .brandSub {
          margin-top: 2px;
          color: #69727e;
          font-size: 8px;
          letter-spacing: 1.4px;
        }

        .desktopTopNav {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .topNavButton {
          padding: 9px 13px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #8c95a2;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          transition: 0.2s;
        }

        .topNavButton:hover {
          color: #fff;
          background: #10151b;
        }

        .topRightArea {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .notificationButton {
          position: relative;
          width: 40px;
          height: 40px;
          border: 1px solid #252c35;
          border-radius: 10px;
          background: #0c1016;
          color: #fff;
          cursor: pointer;
        }

        .notificationBadge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 99px;
          background: #ff5a00;
          font-size: 9px;
          font-weight: 900;
        }

        .topProfile {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 10px 5px 5px;
          border: 1px solid #252c35;
          border-radius: 11px;
          background: #0c1016;
          color: #fff;
          cursor: pointer;
        }

        .topAvatar {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #1b2028;
          color: #ff6a00;
          font-size: 13px;
          font-weight: 900;
        }

        .topProfileName {
          font-size: 12px;
          font-weight: 800;
        }

        .mobileMenuButton {
          display: none;
          width: 40px;
          height: 40px;
          border: 1px solid #252c35;
          border-radius: 10px;
          background: #0c1016;
          color: #fff;
          cursor: pointer;
        }

        .mobileMenu {
          display: none;
        }

        /* ============================================
           LAYOUT
        ============================================ */

        .dashboardLayout {
          display: grid;
          grid-template-columns: 235px minmax(0, 1fr);
          max-width: 1500px;
          margin: 0 auto;
        }

        /* ============================================
           SIDEBAR
        ============================================ */

        .sidebar {
          position: sticky;
          top: 72px;
          height: calc(100vh - 72px);
          display: flex;
          flex-direction: column;
          padding: 22px 13px;
          border-right: 1px solid #20252d;
          background: rgba(8, 11, 15, 0.8);
        }

        .sidebarProfile {
          padding: 8px 10px 22px;
          border-bottom: 1px solid #20252d;
        }

        .sidebarAvatar {
          position: relative;
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          border: 1px solid #343b45;
          border-radius: 15px;
          background: #131820;
          color: #ff6800;
          font-size: 21px;
          font-weight: 900;
        }

        .onlineDot {
          position: absolute;
          right: -2px;
          bottom: -2px;
          width: 12px;
          height: 12px;
          border: 3px solid #080b0f;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
        }

        .sidebarPlayerName {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 900;
        }

        .sidebarPlayerId {
          margin-top: 5px;
          color: #69727e;
          font-size: 9px;
        }

        .sideNavigation {
          padding-top: 16px;
        }

        .sideNavItem {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
          padding: 12px 13px;
          border: 1px solid transparent;
          border-radius: 9px;
          background: transparent;
          color: #7e8794;
          cursor: pointer;
          text-align: left;
          font-size: 12px;
          font-weight: 700;
          transition:
            transform 0.2s,
            background 0.2s,
            color 0.2s;
        }

        .sideNavItem:hover {
          transform: translateX(2px);
          color: #fff;
          background: #10151b;
        }

        .sideNavItem.active {
          border-color: #3a2419;
          background: linear-gradient(
            90deg,
            #1d110b,
            #110d0a
          );
          color: #ff6a00;
          box-shadow:
            inset 3px 0 0 #ff5a00;
        }

        .sideNavIcon {
          width: 22px;
          text-align: center;
          font-size: 15px;
        }

        .sidebarStatus {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: auto;
          padding: 13px;
          border: 1px solid #1d3327;
          border-radius: 10px;
          background: #09120d;
        }

        .greenStatusDot,
        .securityDot {
          width: 8px;
          height: 8px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.55);
        }

        .sidebarStatus strong {
          display: block;
          font-size: 10px;
        }

        .sidebarStatus small {
          display: block;
          margin-top: 3px;
          color: #68736c;
          font-size: 8px;
        }

        .sidebarLogout {
          width: 100%;
          margin-top: 10px;
          padding: 11px;
          border: 1px solid #422222;
          border-radius: 9px;
          background: #160b0b;
          color: #ef5350;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        /* ============================================
           MAIN
        ============================================ */

        .mainContent {
          min-width: 0;
          padding: 30px;
          overflow: hidden;
        }

        /* ============================================
           HERO
        ============================================ */

        .welcomeHero {
          position: relative;
          min-height: 335px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          overflow: hidden;
          margin-bottom: 18px;
          border: 1px solid #2b2d31;
          border-radius: 20px;
          background:
            linear-gradient(
              120deg,
              #11151c 0%,
              #090c11 55%,
              #110c09 100%
            );
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.28);
        }

        .heroGlow {
          position: absolute;
          width: 400px;
          height: 400px;
          top: -220px;
          right: 15%;
          border-radius: 50%;
          background: rgba(255, 90, 0, 0.16);
          filter: blur(70px);
          animation: pulseGlow 4s ease-in-out infinite;
        }

        .heroContent {
          position: relative;
          z-index: 2;
          padding: 44px;
        }

        .heroEyebrow,
        .sectionEyebrow {
          color: #ff5a00;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .heroContent h1 {
          margin: 9px 0 0;
          font-size: clamp(32px, 4vw, 53px);
          line-height: 0.98;
          letter-spacing: -2px;
        }

        .heroContent h1 span {
          color: #ff5a00;
          text-shadow:
            0 0 35px rgba(255, 90, 0, 0.2);
        }

        .heroContent p {
          max-width: 540px;
          margin: 18px 0 24px;
          color: #808996;
          line-height: 1.65;
          font-size: 13px;
        }

        .heroActions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .primaryButton,
        .secondaryButton {
          padding: 12px 17px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 900;
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }

        .primaryButton {
          border: 0;
          background:
            linear-gradient(
              135deg,
              #ff7200,
              #ff4d00
            );
          color: #fff;
          box-shadow:
            0 10px 30px rgba(255, 90, 0, 0.18);
        }

        .secondaryButton {
          border: 1px solid #343b45;
          background: #10151b;
          color: #fff;
        }

        .primaryButton:hover,
        .secondaryButton:hover {
          transform: translateY(-2px);
        }

        .primaryButton:hover {
          box-shadow:
            0 15px 35px rgba(255, 90, 0, 0.3);
        }

        .heroVisual {
          position: relative;
          min-height: 300px;
          padding: 20px;
        }

        .heroImageCard {
          position: absolute;
          inset: 20px;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid #34302d;
          background:
            linear-gradient(
              110deg,
              rgba(0, 0, 0, 0.2),
              rgba(255, 72, 0, 0.2)
            ),
            url("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85")
            center / cover;
          transform: perspective(900px) rotateY(-5deg);
          box-shadow:
            -20px 25px 60px rgba(0, 0, 0, 0.5);
          animation: heroFloat 5s ease-in-out infinite;
        }

        .imageOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              transparent 20%,
              rgba(0, 0, 0, 0.8)
            );
        }

        .heroImageText {
          position: absolute;
          left: 24px;
          bottom: 22px;
          z-index: 2;
        }

        .heroImageText span {
          display: block;
          color: #ff6a00;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .heroImageText strong {
          display: block;
          margin-top: 5px;
          font-size: 19px;
        }

        /* ============================================
           STATS
        ============================================ */

        .statsGrid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .statCard {
          min-width: 0;
          padding: 18px;
          border: 1px solid #252b34;
          border-radius: 14px;
          background: #0b0f14;
          text-align: left;
          color: #fff;
          cursor: pointer;
          transition:
            transform 0.2s,
            border-color 0.2s;
        }

        .statCard:hover {
          transform: translateY(-3px);
          border-color: #3d332c;
        }

        .statIcon {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #151a21;
          font-size: 17px;
        }

        .statLabel {
          margin-top: 17px;
          color: #69727e;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .statValue {
          margin-top: 5px;
          font-size: 25px;
          font-weight: 950;
        }

        .statDetail {
          margin-top: 4px;
          color: #59626e;
          font-size: 9px;
        }

        .statAction {
          display: block;
          margin-top: 15px;
          color: #ff6a00;
          font-size: 9px;
          font-weight: 900;
        }

        /* ============================================
           SECTION
        ============================================ */

        .sectionBlock {
          margin-top: 34px;
        }

        .sectionHeading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 14px;
        }

        .sectionHeading h2 {
          margin: 5px 0 0;
          font-size: 21px;
        }

        .sectionHeading p {
          margin: 5px 0 0;
          color: #68717e;
          font-size: 10px;
        }

        /* ============================================
           FEATURED TOURNAMENT
        ============================================ */

        .featuredTournament {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          overflow: hidden;
          border: 1px solid #292d34;
          border-radius: 15px;
          background: #0b0f14;
        }

        .tournamentVisual {
          position: relative;
          min-height: 280px;
          display: flex;
          flex-direction: column;
          justify-content: end;
          padding: 24px;
          background:
            url("https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=85")
            center / cover;
        }

        .tournamentImageOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.1),
              rgba(0, 0, 0, 0.9)
            );
        }

        .tournamentGameTag,
        .liveTag {
          position: relative;
          z-index: 2;
          width: fit-content;
          padding: 6px 8px;
          border-radius: 5px;
          background: #ff5a00;
          font-size: 8px;
          font-weight: 900;
        }

        .tournamentVisualTitle {
          position: relative;
          z-index: 2;
          margin-top: 9px;
          font-size: 27px;
          font-weight: 950;
        }

        .tournamentInfo {
          padding: 32px;
        }

        .liveTag {
          color: #fff;
          background: #143b23;
          border: 1px solid #235e38;
        }

        .tournamentInfo h2 {
          margin: 16px 0 8px;
          font-size: 27px;
        }

        .tournamentInfo p {
          max-width: 550px;
          color: #77808d;
          line-height: 1.6;
          font-size: 12px;
        }

        .tournamentMeta {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 8px;
          margin: 22px 0;
        }

        .metaItem {
          padding: 13px;
          border: 1px solid #242a32;
          border-radius: 9px;
          background: #080b0f;
        }

        .metaItem span {
          display: block;
          color: #69727e;
          font-size: 9px;
        }

        .metaItem strong {
          display: block;
          margin-top: 5px;
          font-size: 14px;
        }

        /* ============================================
           EMPTY STATE
        ============================================ */

        .emptyState {
          padding: 45px 25px;
          border: 1px dashed #303640;
          border-radius: 14px;
          background: #090d12;
          text-align: center;
        }

        .emptyStateIcon {
          font-size: 32px;
        }

        .emptyState h3 {
          margin: 12px 0 5px;
          font-size: 17px;
        }

        .emptyState p {
          margin: 0;
          color: #69727e;
          font-size: 11px;
        }

        /* ============================================
           RESULTS
        ============================================ */

        .resultGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .resultCard {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px;
          border: 1px solid #252b34;
          border-radius: 12px;
          background: #0b0f14;
        }

        .resultIcon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #151a21;
          font-size: 20px;
        }

        .resultCard h3 {
          margin: 0;
          font-size: 12px;
        }

        .resultCard p {
          margin: 5px 0 0;
          color: #69727e;
          font-size: 9px;
        }

        /* ============================================
           PERFORMANCE
        ============================================ */

        .performanceGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .performanceCard {
          padding: 19px;
          border: 1px solid #252b34;
          border-radius: 13px;
          background: #0b0f14;
        }

        .performanceCard span {
          color: #69727e;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .performanceCard strong {
          display: block;
          margin: 12px 0;
          font-size: 25px;
        }

        .performanceTrack {
          height: 5px;
          overflow: hidden;
          border-radius: 99px;
          background: #20252d;
        }

        .performanceFill {
          height: 100%;
          border-radius: 99px;
          background:
            linear-gradient(
              90deg,
              #ff8500,
              #ff4d00
            );
        }

        /* ============================================
           LEVEL
        ============================================ */

        .levelCard {
          display: flex;
          align-items: center;
          gap: 22px;
          margin-top: 34px;
          padding: 22px;
          border: 1px solid #302a25;
          border-radius: 14px;
          background:
            linear-gradient(
              100deg,
              #140d09,
              #0b0f14
            );
        }

        .levelBadge {
          width: 72px;
          height: 72px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid #633719;
          border-radius: 17px;
          background: #1b100a;
          color: #ff6a00;
          font-size: 9px;
          font-weight: 900;
        }

        .levelBadge strong {
          margin-top: 2px;
          font-size: 25px;
        }

        .levelContent {
          flex: 1;
        }

        .levelTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .levelTop span {
          color: #69727e;
          font-size: 8px;
          letter-spacing: 1.5px;
        }

        .levelTop h3 {
          margin: 5px 0 0;
          font-size: 17px;
        }

        .levelTop strong {
          color: #ff6a00;
          font-size: 10px;
        }

        .progressTrack {
          height: 7px;
          margin: 13px 0 7px;
          overflow: hidden;
          border-radius: 99px;
          background: #242930;
        }

        .progressFill {
          height: 100%;
          border-radius: 99px;
          background:
            linear-gradient(
              90deg,
              #ff8a00,
              #ff4d00
            );
        }

        .levelContent small {
          color: #59626e;
          font-size: 8px;
        }

        /* ============================================
           STREAK
        ============================================ */

        .streakCard {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: 12px;
          padding: 20px;
          border: 1px solid #302720;
          border-radius: 13px;
          background: #0d0f12;
        }

        .streakIcon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #21130b;
          font-size: 25px;
        }

        .streakCard span {
          display: block;
          color: #69727e;
          font-size: 8px;
          letter-spacing: 1.4px;
        }

        .streakCard strong {
          display: block;
          margin-top: 5px;
          font-size: 20px;
        }

        .streakCard p {
          margin: 4px 0 0;
          color: #69727e;
          font-size: 9px;
        }

        /* ============================================
           GAMES
        ============================================ */

        .gameGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .gameCard {
          position: relative;
          min-height: 145px;
          overflow: hidden;
          padding: 19px;
          border: 1px solid #292e36;
          border-radius: 14px;
          background:
            linear-gradient(
              145deg,
              #11161d,
              #080b0f
            );
          cursor: pointer;
          transition:
            transform 0.25s,
            border-color 0.25s;
        }

        .gameCard:hover {
          transform: translateY(-4px);
          border-color: #54402e;
        }

        .gameCardIcon {
          font-size: 27px;
        }

        .gameCard h3 {
          margin: 25px 0 4px;
          font-size: 15px;
        }

        .gameCard p {
          margin: 0;
          color: #68717d;
          font-size: 9px;
        }

        .gameCardArrow {
          position: absolute;
          right: 17px;
          bottom: 17px;
          color: #ff6a00;
        }

        /* ============================================
           RECOMMENDATIONS
        ============================================ */

        .recommendGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .recommendCard {
          overflow: hidden;
          border: 1px solid #292e36;
          border-radius: 13px;
          background: #0b0f14;
        }

        .recommendImage {
          height: 105px;
          background:
            url("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=700&q=80")
            center / cover;
          position: relative;
        }

        .recommendOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              transparent,
              rgba(0,0,0,.85)
            );
        }

        .recommendBody {
          padding: 15px;
        }

        .recommendGame {
          color: #ff6a00;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .recommendBody h3 {
          margin: 6px 0;
          font-size: 14px;
        }

        .recommendStatus {
          color: #69727e;
          font-size: 9px;
        }

        /* ============================================
           REWARDS
        ============================================ */

        .rewardGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .rewardCard {
          padding: 20px;
          border: 1px solid #292e36;
          border-radius: 13px;
          background: #0b0f14;
        }

        .rewardIcon {
          font-size: 25px;
        }

        .rewardCard h3 {
          margin: 15px 0 6px;
          font-size: 14px;
        }

        .rewardCard p {
          margin: 0;
          color: #69727e;
          font-size: 10px;
          line-height: 1.5;
        }

        /* ============================================
           REFERRAL
        ============================================ */

        .referralCard {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          margin-top: 34px;
          padding: 28px;
          border: 1px solid #302920;
          border-radius: 15px;
          background:
            linear-gradient(
              115deg,
              #15100c,
              #0b0f14
            );
        }

        .referralCard h2 {
          margin: 7px 0;
          font-size: 25px;
        }

        .referralCard p {
          max-width: 550px;
          margin: 0;
          color: #69727e;
          font-size: 10px;
          line-height: 1.6;
        }

        .referralBox {
          min-width: 230px;
          padding: 17px;
          border: 1px solid #3a3029;
          border-radius: 11px;
          background: #090b0f;
        }

        .referralBox span {
          display: block;
          color: #69727e;
          font-size: 8px;
        }

        .referralBox strong {
          display: block;
          margin: 7px 0 12px;
          color: #ff6a00;
          font-size: 14px;
          letter-spacing: 1px;
        }

        .copyButton {
          width: 100%;
          padding: 9px;
          border: 1px solid #493020;
          border-radius: 7px;
          background: #1b110b;
          color: #ff6a00;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
        }

        /* ============================================
           NOTIFICATIONS
        ============================================ */

        .notificationList {
          display: grid;
          gap: 8px;
        }

        .notificationItem {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          border: 1px solid #242a32;
          border-radius: 10px;
          background: #0b0f14;
        }

        .notificationIcon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #151a21;
        }

        .notificationItem h4 {
          margin: 0;
          font-size: 11px;
        }

        .notificationItem p {
          margin: 4px 0 0;
          color: #69727e;
          font-size: 9px;
        }

        /* ============================================
           ACTIVITY
        ============================================ */

        .activityTimeline {
          position: relative;
          display: grid;
          gap: 10px;
        }

        .activityItem {
          display: flex;
          gap: 13px;
          padding: 14px;
          border-left: 2px solid #2d211a;
          background: #0b0f14;
        }

        .activityIcon {
          font-size: 17px;
        }

        .activityItem h4 {
          margin: 0;
          font-size: 11px;
        }

        .activityItem p {
          margin: 4px 0 0;
          color: #69727e;
          font-size: 9px;
        }

        /* ============================================
           ACHIEVEMENTS
        ============================================ */

        .achievementGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .achievementCard {
          padding: 20px 15px;
          border: 1px solid #242a32;
          border-radius: 12px;
          background: #0b0f14;
          text-align: center;
        }

        .achievementIcon {
          font-size: 28px;
          filter: grayscale(1);
          opacity: 0.35;
        }

        .achievementCard.unlocked .achievementIcon {
          filter: none;
          opacity: 1;
        }

        .achievementCard h4 {
          margin: 12px 0 0;
          font-size: 10px;
        }

        .achievementCard span {
          display: block;
          margin-top: 5px;
          color: #59626e;
          font-size: 8px;
        }

        /* ============================================
           SUPPORT
        ============================================ */

        .supportCard {
          display: flex;
          align-items: center;
          gap: 17px;
          margin-top: 34px;
          padding: 22px;
          border: 1px solid #292e36;
          border-radius: 14px;
          background: #0b0f14;
        }

        .supportIcon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #171b22;
          font-size: 23px;
        }

        .supportContent {
          flex: 1;
        }

        .supportContent span {
          color: #ff6a00;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .supportContent h2 {
          margin: 5px 0;
          font-size: 17px;
        }

        .supportContent p {
          margin: 0;
          color: #69727e;
          font-size: 9px;
        }

        /* ============================================
           SECURITY
        ============================================ */

        .securityCard {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 12px;
          padding: 20px;
          border: 1px solid #1e3427;
          border-radius: 13px;
          background: #09120d;
        }

        .securityCard h2 {
          margin: 6px 0;
          font-size: 15px;
        }

        .securityCard p {
          margin: 0;
          color: #667168;
          font-size: 9px;
          overflow-wrap: anywhere;
        }

        .securityStatus {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #7bc98e;
          font-size: 10px;
          font-weight: 800;
        }

        /* ============================================
           FOOTER
        ============================================ */

        .dashboardFooter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 45px;
          padding: 25px 0;
          border-top: 1px solid #20252d;
          color: #56606c;
          font-size: 9px;
        }

        .dashboardFooter strong,
        .dashboardFooter span {
          display: block;
        }

        .dashboardFooter strong {
          color: #a0a7b1;
          font-size: 11px;
        }

        .dashboardFooter span {
          margin-top: 4px;
        }

        .footerLinks {
          display: flex;
          gap: 15px;
        }

        .footerLinks button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #69727e;
          cursor: pointer;
          font-size: 9px;
        }

        /* ============================================
           LOADING
        ============================================ */

        .loadingScreen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #05070a;
          color: #fff;
        }

        .loadingBox {
          width: min(90%, 380px);
          padding: 35px;
          border: 1px solid #252a32;
          border-radius: 18px;
          background: #0b0e13;
          text-align: center;
        }

        .loadingLogo {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          border-radius: 15px;
          background: #ff5a00;
          font-weight: 1000;
        }

        .loadingBox h2 {
          margin: 0;
          font-size: 20px;
        }

        .loadingBox p {
          color: #69727e;
          font-size: 10px;
        }

        .loadingTrack {
          height: 5px;
          overflow: hidden;
          margin-top: 20px;
          border-radius: 99px;
          background: #20252d;
        }

        .loadingBar {
          width: 45%;
          height: 100%;
          border-radius: 99px;
          background: #ff5a00;
          animation: loadingMove 1.1s ease-in-out infinite;
        }

        /* ============================================
           ANIMATIONS
        ============================================ */

        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(1);
          }

          50% {
            opacity: 0.9;
            transform: scale(1.1);
          }
        }

        @keyframes heroFloat {
          0%,
          100% {
            transform:
              perspective(900px)
              rotateY(-5deg)
              translateY(0);
          }

          50% {
            transform:
              perspective(900px)
              rotateY(-5deg)
              translateY(-6px);
          }
        }

        @keyframes loadingMove {
          0% {
            transform: translateX(-120%);
          }

          100% {
            transform: translateX(300%);
          }
        }

        /* ============================================
           RESPONSIVE
        ============================================ */

        @media (max-width: 1150px) {

          .dashboardLayout {
            grid-template-columns: 200px minmax(0, 1fr);
          }

          .statsGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .gameGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .achievementGrid {
            grid-template-columns: repeat(2, 1fr);
          }

        }

        @media (max-width: 850px) {

          .topNavbar {
            padding: 0 15px;
          }

          .desktopTopNav,
          .topProfile {
            display: none;
          }

          .mobileMenuButton {
            display: block;
          }

          .mobileMenu {
            position: fixed;
            top: 72px;
            right: 12px;
            z-index: 150;
            width: 210px;
            display: grid;
            padding: 8px;
            border: 1px solid #303640;
            border-radius: 12px;
            background: #0b0f14;
            box-shadow:
              0 25px 60px rgba(0, 0, 0, 0.5);
          }

          .mobileMenu button {
            padding: 12px;
            border: 0;
            border-radius: 8px;
            background: transparent;
            color: #fff;
            cursor: pointer;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
          }

          .mobileMenu button:hover {
            background: #151a21;
          }

          .sidebar {
            display: none;
          }

          .dashboardLayout {
            display: block;
          }

          .mainContent {
            padding: 18px;
          }

          .welcomeHero {
            grid-template-columns: 1fr;
          }

          .heroContent {
            padding: 30px;
          }

          .heroVisual {
            min-height: 230px;
          }

          .heroImageCard {
            inset: 12px 20px 20px;
          }

          .featuredTournament {
            grid-template-columns: 1fr;
          }

          .tournamentVisual {
            min-height: 210px;
          }

          .recommendGrid {
            grid-template-columns: 1fr;
          }

          .rewardGrid {
            grid-template-columns: 1fr;
          }

          .referralCard {
            flex-direction: column;
            align-items: stretch;
          }

          .referralBox {
            min-width: 0;
          }

          .supportCard {
            flex-wrap: wrap;
          }

        }

        @media (max-width: 560px) {

          .brandSub {
            display: none;
          }

          .notificationButton {
            width: 37px;
            height: 37px;
          }

          .mainContent {
            padding: 12px;
          }

          .welcomeHero {
            border-radius: 15px;
          }

          .heroContent {
            padding: 24px 20px;
          }

          .heroContent h1 {
            font-size: 36px;
          }

          .heroContent p {
            font-size: 11px;
          }

          .heroVisual {
            min-height: 195px;
          }

          .statsGrid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .statCard {
            padding: 14px;
          }

          .statValue {
            font-size: 21px;
          }

          .tournamentInfo {
            padding: 22px;
          }

          .tournamentInfo h2 {
            font-size: 21px;
          }

          .tournamentMeta {
            grid-template-columns: 1fr;
          }

          .resultGrid {
            grid-template-columns: 1fr;
          }

          .performanceGrid {
            grid-template-columns: 1fr 1fr;
          }

          .levelCard {
            align-items: flex-start;
          }

          .levelTop {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
          }

          .gameGrid {
            grid-template-columns: 1fr 1fr;
          }

          .gameCard {
            min-height: 125px;
            padding: 15px;
          }

          .achievementGrid {
            grid-template-columns: 1fr 1fr;
          }

          .securityCard {
            align-items: flex-start;
            flex-direction: column;
          }

          .dashboardFooter {
            align-items: flex-start;
            flex-direction: column;
          }

          .footerLinks {
            flex-wrap: wrap;
          }

        }

      `}</style>

    </main>
  );
}


/* ============================================================
   COMPONENTS
============================================================ */

function LoadingScreen() {
  return (
    <main className="loadingScreen">

      <div className="loadingBox">

        <div className="loadingLogo">
          P2P
        </div>

        <h2>
          Loading Dashboard
        </h2>

        <p>
          Preparing your player command center...
        </p>

        <div className="loadingTrack">
          <div className="loadingBar"></div>
        </div>

      </div>

    </main>
  );
}


function SideNav({
  icon,
  label,
  active,
  onClick,
}) {
  return (
    <button
      className={`sideNavItem ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      <span className="sideNavIcon">
        {icon}
      </span>

      <span>
        {label}
      </span>
    </button>
  );
}


function StatCard({
  icon,
  label,
  value,
  detail,
  action,
  onClick,
}) {
  return (
    <button
      className="statCard"
      onClick={onClick}
    >

      <div className="statIcon">
        {icon}
      </div>

      <div className="statLabel">
        {label}
      </div>

      <div className="statValue">
        {value}
      </div>

      <div className="statDetail">
        {detail}
      </div>

      <span className="statAction">
        {action} →
      </span>

    </button>
  );
}


function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="sectionHeading">

      <div>

        <div className="sectionEyebrow">
          {eyebrow}
        </div>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

      </div>

    </div>
  );
}


function MetaItem({
  label,
  value,
}) {
  return (
    <div className="metaItem">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div className="emptyState">

      <div className="emptyStateIcon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}


function ResultCard({
  icon,
  title,
  subtitle,
}) {
  return (
    <div className="resultCard">

      <div className="resultIcon">
        {icon}
      </div>

      <div>
        <h3>
          {title}
        </h3>

        <p>
          {subtitle}
        </p>
      </div>

    </div>
  );
}


function PerformanceCard({
  title,
  value,
  progress,
}) {
  return (
    <div className="performanceCard">

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

      <div className="performanceTrack">

        <div
          className="performanceFill"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

    </div>
  );
}


function GameCard({
  title,
  subtitle,
  icon,
}) {
  return (
    <div className="gameCard">

      <div className="gameCardIcon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {subtitle}
      </p>

      <div className="gameCardArrow">
        →
      </div>

    </div>
  );
}


function RecommendationCard({
  game,
  title,
  status,
}) {
  return (
    <div className="recommendCard">

      <div className="recommendImage">

        <div className="recommendOverlay"></div>

      </div>

      <div className="recommendBody">

        <div className="recommendGame">
          {game}
        </div>

        <h3>
          {title}
        </h3>

        <div className="recommendStatus">
          {status}
        </div>

      </div>

    </div>
  );
}


function RewardCard({
  icon,
  title,
  text,
}) {
  return (
    <div className="rewardCard">

      <div className="rewardIcon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}


function NotificationItem({
  icon,
  title,
  text,
}) {
  return (
    <div className="notificationItem">

      <div className="notificationIcon">
        {icon}
      </div>

      <div>

        <h4>
          {title}
        </h4>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}


function ActivityItem({
  icon,
  title,
  text,
}) {
  return (
    <div className="activityItem">

      <div className="activityIcon">
        {icon}
      </div>

      <div>

        <h4>
          {title}
        </h4>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}


function Achievement({
  icon,
  title,
  locked,
}) {
  return (
    <div
      className={`achievementCard ${
        locked ? "" : "unlocked"
      }`}
    >

      <div className="achievementIcon">
        {icon}
      </div>

      <h4>
        {title}
      </h4>

      <span>
        {locked ? "Locked" : "Unlocked"}
      </span>

    </div>
  );
}
