"use client";

import { useState } from "react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");

  const walletBalance = "₹0";

  const games = [
    {
      id: 1,
      name: "FREE FIRE",
      subtitle: "Battle Royale",
      status: "LIVE",
      active: true,
      className: "freefire",
    },
    {
      id: 2,
      name: "BGMI",
      subtitle: "Coming Soon",
      status: "SOON",
      active: false,
      className: "bgmi",
    },
    {
      id: 3,
      name: "MORE GAMES",
      subtitle: "New games coming soon",
      status: "SOON",
      active: false,
      className: "moregame",
    },
  ];

  const tournaments = [
    {
      id: 1,
      game: "FREE FIRE",
      title: "Bermuda • Solo",
      type: "SOLO",
      date: "Today",
      time: "6:00 PM",
      entry: "₹30",
      perKill: "₹5",
      prize: "₹500",
      joined: 37,
      capacity: 48,
    },
    {
      id: 2,
      game: "FREE FIRE",
      title: "Bermuda • Solo",
      type: "SOLO",
      date: "Today",
      time: "11:30 PM",
      entry: "₹30",
      perKill: "₹5",
      prize: "₹500",
      joined: 21,
      capacity: 48,
    },
  ];

  const routes = {
    home: "/",
    tournaments: "/tournaments",
    matches: "/matches",
    wallet: "/wallet",
    profile: "/profile",
  };

  function handleNav(tab) {
    setActiveTab(tab);

    if (routes[tab]) {
      window.location.href = routes[tab];
    }
  }

  function handleGame(game) {
    if (!game.active) {
      alert(`${game.name} tournaments will be available soon.`);
      return;
    }

    window.location.href = "/tournaments";
  }

  function joinTournament(tournament) {
    alert(
      `${tournament.title}\n${tournament.time}\n\nLogin / Join system next step me connect hoga.`
    );
  }

  return (
    <div className="site-shell">
      {/* ================= HEADER ================= */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">P2P</div>

          <div className="brand-copy">
            <h1>Play2Prove</h1>
            <p>PLAY • COMPETE • EARN • PROVE</p>
          </div>
        </div>

        <div className="header-actions">
          {/* SMALL WALLET */}
          <button
            className="mini-wallet"
            onClick={() => handleNav("wallet")}
          >
            <span className="wallet-icon">◆</span>

            <span className="wallet-info">
              <small>WALLET</small>
              <strong>{walletBalance}</strong>
            </span>
          </button>

          {/* PROFILE */}
          <button
            className="profile-button"
            onClick={() => handleNav("profile")}
            aria-label="Profile"
          >
            <span>👤</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* ================= HERO ================= */}
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="hero-content">
            <span className="live-badge">
              <i /> GAMING TOURNAMENT PLATFORM
            </span>

            <h2>
              PLAY.
              <br />
              COMPETE.
              <br />
              <span>PROVE.</span>
            </h2>

            <p>
              Join competitive gaming tournaments, show your skills and earn
              rewards.
            </p>

            <div className="hero-buttons">
  <button
    className="primary-button"
    onClick={() => handleNav("tournaments")}
  >
    EXPLORE TOURNAMENTS
    <span>→</span>
  </button>
</div>
          </div>

          <div className="hero-art">
            <div className="hero-art-ring ring-one" />
            <div className="hero-art-ring ring-two" />
            <div className="hero-art-text">P2P</div>
            <div className="hero-art-label">COMPETE</div>
          </div>
        </section>

        {/* ================= GAMES ================= */}
        <section className="section" id="games">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CHOOSE YOUR GAME</span>
              <h3>Games</h3>
            </div>

            <span className="section-small">More coming soon</span>
          </div>

          <div className="games-grid">
            {games.map((game) => (
              <button
                key={game.id}
                className={`game-card ${game.className}`}
                onClick={() => handleGame(game)}
              >
                <div className="game-card-top">
                  <span
                    className={
                      game.active
                        ? "status status-live"
                        : "status status-soon"
                    }
                  >
                    {game.status}
                  </span>

                  <span className="game-arrow">↗</span>
                </div>

                <div className="game-visual">
                  <div className="game-visual-glow" />
                  <span>
                    {game.name === "FREE FIRE"
                      ? "FF"
                      : game.name === "BGMI"
                      ? "BG"
                      : "+"}
                  </span>
                </div>

                <div className="game-info">
                  <h4>{game.name}</h4>
                  <p>{game.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ================= UPCOMING TOURNAMENTS ================= */}
        <section className="section" id="tournaments">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PLAY NOW</span>
              <h3>Upcoming Tournaments</h3>
            </div>

            <button
              className="text-button"
              onClick={() => handleNav("tournaments")}
            >
              VIEW ALL →
            </button>
          </div>

          <div className="tournament-grid">
            {tournaments.map((tournament) => {
              const percentage =
                (tournament.joined / tournament.capacity) * 100;

              return (
                <article className="tournament-card" key={tournament.id}>
                  <div className="card-shine" />

                  <div className="tournament-top">
                    <div>
                      <span className="game-label">{tournament.game}</span>

                      <h4>{tournament.title}</h4>

                      <p>{tournament.type} MATCH</p>
                    </div>

                    <span className="open-badge">
                      <i />
                      OPEN
                    </span>
                  </div>

                  <div className="match-time">
                    <div>
                      <span>DATE</span>
                      <strong>{tournament.date}</strong>
                    </div>

                    <div>
                      <span>START TIME</span>
                      <strong>{tournament.time}</strong>
                    </div>
                  </div>

                  <div className="prize-grid">
                    <div>
                      <span>ENTRY</span>
                      <strong>{tournament.entry}</strong>
                    </div>

                    <div>
                      <span>PER KILL</span>
                      <strong>{tournament.perKill}</strong>
                    </div>

                    <div>
                      <span>PRIZE POOL</span>
                      <strong className="orange-text">
                        {tournament.prize}
                      </strong>
                    </div>
                  </div>

                  <div className="players-row">
                    <span>Players Joined</span>

                    <strong>
                      {tournament.joined}/{tournament.capacity}
                    </strong>
                  </div>

                  <div className="progress">
                    <div
                      className="progress-value"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <button
                    className="join-button"
                    onClick={() => joinTournament(tournament)}
                  >
                    JOIN {tournament.entry}
                    <span>→</span>
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {/* ================= TOURNAMENT OVERVIEW ================= */}
        <section className="section overview-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">KNOW BEFORE YOU JOIN</span>
              <h3>Tournament Overview</h3>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-card overview-main">
              <span className="overview-number">01</span>

              <div>
                <span className="overview-tag">UPCOMING MATCHES</span>
                <h4>Compete. Perform. Prove.</h4>

                <p>
                  Choose your game, select an available tournament and enter
                  the match. Tournament details, entry fee, prize pool and
                  match timing are shown before you join.
                </p>

                <button
                  className="outline-button"
                  onClick={() => handleNav("tournaments")}
                >
                  VIEW TOURNAMENTS →
                </button>
              </div>
            </div>

            <div className="overview-card">
              <span className="overview-number">02</span>
              <span className="overview-tag">MATCH DETAILS</span>

              <h4>Clear information</h4>

              <ul>
                <li>Entry fee</li>
                <li>Per-kill reward</li>
                <li>Prize pool</li>
                <li>Match timing</li>
                <li>Player capacity</li>
              </ul>
            </div>

            <div className="overview-card">
              <span className="overview-number">03</span>
              <span className="overview-tag">RESULTS & REWARDS</span>

              <h4>Play for the win</h4>

              <p>
                Results are processed according to the tournament rules and
                eligible rewards are credited to the player's wallet.
              </p>
            </div>
          </div>
        </section>

        {/* ================= RULES ================= */}
        <section className="section info-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PLAY FAIR</span>
              <h3>Rules</h3>
            </div>
          </div>

          <div className="rules-grid">
            <div className="rule-card">
              <span>01</span>
              <div>
                <h4>One Player, One Entry</h4>
                <p>
                  Players must use their own registered account and valid game
                  details.
                </p>
              </div>
            </div>

            <div className="rule-card">
              <span>02</span>
              <div>
                <h4>Fair Play</h4>
                <p>
                  Any cheating, hacking, exploiting or unfair gameplay may
                  result in disqualification.
                </p>
              </div>
            </div>

            <div className="rule-card">
              <span>03</span>
              <div>
                <h4>Correct Game Details</h4>
                <p>
                  Players are responsible for providing correct in-game
                  username and game information.
                </p>
              </div>
            </div>

            <div className="rule-card">
              <span>04</span>
              <div>
                <h4>Results</h4>
                <p>
                  Tournament results and rewards are processed according to
                  the applicable tournament rules.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TERMS ================= */}
        <section className="section terms-section">
          <div className="terms-card">
            <div className="terms-icon">§</div>

            <div className="terms-content">
              <span className="eyebrow">IMPORTANT INFORMATION</span>

              <h3>Terms & Conditions</h3>

              <p>
                By participating in Play2Prove tournaments, players agree to
                follow the platform rules, tournament-specific conditions and
                fair-play requirements.
              </p>

              <div className="terms-links">
                <button>Terms of Use →</button>
                <button>Privacy Policy →</button>
                <button>Responsible Play →</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= BOTTOM NAV ================= */}
      <nav className="bottom-nav">
        <button
          className={activeTab === "home" ? "nav-active" : ""}
          onClick={() => handleNav("home")}
        >
          <span>⌂</span>
          HOME
        </button>

        <button
          className={activeTab === "tournaments" ? "nav-active" : ""}
          onClick={() => handleNav("tournaments")}
        >
          <span>♛</span>
          TOURNAMENTS
        </button>

        <button
          className={activeTab === "matches" ? "nav-active" : ""}
          onClick={() => handleNav("matches")}
        >
          <span>⚔</span>
          MATCHES
        </button>

        <button
          className={activeTab === "wallet" ? "nav-active" : ""}
          onClick={() => handleNav("wallet")}
        >
          <span>▣</span>
          WALLET
        </button>

        <button
          className={activeTab === "profile" ? "nav-active" : ""}
          onClick={() => handleNav("profile")}
        >
          <span>○</span>
          PROFILE
        </button>
      </nav>
    </div>
  );
}
