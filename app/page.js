// ============================================
// PLAY2PROVE - HOME PAGE
// FILE: app/page.js
// REMOVE: Purana page.js ka poora code
// PASTE: Ye poora code line 1 se
// ============================================

const tournaments = [
  {
    id: "FF-BER-SOLO-001",
    map: "Bermuda",
    mode: "Solo",
    date: "Today",
    time: "8:00 PM",
    entryFee: 30,
    perKill: 5,
    prize: 500,
    joined: 37,
    capacity: 48,
  },
  {
    id: "FF-BER-SOLO-002",
    map: "Bermuda",
    mode: "Solo",
    date: "Today",
    time: "10:00 PM",
    entryFee: 30,
    perKill: 5,
    prize: 500,
    joined: 21,
    capacity: 48,
  },
];

export default function HomePage() {
  return (
    <main className="home-page">

      {/* ========================================
          START - TOP HEADER
      ======================================== */}

      <header className="top-header">
        <div>
          <div className="brand">Play2Prove</div>
          <div className="tagline">
            PLAY • COMPETE • EARN • PROVE
          </div>
        </div>

        <button className="profile-button">
          👤
        </button>
      </header>

      {/* ========================================
          END - TOP HEADER
      ======================================== */}


      {/* ========================================
          START - FREE FIRE HERO
      ======================================== */}

      <section className="game-hero">

        <div className="game-badge">
          LIVE TOURNAMENTS
        </div>

        <h1>FREE FIRE</h1>

        <p>
          Play. Compete. Earn. Prove Your Skill.
        </p>

        <button className="hero-button">
          VIEW TOURNAMENTS
        </button>

      </section>

      {/* ========================================
          END - FREE FIRE HERO
      ======================================== */}


      {/* ========================================
          START - TOURNAMENT SECTION
      ======================================== */}

      <section className="tournament-section">

        <div className="section-heading">

          <div>
            <span className="small-heading">
              PLAY NOW
            </span>

            <h2>Upcoming Tournaments</h2>
          </div>

          <button className="view-all">
            View All
          </button>

        </div>


        <div className="tournament-list">

          {tournaments.map((tournament) => {

            const percentage =
              (tournament.joined /
                tournament.capacity) *
              100;

            return (

              <article
                className="tournament-card"
                key={tournament.id}
              >

                {/* MATCH TOP */}

                <div className="match-top">

                  <div>

                    <span className="game-name">
                      FREE FIRE
                    </span>

                    <h3>
                      {tournament.map} •{" "}
                      {tournament.mode}
                    </h3>

                    <span className="match-id">
                      {tournament.id}
                    </span>

                  </div>

                  <div className="match-status">
                    OPEN
                  </div>

                </div>


                {/* DATE + TIME */}

                <div className="match-time">

                  <div>
                    <span>Date</span>
                    <strong>
                      {tournament.date}
                    </strong>
                  </div>

                  <div>
                    <span>Start Time</span>
                    <strong>
                      {tournament.time}
                    </strong>
                  </div>

                </div>


                {/* MONEY DETAILS */}

                <div className="money-grid">

                  <div>
                    <span>ENTRY</span>

                    <strong>
                      ₹{tournament.entryFee}
                    </strong>
                  </div>


                  <div>
                    <span>PER KILL</span>

                    <strong>
                      ₹{tournament.perKill}
                    </strong>
                  </div>


                  <div>
                    <span>PRIZE</span>

                    <strong>
                      ₹{tournament.prize}
                    </strong>
                  </div>

                </div>


                {/* PLAYER CAPACITY */}

                <div className="players-row">

                  <span>
                    Players Joined
                  </span>

                  <strong>
                    {tournament.joined}
                    /
                    {tournament.capacity}
                  </strong>

                </div>


                <div className="progress">

                  <div
                    className="progress-value"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                </div>


                {/* JOIN */}

                <button className="join-button">

                  JOIN ₹{tournament.entryFee}

                </button>

              </article>

            );

          })}

        </div>

      </section>

      {/* ========================================
          END - TOURNAMENT SECTION
      ======================================== */}


      {/* ========================================
          START - MY MATCHES
      ======================================== */}

      <section className="quick-card">

        <div className="quick-icon">
          🎮
        </div>

        <div>
          <h3>My Matches</h3>

          <p>
            Joined matches, room details
            and live results
          </p>
        </div>

        <span className="arrow">
          ›
        </span>

      </section>

      {/* ========================================
          END - MY MATCHES
      ======================================== */}


      {/* ========================================
          START - HOW IT WORKS
      ======================================== */}

      <section className="how-section">

        <span className="small-heading">
          SIMPLE & FAST
        </span>

        <h2>How Play2Prove Works</h2>


        <div className="steps">

          <div>
            <strong>01</strong>
            <span>JOIN</span>
          </div>

          <div>
            <strong>02</strong>
            <span>PLAY</span>
          </div>

          <div>
            <strong>03</strong>
            <span>WIN</span>
          </div>

          <div>
            <strong>04</strong>
            <span>EARN</span>
          </div>

        </div>

      </section>

      {/* ========================================
          END - HOW IT WORKS
      ======================================== */}


      {/* SPACE FOR FIXED NAV */}

      <div className="bottom-space" />


      {/* ========================================
          START - BOTTOM NAVIGATION
      ======================================== */}

      <nav className="bottom-nav">

        <button className="nav-active">
          <span>⌂</span>
          HOME
        </button>

        <button>
          <span>🏆</span>
          TOURNAMENTS
        </button>

        <button>
          <span>₹</span>
          EARN
        </button>

        <button>
          <span>▣</span>
          WALLET
        </button>

        <button>
          <span>○</span>
          PROFILE
        </button>

      </nav>

      {/* ========================================
          END - BOTTOM NAVIGATION
      ======================================== */}

    </main>
  );
}
