"use client";

import Link from "next/link";

export default function HomePage() {
  const games = [
    {
      name: "FREE FIRE",
      tag: "BATTLE ROYALE",
      icon: "🔥",
      accent: "orange",
      description: "Clash, compete and prove your skills.",
    },
    {
      name: "BGMI",
      tag: "BATTLE ROYALE",
      icon: "🎯",
      accent: "purple",
      description: "Enter the battleground and dominate.",
    },
    {
      name: "COMING SOON",
      tag: "NEW GAME",
      icon: "⚡",
      accent: "blue",
      description: "More competitive games are on the way.",
    },
  ];

  return (
    <main className="homePage">
      {/* BACKGROUND EFFECTS */}
      <div className="bgGlow glowOne" />
      <div className="bgGlow glowTwo" />
      <div className="bgGrid" />

      {/* HEADER */}
      <header className="homeHeader">
        <Link href="/home" className="brand">
          <div className="brandLogo">P2P</div>

          <div>
            <div className="brandName">Play2Prove</div>
            <div className="brandSub">
              PLAY • COMPETE • EARN • PROVE
            </div>
          </div>
        </Link>

        <nav className="desktopNav">
          <Link href="/home" className="active">
            HOME
          </Link>

          <Link href="/tournaments">
            TOURNAMENTS
          </Link>

          <Link href="/matches">
            MATCHES
          </Link>
        </nav>

        <div className="headerActions">
          <Link href="/wallet" className="walletMini">
            <span>◈</span>
            <div>
              <small>WALLET</small>
              <strong>₹0</strong>
            </div>
          </Link>

          <Link href="/profile" className="profileButton">
            <span>👤</span>
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <section className="homeContainer">

        {/* HERO */}
        <section className="hero">
          <div className="heroContent">
            <div className="eyebrow">
              <span />
              GAMING TOURNAMENT PLATFORM
            </div>

            <h1>
              PLAY.
              <br />
              COMPETE.
              <br />
              <span>PROVE.</span>
            </h1>

            <p>
              Join competitive gaming tournaments, show your skills
              and compete for rewards.
            </p>

            <div className="heroButtons">
              <Link href="/tournaments" className="primaryButton">
                EXPLORE TOURNAMENTS
                <span>→</span>
              </Link>

              <Link href="/matches" className="secondaryButton">
                UPCOMING MATCHES
              </Link>
            </div>
          </div>

          <div className="heroVisual">
            <div className="visualGlow" />

            <div className="gamingCard">
              <div className="cardTop">
                <span className="liveDot">● LIVE</span>
                <span>PLAY2PROVE</span>
              </div>

              <div className="gamingIcon">🎮</div>

              <div className="visualTitle">
                READY TO
                <br />
                <span>PROVE?</span>
              </div>

              <div className="visualLines">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </section>

        {/* GAMES */}
        <section className="section">
          <div className="sectionHeading">
            <div>
              <div className="sectionEyebrow">CHOOSE YOUR GAME</div>
              <h2>Games</h2>
            </div>

            <span className="sectionHint">
              Select your battlefield
            </span>
          </div>

          <div className="gamesGrid">
            {games.map((game, index) => (
              <Link
                href={index < 2 ? "/tournaments" : "#"}
                className={`gameCard ${game.accent}`}
                key={game.name}
              >
                <div className="gameGlow" />

                <div className="gameTop">
                  <span className="gameIcon">
                    {game.icon}
                  </span>

                  <span className="gameTag">
                    {game.tag}
                  </span>
                </div>

                <div className="gameInfo">
                  <h3>{game.name}</h3>
                  <p>{game.description}</p>
                </div>

                <div className="gameArrow">
                  →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* TOURNAMENT OVERVIEW */}
        <section className="section">
          <div className="sectionHeading">
            <div>
              <div className="sectionEyebrow">
                TOURNAMENT OVERVIEW
              </div>

              <h2>Featured Tournament</h2>
            </div>

            <Link
              href="/tournaments"
              className="viewAll"
            >
              VIEW ALL →
            </Link>
          </div>

          <div className="tournamentCard">

            <div className="tournamentMain">
              <div className="tournamentBadge">
                OPEN
              </div>

              <div className="tournamentGame">
                FREE FIRE
              </div>

              <h3>Free Fire Daily Battle #01</h3>

              <p>
                Fast-paced competitive solo match.
                Enter the battlefield and prove your skills.
              </p>
            </div>

            <div className="tournamentStats">

              <div>
                <small>DATE</small>
                <strong>Today</strong>
              </div>

              <div>
                <small>START TIME</small>
                <strong>6:00 PM</strong>
              </div>

              <div>
                <small>ENTRY</small>
                <strong>₹30</strong>
              </div>

              <div>
                <small>PRIZE POOL</small>
                <strong className="orangeText">
                  ₹500
                </strong>
              </div>

            </div>

            <Link
              href="/tournaments"
              className="joinButton"
            >
              VIEW TOURNAMENT
              <span>→</span>
            </Link>

          </div>
        </section>

        {/* UPCOMING MATCHES */}
        <section className="section">

          <div className="sectionHeading">
            <div>
              <div className="sectionEyebrow">
                YOUR NEXT BATTLES
              </div>

              <h2>Upcoming Matches</h2>
            </div>

            <Link
              href="/matches"
              className="viewAll"
            >
              VIEW ALL →
            </Link>
          </div>

          <div className="emptyMatches">

            <div className="emptyIcon">
              ⚔
            </div>

            <h3>No Upcoming Matches</h3>

            <p>
              Join a tournament to see your upcoming
              matches here.
            </p>

            <Link
              href="/tournaments"
              className="smallButton"
            >
              FIND A TOURNAMENT
            </Link>

          </div>

        </section>

        {/* RULES */}
        <section className="infoGrid">

          <div className="infoCard">

            <div className="infoIcon">
              ⚔
            </div>

            <div>
              <div className="sectionEyebrow">
                PLAY FAIR
              </div>

              <h3>Rules</h3>

              <p>
                Follow tournament rules, play fairly
                and respect every competitor.
              </p>

              <Link href="/tournaments">
                READ RULES →
              </Link>
            </div>

          </div>

          <div className="infoCard">

            <div className="infoIcon">
              ◈
            </div>

            <div>
              <div className="sectionEyebrow">
                IMPORTANT
              </div>

              <h3>Terms & Conditions</h3>

              <p>
                Tournament participation and platform
                terms will be available here.
              </p>

              <Link href="/tournaments">
                READ TERMS →
              </Link>
            </div>

          </div>

        </section>

      </section>

      {/* MOBILE NAV */}
      <nav className="mobileNav">

        <Link href="/home" className="mobileActive">
          <span>⌂</span>
          HOME
        </Link>

        <Link href="/tournaments">
          <span>🏆</span>
          TOURNAMENTS
        </Link>

        <Link href="/matches">
          <span>⚔</span>
          MATCHES
        </Link>

        <Link href="/wallet">
          <span>◈</span>
          WALLET
        </Link>

        <Link href="/profile">
          <span>👤</span>
          PROFILE
        </Link>

      </nav>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .homePage {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(255, 71, 0, .12),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 35%,
              rgba(115, 50, 255, .13),
              transparent 30%
            ),
            #05070b;
          color: #fff;
          overflow-x: hidden;
          position: relative;
          padding-bottom: 40px;
        }

        .bgGrid {
          position: fixed;
          inset: 0;
          opacity: .08;
          pointer-events: none;
          background-image:
            linear-gradient(
              rgba(255,255,255,.12) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.12) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent
          );
        }

        .bgGlow {
          position: fixed;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: .15;
          pointer-events: none;
        }

        .glowOne {
          background: #ff4b00;
          top: 15%;
          left: -180px;
        }

        .glowTwo {
          background: #723cff;
          right: -180px;
          top: 45%;
        }

        .homeHeader {
          height: 72px;
          padding: 0 5%;
          border-bottom: 1px solid rgba(255,255,255,.08);
          background: rgba(4,6,10,.82);
          backdrop-filter: blur(18px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          color: white;
          text-decoration: none;
        }

        .brandLogo {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 11px;
          font-weight: 900;
          background: linear-gradient(
            135deg,
            #ff7300,
            #ff2d00
          );
          box-shadow:
            0 0 25px rgba(255,70,0,.45);
        }

        .brandName {
          font-size: 17px;
          font-weight: 900;
        }

        .brandSub {
          font-size: 7px;
          color: #7c8495;
          letter-spacing: 1.5px;
          margin-top: 2px;
        }

        .desktopNav {
          display: flex;
          gap: 34px;
        }

        .desktopNav a {
          color: #8991a1;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          letter-spacing: .6px;
          transition: .2s;
        }

        .desktopNav a:hover,
        .desktopNav .active {
          color: #ff5a00;
          text-shadow:
            0 0 14px rgba(255,80,0,.7);
        }

        .headerActions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .walletMini {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 10px;
          color: white;
          text-decoration: none;
          background: rgba(255,255,255,.025);
        }

        .walletMini > span {
          color: #ff6200;
          font-size: 18px;
        }

        .walletMini small {
          display: block;
          color: #6f7788;
          font-size: 7px;
          font-weight: 800;
        }

        .walletMini strong {
          display: block;
          font-size: 11px;
        }

        .profileButton {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: white;
          text-decoration: none;
          border: 1px solid rgba(125,70,255,.6);
          background: rgba(100,40,255,.08);
          box-shadow:
            0 0 20px rgba(110,50,255,.25);
        }

        .homeContainer {
          width: min(1200px, 92%);
          margin: auto;
          position: relative;
          z-index: 2;
        }

        .hero {
          margin-top: 34px;
          min-height: 470px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 24px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          background:
            radial-gradient(
              circle at 75% 50%,
              rgba(255,60,0,.18),
              transparent 34%
            ),
            linear-gradient(
              120deg,
              rgba(55,25,30,.9),
              rgba(10,14,23,.95)
            );
          position: relative;
        }

        .heroContent {
          padding: 70px 55px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .eyebrow,
        .sectionEyebrow {
          color: #ff5b0a;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .eyebrow span {
          width: 7px;
          height: 7px;
          background: #ff5600;
          border-radius: 50%;
          box-shadow: 0 0 12px #ff5600;
        }

        h1 {
          font-size: clamp(58px, 7vw, 92px);
          line-height: .84;
          letter-spacing: -5px;
          margin: 0;
          font-weight: 1000;
        }

        h1 span {
          color: #ff4d00;
          text-shadow:
            0 0 35px rgba(255,70,0,.35);
        }

        .heroContent p {
          max-width: 550px;
          color: #9098a8;
          font-size: 14px;
          line-height: 1.7;
          margin: 28px 0;
        }

        .heroButtons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .primaryButton,
        .secondaryButton,
        .smallButton {
          text-decoration: none;
          font-weight: 900;
          font-size: 11px;
          letter-spacing: .4px;
        }

        .primaryButton {
          padding: 15px 20px;
          color: white;
          border-radius: 9px;
          background: #ff5708;
          box-shadow:
            0 0 28px rgba(255,70,0,.35);
        }

        .primaryButton span {
          margin-left: 14px;
        }

        .secondaryButton {
          padding: 15px 20px;
          border-radius: 9px;
          color: #dce1eb;
          border: 1px solid #343b48;
          background: rgba(255,255,255,.025);
        }

        .heroVisual {
          display: grid;
          place-items: center;
          position: relative;
        }

        .visualGlow {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: #ff4200;
          filter: blur(100px);
          opacity: .18;
        }

        .gamingCard {
          width: 72%;
          aspect-ratio: 1.15;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,.15);
          background:
            linear-gradient(
              145deg,
              rgba(30,34,44,.95),
              rgba(9,11,17,.95)
            );
          box-shadow:
            0 30px 80px rgba(0,0,0,.5),
            inset 0 0 50px rgba(255,70,0,.08);
          padding: 24px;
          position: relative;
          overflow: hidden;
          transform: rotate(2deg);
        }

        .gamingCard::after {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -100px;
          bottom: -100px;
          background: #ff4d00;
          filter: blur(80px);
          opacity: .25;
        }

        .cardTop {
          display: flex;
          justify-content: space-between;
          color: #646d7d;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .liveDot {
          color: #4dff91;
        }

        .gamingIcon {
          font-size: 90px;
          margin-top: 50px;
          filter:
            drop-shadow(0 0 20px rgba(255,80,0,.5));
        }

        .visualTitle {
          position: absolute;
          bottom: 28px;
          left: 24px;
          font-size: 29px;
          font-weight: 1000;
          line-height: .9;
        }

        .visualTitle span {
          color: #ff5600;
        }

        .visualLines {
          position: absolute;
          right: 24px;
          bottom: 32px;
          display: flex;
          gap: 4px;
          align-items: end;
        }

        .visualLines span {
          width: 5px;
          background: #ff5600;
          box-shadow: 0 0 10px #ff5600;
        }

        .visualLines span:nth-child(1) {
          height: 15px;
        }

        .visualLines span:nth-child(2) {
          height: 30px;
        }

        .visualLines span:nth-child(3) {
          height: 48px;
        }

        .section {
          margin-top: 70px;
        }

        .sectionHeading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 20px;
        }

        .sectionHeading h2 {
          margin: 5px 0 0;
          font-size: 28px;
          letter-spacing: -.7px;
        }

        .sectionHint,
        .viewAll {
          color: #687181;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
        }

        .viewAll {
          color: #ff5b08;
        }

        .gamesGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .gameCard {
          min-height: 190px;
          padding: 22px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 17px;
          text-decoration: none;
          color: white;
          background: rgba(10,14,21,.88);
          position: relative;
          overflow: hidden;
          transition: .25s;
        }

        .gameCard:hover {
          transform: translateY(-5px);
          border-color: rgba(255,75,0,.55);
          box-shadow:
            0 15px 40px rgba(0,0,0,.4),
            0 0 30px rgba(255,70,0,.1);
        }

        .gameCard.purple:hover {
          border-color: rgba(130,70,255,.6);
        }

        .gameCard.blue:hover {
          border-color: rgba(60,160,255,.6);
        }

        .gameTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .gameIcon {
          font-size: 31px;
        }

        .gameTag {
          font-size: 7px;
          font-weight: 900;
          color: #687181;
          letter-spacing: 1px;
        }

        .gameInfo {
          position: absolute;
          bottom: 22px;
          left: 22px;
        }

        .gameInfo h3 {
          margin: 0 0 5px;
          font-size: 20px;
        }

        .gameInfo p {
          margin: 0;
          color: #697383;
          font-size: 10px;
        }

        .gameArrow {
          position: absolute;
          right: 22px;
          bottom: 24px;
          color: #ff5b08;
          font-size: 18px;
        }

        .tournamentCard {
          border: 1px solid rgba(255,75,0,.32);
          border-radius: 18px;
          padding: 28px;
          background:
            radial-gradient(
              circle at 90% 20%,
              rgba(255,60,0,.15),
              transparent 30%
            ),
            rgba(10,14,21,.9);
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 25px;
        }

        .tournamentBadge {
          display: inline-block;
          padding: 5px 9px;
          border: 1px solid #1dcb72;
          color: #35ed91;
          font-size: 7px;
          font-weight: 900;
          border-radius: 5px;
          margin-bottom: 12px;
        }

        .tournamentGame {
          color: #ff5b08;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .tournamentMain h3 {
          margin: 6px 0;
          font-size: 26px;
        }

        .tournamentMain p {
          color: #7d8696;
          font-size: 11px;
          line-height: 1.7;
          max-width: 520px;
        }

        .tournamentStats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .tournamentStats > div {
          padding: 15px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.02);
        }

        .tournamentStats small {
          display: block;
          color: #616a7b;
          font-size: 7px;
          font-weight: 900;
          margin-bottom: 7px;
        }

        .tournamentStats strong {
          font-size: 14px;
        }

        .orangeText {
          color: #ff5b08;
        }

        .joinButton {
          grid-column: 1 / -1;
          padding: 14px;
          text-align: center;
          color: white;
          background: #ff5708;
          border-radius: 8px;
          text-decoration: none;
          font-size: 10px;
          font-weight: 900;
          box-shadow:
            0 0 25px rgba(255,70,0,.25);
        }

        .joinButton span {
          margin-left: 10px;
        }

        .emptyMatches {
          min-height: 220px;
          border: 1px dashed rgba(255,255,255,.12);
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: rgba(10,14,21,.55);
        }

        .emptyIcon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: rgba(255,75,0,.08);
          color: #ff5b08;
          font-size: 22px;
          margin-bottom: 12px;
        }

        .emptyMatches h3 {
          margin: 0;
          font-size: 17px;
        }

        .emptyMatches p {
          color: #697383;
          font-size: 10px;
          margin: 8px 0 17px;
        }

        .smallButton {
          padding: 11px 16px;
          border: 1px solid rgba(255,75,0,.5);
          border-radius: 7px;
          color: #ff5b08;
        }

        .infoGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 70px;
        }

        .infoCard {
          display: flex;
          gap: 17px;
          padding: 25px;
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 17px;
          background: rgba(10,14,21,.75);
        }

        .infoIcon {
          min-width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: rgba(255,75,0,.08);
          color: #ff5b08;
        }

        .infoCard h3 {
          margin: 5px 0 7px;
          font-size: 18px;
        }

        .infoCard p {
          color: #737d8d;
          font-size: 10px;
          line-height: 1.7;
          margin: 0 0 10px;
        }

        .infoCard a {
          color: #ff5b08;
          text-decoration: none;
          font-size: 8px;
          font-weight: 900;
        }

        .mobileNav {
          display: none;
        }

        @media (max-width: 850px) {

          .homeHeader {
            height: 62px;
            padding: 0 15px;
          }

          .desktopNav {
            display: none;
          }

          .walletMini {
            padding: 6px 8px;
          }

          .walletMini small {
            display: none;
          }

          .hero {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .heroContent {
            padding: 45px 25px;
          }

          h1 {
            font-size: 58px;
            letter-spacing: -3px;
          }

          .heroVisual {
            min-height: 300px;
            padding-bottom: 40px;
          }

          .gamingCard {
            width: 78%;
          }

          .gamesGrid {
            grid-template-columns: 1fr;
          }

          .gameCard {
            min-height: 160px;
          }

          .tournamentCard {
            grid-template-columns: 1fr;
          }

          .infoGrid {
            grid-template-columns: 1fr;
          }

          .section {
            margin-top: 50px;
          }

          .sectionHeading h2 {
            font-size: 23px;
          }

          .sectionHint {
            display: none;
          }

          .mobileNav {
            display: flex;
            position: fixed;
            bottom: 10px;
            left: 10px;
            right: 10px;
            height: 62px;
            border: 1px solid rgba(255,255,255,.13);
            border-radius: 17px;
            background: rgba(5,8,13,.92);
            backdrop-filter: blur(20px);
            z-index: 100;
            justify-content: space-around;
            align-items: center;
            box-shadow:
              0 10px 40px rgba(0,0,0,.6);
          }

          .mobileNav a {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: #697383;
            text-decoration: none;
            font-size: 7px;
            font-weight: 900;
          }

          .mobileNav a span {
            font-size: 16px;
          }

          .mobileNav .mobileActive {
            color: #ff5b08;
            text-shadow:
              0 0 12px rgba(255,70,0,.7);
          }

          .homePage {
            padding-bottom: 90px;
          }

        }

        @media (max-width: 480px) {

          .brandSub {
            display: none;
          }

          .profileButton {
            width: 35px;
            height: 35px;
          }

          .walletMini {
            border: none;
            background: transparent;
          }

          .hero {
            margin-top: 18px;
            border-radius: 17px;
          }

          .heroContent {
            padding: 35px 20px;
          }

          h1 {
            font-size: 52px;
          }

          .heroContent p {
            font-size: 12px;
          }

          .heroButtons {
            flex-direction: column;
          }

          .primaryButton,
          .secondaryButton {
            text-align: center;
          }

          .gamingCard {
            width: 82%;
          }

          .gamingIcon {
            font-size: 65px;
          }

          .tournamentCard {
            padding: 20px;
          }

          .tournamentStats {
            gap: 7px;
          }

          .tournamentStats > div {
            padding: 12px;
          }

        }

      `}</style>
    </main>
  );
}
