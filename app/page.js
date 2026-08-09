"use client";

import { useState } from "react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");

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
      subtitle: "More games will be added",
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

  function handleGame(game) {
    if (!game.active) {
      alert(`${game.name} tournaments will be available soon.`);
      return;
    }

    document
      .getElementById("tournaments")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function joinTournament(tournament) {
    alert(
      `${tournament.title}\n${tournament.time}\n\nLogin / Join system next step me connect hoga.`
    );
  }

 function handleNav(tab) {
  setActiveTab(tab);

  const routes = {
    home: "/",
    tournaments: "/tournaments",
    matches: "/matches",
    wallet: "/wallet",
    profile: "/profile",
  };

  if (routes[tab]) {
    window.location.href = routes[tab];
  }
}

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">P2P</div>

          <div>
            <h1>Play2Prove</h1>
            <p>PLAY • COMPETE • EARN • PROVE</p>
          </div>
        </div>

        <button
          className="profile-button"
          onClick={() => handleNav("profile")}
          aria-label="Profile"
        >
          👤
        </button>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="hero-content">
            <span className="live-badge">● GAMING TOURNAMENT PLATFORM</span>

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

            <button
              className="primary-button"
              onClick={() =>
                window.location.href = "/tournaments";
              }
            >
              EXPLORE GAMES →
            </button>
          </div>

          <div className="hero-art">P2P</div>
        </section>

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
                      game.active ? "status status-live" : "status status-soon"
                    }
                  >
                    {game.status}
                  </span>

                  <span className="game-arrow">↗</span>
                </div>

                <div className="game-visual">
                  <span>{game.name.substring(0, 2)}</span>
                </div>

                <div className="game-info">
                  <h4>{game.name}</h4>
                  <p>{game.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="section" id="tournaments">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PLAY NOW</span>
              <h3>Upcoming Tournaments</h3>
            </div>

            <button className="text-button">View All</button>
          </div>

          <div className="tournament-grid">
            {tournaments.map((tournament) => {
              const percentage =
                (tournament.joined / tournament.capacity) * 100;

              return (
                <article className="tournament-card" key={tournament.id}>
                  <div className="tournament-top">
                    <div>
                      <span className="game-label">{tournament.game}</span>
                      <h4>{tournament.title}</h4>
                      <p>{tournament.type} MATCH</p>
                    </div>

                    <span className="open-badge">OPEN</span>
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
                      <span>PRIZE</span>
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
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section" id="my-matches">
          <button
            className="my-matches"
            onClick={() =>
              alert("Joined matches customer login ke baad yahan dikhenge.")
            }
          >
            <div className="match-icon">🎮</div>

            <div>
              <h4>My Matches</h4>
              <p>Joined matches, room details and live results</p>
            </div>

            <span>→</span>
          </button>
        </section>

        <section className="section">
          <span className="eyebrow">SIMPLE & FAST</span>
          <h3>How Play2Prove Works</h3>

          <div className="steps-grid">
            <div className="step-card">
              <strong>01</strong>
              <span>JOIN</span>
              <p>Select your tournament</p>
            </div>

            <div className="step-card">
              <strong>02</strong>
              <span>PLAY</span>
              <p>Enter room & compete</p>
            </div>

            <div className="step-card">
              <strong>03</strong>
              <span>WIN</span>
              <p>Results are calculated</p>
            </div>

            <div className="step-card">
              <strong>04</strong>
              <span>EARN</span>
              <p>Reward goes to wallet</p>
            </div>
          </div>
        </section>

        <section className="future-box">
          <div>
            <span className="eyebrow">BUILT TO EXPAND</span>
            <h3>More Games. More Tournaments.</h3>
            <p>
              Play2Prove is being built so new games and tournament formats can
              be added without redesigning the complete platform.
            </p>
          </div>

          <div className="future-number">∞</div>
        </section>
      </main>

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
