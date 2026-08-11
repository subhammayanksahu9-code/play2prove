"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  function go(path) {
    window.location.href = path;
  }

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });

    setMenuOpen(false);
  }

  return (
    <main className="p2pHome">

      {/* =====================================================
          GLOBAL NEON ENVIRONMENT
      ===================================================== */}

      <div className="neonEnvironment">
        <div className="neonBlob blobOrange"></div>
        <div className="neonBlob blobPurple"></div>
        <div className="neonBlob blobBlue"></div>

        <div className="movingBeam beamOne"></div>
        <div className="movingBeam beamTwo"></div>
        <div className="movingBeam beamThree"></div>

        <div className="neonParticles"></div>
        <div className="neonGrid"></div>
        <div className="screenVignette"></div>
      </div>


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="p2pNavbar">

        <div
          className="p2pBrand"
          onClick={() => scrollTo("home")}
        >
          <div className="p2pLogo">
            P2P
          </div>

          <div className="brandText">
            <strong>Play2Prove</strong>
            <span>COMPETE • PROVE • WIN</span>
          </div>
        </div>


        <nav className={`p2pNav ${menuOpen ? "open" : ""}`}>

          <button onClick={() => scrollTo("home")}>
            Home
          </button>

          <button onClick={() => scrollTo("tournaments")}>
            Tournaments
          </button>

          <button onClick={() => scrollTo("games")}>
            Games
          </button>

          <button onClick={() => scrollTo("how")}>
            How It Works
          </button>

          <button onClick={() => scrollTo("leaderboard")}>
            Leaderboard
          </button>

        </nav>


        <div className="navActions">

          <button
            className="navLogin"
            onClick={() => go("/login")}
          >
            Login
          </button>

          <button
            className="navSignup"
            onClick={() => go("/signup")}
          >
            Join Now
          </button>

        </div>


        <button
          className="mobileMenu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

      </header>


      {/* =====================================================
          TOP NEON RAIL
      ===================================================== */}

      <div className="globalRail">
        <span></span>
        <span></span>
        <span></span>
      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        id="home"
        className="p2pHero"
      >

        <div className="heroLeft">

          <div className="livePill">
            <span className="livePulse"></span>
            LIVE COMPETITIVE GAMING NETWORK
          </div>


          <h1>
            PLAY.
            <br />

            <span>COMPETE.</span>
            <br />

            <em>PROVE.</em>
          </h1>


          <p className="heroDescription">
            Enter tournaments, compete against real players,
            climb the leaderboard and prove what you're made of.
          </p>


          <div className="heroButtons">

            <button
              className="heroPrimary"
              onClick={() => go("/tournaments")}
            >
              FIND TOURNAMENT
              <span>→</span>
            </button>


            <button
              className="heroSecondary"
              onClick={() => go("/matches")}
            >
              EXPLORE MATCHES
            </button>

          </div>


          <div className="heroStats">

            <div>
              <strong>10K+</strong>
              <span>PLAYERS</span>
            </div>

            <div>
              <strong>500+</strong>
              <span>TOURNAMENTS</span>
            </div>

            <div>
              <strong>₹XXL+</strong>
              <span>PRIZES</span>
            </div>

          </div>

        </div>


        {/* RIGHT SIDE — PURE CSS GAMING COMMAND CENTER */}

        <div className="heroCommand">

          <div className="commandGlow"></div>

          <div className="commandHeader">
            <span>PLAY2PROVE</span>

            <div>
              <i></i>
              SYSTEM ONLINE
            </div>
          </div>


          <div className="commandScreen">

            <div className="screenTop">
              <span>LIVE ARENA</span>
              <strong>03</strong>
            </div>


            <div className="arenaCore">

              <div className="coreRing ringOne"></div>
              <div className="coreRing ringTwo"></div>
              <div className="coreRing ringThree"></div>

              <div className="coreCenter">
                <span>P2P</span>
                <small>ARENA</small>
              </div>

            </div>


            <div className="matchMini">

              <div>
                <small>GAME</small>
                <strong>FREE FIRE</strong>
              </div>

              <div>
                <small>STATUS</small>
                <strong className="green">
                  OPEN
                </strong>
              </div>

              <div>
                <small>PRIZE</small>
                <strong>₹ —</strong>
              </div>

            </div>

          </div>


          <div className="commandFooter">

            <span>PLAYER NETWORK</span>

            <div className="networkDots">
              <i></i>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </div>

            <strong>ONLINE</strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          LIVE STRIP
      ===================================================== */}

      <section className="liveStrip">

        <div>
          <span className="stripDot"></span>
          LIVE NOW
        </div>

        <strong>
          Competitive gaming starts here.
        </strong>

        <button onClick={() => go("/tournaments")}>
          VIEW TOURNAMENTS →
        </button>

      </section>


      {/* =====================================================
          PLATFORM NUMBERS
      ===================================================== */}

      <section className="platformStats">

        <Stat
          number="10K+"
          label="REGISTERED PLAYERS"
        />

        <Stat
          number="500+"
          label="TOURNAMENTS"
        />

        <Stat
          number="50K+"
          label="MATCHES"
        />

        <Stat
          number="₹XXL+"
          label="PRIZE DISTRIBUTION"
        />

      </section>


      {/* =====================================================
          TOURNAMENTS
      ===================================================== */}

      <section
        id="tournaments"
        className="contentSection"
      >

        <SectionTitle
          eyebrow="COMPETE NOW"
          title="Featured Tournaments"
          text="Choose your battle. Enter the arena."
        />


        <div className="tournamentGrid">

          <TournamentCard
            game="FREE FIRE"
            title="Daily Battle Arena"
            status="OPEN"
            entry="₹ —"
            prize="₹ —"
            slots="—"
          />

          <TournamentCard
            game="BGMI"
            title="Squad Challenge"
            status="OPEN"
            entry="₹ —"
            prize="₹ —"
            slots="—"
          />

          <TournamentCard
            game="VALORANT"
            title="Ranked Arena"
            status="COMING SOON"
            entry="₹ —"
            prize="₹ —"
            slots="—"
          />

        </div>


        <div className="centerButton">

          <button
            className="outlineButton"
            onClick={() => go("/tournaments")}
          >
            EXPLORE ALL TOURNAMENTS →
          </button>

        </div>

      </section>


      {/* =====================================================
          GAMES
      ===================================================== */}

      <section
        id="games"
        className="contentSection"
      >

        <SectionTitle
          eyebrow="YOUR BATTLEFIELD"
          title="Choose Your Game"
          text="More games. More competition. More ways to prove yourself."
        />


        <div className="gamesGrid">

          <GameCard
            icon="🔥"
            game="FREE FIRE"
            type="BATTLE ROYALE"
            color="orange"
          />

          <GameCard
            icon="🎯"
            game="BGMI"
            type="BATTLE ROYALE"
            color="blue"
          />

          <GameCard
            icon="⚡"
            game="VALORANT"
            type="TACTICAL FPS"
            color="purple"
          />

          <GameCard
            icon="＋"
            game="MORE GAMES"
            type="COMING SOON"
            color="cyan"
          />

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how"
        className="contentSection"
      >

        <SectionTitle
          eyebrow="SIMPLE PROCESS"
          title="How Play2Prove Works"
          text="Four steps between you and the battlefield."
        />


        <div className="stepsGrid">

          <Step
            number="01"
            title="JOIN"
            text="Choose a tournament that matches your game and skill."
          />

          <Step
            number="02"
            title="PLAY"
            text="Enter the match and compete against other players."
          />

          <Step
            number="03"
            title="PROVE"
            text="Your performance determines your position."
          />

          <Step
            number="04"
            title="EARN"
            text="Win rewards and build your competitive profile."
          />

        </div>

      </section>


      {/* =====================================================
          LEADERBOARD
      ===================================================== */}

      <section
        id="leaderboard"
        className="contentSection"
      >

        <SectionTitle
          eyebrow="TOP PLAYERS"
          title="Leaderboard"
          text="The arena remembers who performs."
        />


        <div className="leaderboard">

          <LeaderboardRow
            rank="01"
            player="PLAYER ONE"
            wins="—"
            earnings="₹ —"
          />

          <LeaderboardRow
            rank="02"
            player="PLAYER TWO"
            wins="—"
            earnings="₹ —"
          />

          <LeaderboardRow
            rank="03"
            player="PLAYER THREE"
            wins="—"
            earnings="₹ —"
          />

          <LeaderboardRow
            rank="04"
            player="PLAYER FOUR"
            wins="—"
            earnings="₹ —"
          />

        </div>

      </section>


      {/* =====================================================
          REWARDS
      ===================================================== */}

      <section className="rewardSection">

        <div>

          <span className="sectionEyebrow">
            PLAY MORE. PROVE MORE.
          </span>

          <h2>
            Your skill should
            <br />
            <span>mean something.</span>
          </h2>

          <p>
            Build your competitive identity through matches,
            wins, streaks and tournament performance.
          </p>

        </div>


        <div className="rewardVisual">

          <div className="rewardOrb">
            P2P
          </div>

          <span>SKILL</span>
          <span>RANK</span>
          <span>REWARD</span>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="finalCTA">

        <div className="ctaLines"></div>

        <span>
          THE ARENA IS WAITING
        </span>

        <h2>
          READY TO
          <br />
          <em>PROVE YOURSELF?</em>
        </h2>

        <p>
          Create your account and enter your first tournament.
        </p>


        <div className="ctaButtons">

          <button
            className="heroPrimary"
            onClick={() => go("/signup")}
          >
            CREATE ACCOUNT →
          </button>

          <button
            className="heroSecondary"
            onClick={() => go("/tournaments")}
          >
            VIEW TOURNAMENTS
          </button>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="p2pFooter">

        <div className="footerBrand">

          <div className="p2pLogo">
            P2P
          </div>

          <div>
            <strong>Play2Prove</strong>
            <span>
              Competitive Gaming Platform
            </span>
          </div>

        </div>


        <div className="footerLinks">

          <button onClick={() => go("/tournaments")}>
            Tournaments
          </button>

          <button onClick={() => go("/matches")}>
            Matches
          </button>

          <button onClick={() => go("/wallet")}>
            Wallet
          </button>

          <button onClick={() => go("/profile")}>
            Profile
          </button>

        </div>


        <div className="footerBottom">
          © 2026 Play2Prove. Built for competitors.
        </div>

      </footer>

    </main>
  );
}


/* ============================================================
   COMPONENTS
============================================================ */

function Stat({ number, label }) {
  return (
    <div className="platformStat">
      <strong>{number}</strong>
      <span>{label}</span>
    </div>
  );
}


function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="sectionTitle">

      <span>{eyebrow}</span>

      <h2>{title}</h2>

      <p>{text}</p>

    </div>
  );
}


function TournamentCard({
  game,
  title,
  status,
  entry,
  prize,
  slots,
}) {
  return (
    <article className="newTournamentCard">

      <div className="tournamentCardTop">

        <span>{game}</span>

        <small
          className={
            status === "OPEN"
              ? "statusOpen"
              : "statusSoon"
          }
        >
          {status}
        </small>

      </div>


      <h3>{title}</h3>


      <div className="tournamentData">

        <div>
          <small>ENTRY</small>
          <strong>{entry}</strong>
        </div>

        <div>
          <small>PRIZE POOL</small>
          <strong>{prize}</strong>
        </div>

        <div>
          <small>SLOTS</small>
          <strong>{slots}</strong>
        </div>

      </div>


      <button
        onClick={() => {
          window.location.href = "/tournaments";
        }}
      >
        {status === "OPEN"
          ? "JOIN TOURNAMENT"
          : "VIEW DETAILS"}
        <span>→</span>
      </button>

    </article>
  );
}


function GameCard({
  icon,
  game,
  type,
  color,
}) {
  return (
    <article className={`newGameCard ${color}`}>

      <div className="gameGlowNew"></div>

      <div className="gameIconNew">
        {icon}
      </div>

      <div>

        <span>{type}</span>

        <h3>{game}</h3>

      </div>

      <strong className="gameArrowNew">
        →
      </strong>

    </article>
  );
}


function Step({
  number,
  title,
  text,
}) {
  return (
    <article className="newStep">

      <strong>{number}</strong>

      <div>

        <span>{title}</span>

        <p>{text}</p>

      </div>

    </article>
  );
}


function LeaderboardRow({
  rank,
  player,
  wins,
  earnings,
}) {
  return (
    <div className="leaderboardRow">

      <strong className="rank">
        {rank}
      </strong>

      <span className="playerName">
        {player}
      </span>

      <span>
        {wins}
      </span>

      <strong className="earnings">
        {earnings}
      </strong>

    </div>
  );
}
