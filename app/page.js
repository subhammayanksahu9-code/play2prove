"use client";

import "./styles.css";

const games = [
  {
    name: "FREE FIRE",
    mode: "SOLO • SQUAD",
    icon: "🔥",
    glow: "orange",
  },
  {
    name: "BGMI",
    mode: "SOLO • SQUAD",
    icon: "🎯",
    glow: "blue",
  },
  {
    name: "MORE GAMES",
    mode: "COMING SOON",
    icon: "⚡",
    glow: "purple",
  },
];

const tournaments = [
  {
    game: "FREE FIRE",
    title: "Bermuda • Solo",
    date: "Today",
    time: "6:00 PM",
    entry: "₹30",
    prize: "₹500",
    joined: "37/48",
    progress: 77,
  },
  {
    game: "FREE FIRE",
    title: "Squad Clash #01",
    date: "Today",
    time: "8:00 PM",
    entry: "₹100",
    prize: "₹1,500",
    joined: "12/12",
    progress: 100,
  },
];

const rules = [
  {
    no: "01",
    title: "One Player, One Entry",
    text: "Use your own registered account and valid game details.",
  },
  {
    no: "02",
    title: "Fair Play",
    text: "Cheating, hacking, exploiting or unfair gameplay may lead to disqualification.",
  },
  {
    no: "03",
    title: "Correct Game Details",
    text: "Players are responsible for providing correct in-game information.",
  },
  {
    no: "04",
    title: "Results & Rewards",
    text: "Verified results and eligible rewards are processed according to tournament rules.",
  },
];

export default function HomePage() {
  return (
    <main className="home">

      {/* ================= HEADER ================= */}
      <header className="topbar">
        <div className="brand">
          <div className="brandLogo">P2P</div>

          <div>
            <div className="brandName">Play2Prove</div>
            <div className="brandTag">
              PLAY • COMPETE • EARN • PROVE
            </div>
          </div>
        </div>

        <div className="headerRight">

          {/* SINGLE WALLET */}
          <button className="walletButton">
            <span className="walletIcon">◈</span>
            <span>
              <small>WALLET</small>
              <strong>₹0</strong>
            </span>
          </button>

          {/* PROFILE */}
          <button className="profileButton">
            ◉
          </button>
        </div>
      </header>

      {/* ================= NEON TOP LINE ================= */}
      <div className="neonRail topRail">
        <span />
        <span />
        <span />
      </div>

      {/* ================= HERO ================= */}
      <section className="hero">

        {/* LIVE VIDEO */}
        <video
          className="heroVideo"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/gaming.mp4" type="video/mp4" />
        </video>

        {/* DARK VIDEO COVER */}
        <div className="videoOverlay" />

        {/* MOVING RGB ENERGY */}
        <div className="energyOrb orbOne" />
        <div className="energyOrb orbTwo" />
        <div className="energyOrb orbThree" />

        {/* PARTICLES */}
        <div className="particles" />

        {/* GRID */}
        <div className="cyberGrid" />

        <div className="heroContent">

          <div className="heroBadge">
            <span className="liveDot" />
            LIVE GAMING ARENA
          </div>

          <h1>
            PLAY.
            <br />
            <span>COMPETE.</span>
            <br />
            <em>PROVE.</em>
          </h1>

          <p>
            Enter the arena. Compete with real players.
            <br />
            Win matches. Earn rewards.
          </p>

          <div className="heroActions">
            <button className="primaryButton">
              EXPLORE TOURNAMENTS
              <span>→</span>
            </button>

            <button className="ghostButton">
              VIEW GAMES
            </button>
          </div>

          <div className="heroStats">
            <div>
              <strong>24/7</strong>
              <span>ARENA</span>
            </div>

            <div>
              <strong>LIVE</strong>
              <span>MATCHES</span>
            </div>

            <div>
              <strong>REAL</strong>
              <span>REWARDS</span>
            </div>
          </div>

        </div>

        <div className="scrollHint">
          <span />
          SCROLL TO ENTER
        </div>
      </section>

      {/* ================= MOVING NEON SPLASH ================= */}
      <section className="neonSplash">
        <div className="splashLine lineA" />
        <div className="splashLine lineB" />
        <div className="splashLine lineC" />

        <div className="splashText">
          <span>THE ARENA IS LIVE</span>
          <strong>YOUR NEXT MATCH STARTS HERE.</strong>
        </div>
      </section>

      {/* ================= GAMES ================= */}
      <section className="section gamesSection">

        <div className="sectionHeading">
          <div>
            <span className="eyebrow">CHOOSE YOUR BATTLE</span>
            <h2>Games</h2>
          </div>

          <span className="sectionSideText">
            MORE GAMES COMING SOON
          </span>
        </div>

        <div className="gamesGrid">

          {games.map((game) => (
            <article
              key={game.name}
              className={`gameCard ${game.glow}`}
            >
              <div className="gameGlow" />

              <div className="gameIcon">
                {game.icon}
              </div>

              <div className="gameInfo">
                <span>{game.mode}</span>
                <h3>{game.name}</h3>
              </div>

              <div className="gameArrow">
                →
              </div>
            </article>
          ))}

        </div>
      </section>

      {/* ================= TOURNAMENTS ================= */}
      <section className="section tournamentsSection">

        <div className="sectionHeading">
          <div>
            <span className="eyebrow">LIVE & UPCOMING</span>
            <h2>Upcoming Tournaments</h2>
          </div>
        </div>

        <div className="tournamentGrid">

          {tournaments.map((item) => (
            <article className="tournamentCard" key={item.title}>

              <div className="tournamentTop">
                <div>
                  <span className="gameLabel">
                    {item.game}
                  </span>

                  <h3>{item.title}</h3>
                </div>

                <span className="openBadge">
                  OPEN
                </span>
              </div>

              <div className="tournamentMeta">

                <div>
                  <small>DATE</small>
                  <strong>{item.date}</strong>
                </div>

                <div>
                  <small>START TIME</small>
                  <strong>{item.time}</strong>
                </div>

              </div>

              <div className="moneyRow">

                <div>
                  <small>ENTRY</small>
                  <strong>{item.entry}</strong>
                </div>

                <div>
                  <small>PER KILL</small>
                  <strong>₹5</strong>
                </div>

                <div>
                  <small>PRIZE</small>
                  <strong className="prize">
                    {item.prize}
                  </strong>
                </div>

              </div>

              <div className="joinedHeader">
                <span>Players Joined</span>
                <strong>{item.joined}</strong>
              </div>

              <div className="progress">
                <span
                  style={{
                    width: `${item.progress}%`,
                  }}
                />
              </div>

              <button className="joinButton">
                JOIN {item.entry}
                <span>→</span>
              </button>

            </article>
          ))}

        </div>
      </section>

      {/* ================= TOURNAMENT OVERVIEW ================= */}
      <section className="section overviewSection">

        <div className="sectionHeading">
          <div>
            <span className="eyebrow">
              KNOW BEFORE YOU JOIN
            </span>
            <h2>Tournament Overview</h2>
          </div>
        </div>

        <div className="overviewGrid">

          <article className="overviewCard active">
            <span className="cardNumber">01</span>
            <small>UPCOMING MATCHES</small>
            <h3>Compete. Perform. Prove.</h3>
            <p>
              Choose your game, select an available tournament
              and enter the match.
            </p>
          </article>

          <article className="overviewCard">
            <span className="cardNumber">02</span>
            <small>MATCH DETAILS</small>
            <h3>Clear information</h3>

            <ul>
              <li>Entry fee</li>
              <li>Per-kill reward</li>
              <li>Prize pool</li>
              <li>Match timing</li>
              <li>Player capacity</li>
            </ul>
          </article>

          <article className="overviewCard">
            <span className="cardNumber">03</span>
            <small>RESULTS & REWARDS</small>
            <h3>Play for the win</h3>
            <p>
              Verified results are processed according to
              tournament rules and eligible rewards are credited
              to the player's wallet.
            </p>
          </article>

        </div>
      </section>

      {/* ================= RULES ================= */}
      <section className="section rulesSection">

        <div className="sectionHeading">
          <div>
            <span className="eyebrow">PLAY FAIR</span>
            <h2>Rules</h2>
          </div>
        </div>

        <div className="rulesGrid">

          {rules.map((rule) => (
            <article className="ruleCard" key={rule.no}>

              <span className="ruleNumber">
                {rule.no}
              </span>

              <div>
                <h3>{rule.title}</h3>
                <p>{rule.text}</p>
              </div>

            </article>
          ))}

        </div>

      </section>

      {/* ================= TERMS ================= */}
      <section className="termsSection">

        <div className="termsIcon">
          §
        </div>

        <div>
          <span className="eyebrow">
            IMPORTANT INFORMATION
          </span>

          <h2>Terms & Conditions</h2>

          <p>
            By participating in Play2Prove tournaments,
            players agree to follow platform rules,
            tournament-specific conditions and fair-play
            requirements.
          </p>

          <div className="termsLinks">
            Terms of Use →
            Privacy Policy →
            Responsible Play →
          </div>
        </div>

      </section>

      {/* ================= CHATGPT PARTNER ================= */}
      <section className="partnerSection">

        <div className="partnerGlow" />

        <span className="eyebrow">
          TECHNOLOGY PARTNER
        </span>

        <div className="partnerMain">
          <div className="partnerLogo">
            ✦
          </div>

          <div>
            <h2>ChatGPT</h2>
            <p>
              AI-powered technology & intelligent experiences.
            </p>
          </div>
        </div>

        <span className="partnerTag">
          POWERING THE FUTURE OF PLAY
        </span>

      </section>

      {/* ================= BOTTOM NEON ================= */}
      <div className="neonRail bottomRail">
        <span />
        <span />
        <span />
      </div>

      {/* ================= FOOTER ================= */}
      <footer>
        <div className="footerBrand">
          <strong>Play2Prove</strong>
          <span>PLAY • COMPETE • EARN • PROVE</span>
        </div>

        <div className="footerLinks">
          <span>Rules</span>
          <span>Terms</span>
          <span>Privacy</span>
          <span>Responsible Play</span>
        </div>

        <div className="copyright">
          © 2026 Play2Prove
        </div>
      </footer>

    </main>
  );
}
