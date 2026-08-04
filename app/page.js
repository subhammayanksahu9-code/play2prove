// ======================================================
// START - PLAY2PROVE HOME PAGE
// Main public homepage of Play2Prove
// ======================================================

export default function HomePage() {
  return (
    <main>

      {/* ==================================================
          START - TOP NAVIGATION
          Future me header change/remove karna ho to
          START - TOP NAVIGATION se END tak edit karna
      ================================================== */}
      <header className="navbar">
        <div className="logo">
          PLAY<span>2</span>PROVE
        </div>

        <nav className="desktopNav">
          <a href="#tournaments">Tournaments</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#rewards">Rewards</a>
        </nav>

        <button className="loginButton">LOGIN</button>
      </header>
      {/* ================= END - TOP NAVIGATION ================= */}


      {/* ==================================================
          START - HERO SECTION
      ================================================== */}
      <section className="hero">

        <div className="heroBadge">
          COMPETE • WIN • PROVE
        </div>

        <h1>
          YOUR GAME.<br />
          YOUR SKILL.<br />
          <span>YOUR PROOF.</span>
        </h1>

        <p className="heroText">
          Compete against gamers, climb the leaderboard
          and turn your gaming skills into real achievements.
        </p>

        <div className="heroButtons">
          <a className="primaryButton" href="#tournaments">
            JOIN TOURNAMENT
          </a>

          <a className="secondaryButton" href="#how-it-works">
            HOW IT WORKS
          </a>
        </div>

        <div className="heroStats">

          <div>
            <strong>SOLO</strong>
            <span>Battle Alone</span>
          </div>

          <div>
            <strong>DUO</strong>
            <span>Play Together</span>
          </div>

          <div>
            <strong>SQUAD</strong>
            <span>Rule Together</span>
          </div>

        </div>
      </section>
      {/* ================= END - HERO SECTION ================= */}


      {/* ==================================================
          START - HOW IT WORKS
      ================================================== */}
      <section id="how-it-works" className="section">

        <div className="sectionHeading">
          <span>GET STARTED</span>
          <h2>HOW IT WORKS</h2>
          <p>Three simple steps. One battlefield.</p>
        </div>

        <div className="stepsGrid">

          <div className="stepCard">
            <div className="stepNumber">01</div>
            <h3>CHOOSE</h3>
            <p>
              Select an upcoming tournament and your
              preferred Solo, Duo or Squad mode.
            </p>
          </div>

          <div className="stepCard">
            <div className="stepNumber">02</div>
            <h3>COMPETE</h3>
            <p>
              Join the match, play fair and prove
              your skills against other players.
            </p>
          </div>

          <div className="stepCard">
            <div className="stepNumber">03</div>
            <h3>EARN</h3>
            <p>
              Perform, win rewards and build your
              Play2Prove gaming record.
            </p>
          </div>

        </div>
      </section>
      {/* ================= END - HOW IT WORKS ================= */}


      {/* ==================================================
          START - TOURNAMENT SECTION
      ================================================== */}
      <section id="tournaments" className="section tournamentSection">

        <div className="sectionHeading">
          <span>ENTER THE BATTLE</span>
          <h2>UPCOMING TOURNAMENTS</h2>
          <p>Choose your battlefield.</p>
        </div>


        {/* START - SOLO TOURNAMENT CARD */}
        <article className="tournamentCard">

          <div className="cardTop">
            <div>
              <span className="gameTag">FREE FIRE</span>
              <h3>BERMUDA SOLO BATTLE</h3>
            </div>

            <span className="statusTag">UPCOMING</span>
          </div>

          <div className="tournamentInfo">

            <div>
              <span>MODE</span>
              <strong>SOLO</strong>
            </div>

            <div>
              <span>ENTRY</span>
              <strong>₹100</strong>
            </div>

            <div>
              <span>PLAYERS</span>
              <strong>50</strong>
            </div>

            <div>
              <span>PER KILL</span>
              <strong>₹10</strong>
            </div>

          </div>

          <div className="prizeArea">
            <span>TOP PRIZES</span>
            <strong>🥇 ₹1,000 &nbsp; 🥈 ₹500 &nbsp; 🥉 ₹250</strong>
          </div>

          <button className="joinButton">
            VIEW TOURNAMENT
          </button>

        </article>
        {/* END - SOLO TOURNAMENT CARD */}


        {/* START - DUO TOURNAMENT CARD */}
        <article className="tournamentCard">

          <div className="cardTop">
            <div>
              <span className="gameTag">FREE FIRE</span>
              <h3>BERMUDA DUO BATTLE</h3>
            </div>

            <span className="statusTag">UPCOMING</span>
          </div>

          <div className="tournamentInfo">

            <div>
              <span>MODE</span>
              <strong>DUO</strong>
            </div>

            <div>
              <span>ENTRY</span>
              <strong>₹100 / PLAYER</strong>
            </div>

            <div>
              <span>PLAYERS</span>
              <strong>50</strong>
            </div>

            <div>
              <span>PER KILL</span>
              <strong>₹10</strong>
            </div>

          </div>

          <div className="prizeArea">
            <span>TOP PRIZES</span>
            <strong>🥇 ₹1,000 &nbsp; 🥈 ₹500 &nbsp; 🥉 ₹250</strong>
          </div>

          <button className="joinButton">
            VIEW TOURNAMENT
          </button>

        </article>
        {/* END - DUO TOURNAMENT CARD */}


        {/* START - SQUAD TOURNAMENT CARD */}
        <article className="tournamentCard">

          <div className="cardTop">
            <div>
              <span className="gameTag">FREE FIRE</span>
              <h3>BERMUDA SQUAD BATTLE</h3>
            </div>

            <span className="statusTag">UPCOMING</span>
          </div>

          <div className="tournamentInfo">

            <div>
              <span>MODE</span>
              <strong>SQUAD</strong>
            </div>

            <div>
              <span>ENTRY</span>
              <strong>₹100 / PLAYER</strong>
            </div>

            <div>
              <span>PLAYERS</span>
              <strong>50</strong>
            </div>

            <div>
              <span>PER KILL</span>
              <strong>₹10</strong>
            </div>

          </div>

          <div className="prizeArea">
            <span>TOP PRIZES</span>
            <strong>🥇 ₹1,000 &nbsp; 🥈 ₹500 &nbsp; 🥉 ₹250</strong>
          </div>

          <button className="joinButton">
            VIEW TOURNAMENT
          </button>

        </article>
        {/* END - SQUAD TOURNAMENT CARD */}

      </section>
      {/* ================= END - TOURNAMENT SECTION ================= */}


      {/* ==================================================
          START - WHY PLAY2PROVE
      ================================================== */}
      <section className="section">

        <div className="sectionHeading">
          <span>BUILT FOR GAMERS</span>
          <h2>WHY PLAY2PROVE?</h2>
        </div>

        <div className="featureGrid">

          <div className="featureCard">
            <span>⚡</span>
            <h3>SKILL MATTERS</h3>
            <p>Your performance should speak for you.</p>
          </div>

          <div className="featureCard">
            <span>🏆</span>
            <h3>COMPETE & WIN</h3>
            <p>Battle players and climb your way to the top.</p>
          </div>

          <div className="featureCard">
            <span>🛡️</span>
            <h3>FAIR PLAY</h3>
            <p>Competitive matches with anti-cheat rules.</p>
          </div>

        </div>
      </section>
      {/* ================= END - WHY PLAY2PROVE ================= */}


      {/* ==================================================
          START - REFER AND EARN PREVIEW
      ================================================== */}
      <section id="rewards" className="referSection">

        <span className="smallTitle">GROW TOGETHER</span>

        <h2>
          PLAY TOGETHER.<br />
          <span>EARN TOGETHER.</span>
        </h2>

        <p>
          Invite your gaming friends to Play2Prove.
          Your unique referral system is coming soon.
        </p>

        <button className="secondaryButton">
          REFER & EARN — COMING SOON
        </button>

      </section>
      {/* ================= END - REFER AND EARN PREVIEW ================= */}


      {/* ==================================================
          START - FOOTER
      ================================================== */}
      <footer className="footer">

        <div className="footerLogo">
          PLAY<span>2</span>PROVE
        </div>

        <p>PLAY • COMPETE • EARN • PROVE</p>

        <div className="footerLinks">
          <a href="#">Instagram</a>
          <a href="#">YouTube</a>
          <a href="#">Rules</a>
          <a href="#">Support</a>
        </div>

        <small>
          © 2026 Play2Prove. All rights reserved.
        </small>

      </footer>
      {/* ================= END - FOOTER ================= */}

    </main>
  );
}

// ======================================================
// END - PLAY2PROVE HOME PAGE
// ======================================================
