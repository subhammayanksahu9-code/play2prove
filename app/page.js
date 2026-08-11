/* =========================================================
   PLAY2PROVE HOME
   GAMING ARENA / NEON UI
   ========================================================= */

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background:
    radial-gradient(circle at 15% 10%, rgba(255, 73, 0, 0.08), transparent 28%),
    radial-gradient(circle at 85% 30%, rgba(91, 52, 255, 0.09), transparent 30%),
    #030509;
  color: #f5f7fb;
  font-family: Arial, Helvetica, sans-serif;
  overflow-x: hidden;
}

button {
  font-family: inherit;
}

button:focus-visible {
  outline: 2px solid #ff5a16;
  outline-offset: 3px;
}

/* =========================================================
   SHELL
   ========================================================= */

.site-shell {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background:
    linear-gradient(
      90deg,
      rgba(255, 72, 0, 0.025) 1px,
      transparent 1px
    ),
    linear-gradient(
      rgba(91, 52, 255, 0.025) 1px,
      transparent 1px
    ),
    #030509;

  background-size: 42px 42px;
}

/* =========================================================
   HEADER
   ========================================================= */

.topbar {
  height: 62px;
  position: sticky;
  top: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 22px;

  background: rgba(3, 5, 9, 0.94);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: linear-gradient(135deg, #ff6900, #ff3500);
  color: white;

  font-size: 10px;
  font-weight: 900;

  box-shadow:
    0 0 12px rgba(255, 78, 0, 0.65),
    0 0 28px rgba(255, 78, 0, 0.25);
}

.brand-copy h1 {
  margin: 0;

  font-size: 15px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.4px;
}

.brand-copy p {
  margin: 4px 0 0;

  font-size: 6px;
  letter-spacing: 1.5px;
  color: #737b8a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* WALLET */

.mini-wallet {
  min-width: 66px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  padding: 4px 10px;

  border: 1px solid rgba(255, 83, 15, 0.55);
  border-radius: 12px;

  background:
    linear-gradient(
      135deg,
      rgba(255, 72, 0, 0.10),
      rgba(255, 72, 0, 0.02)
    );

  color: white;
  cursor: pointer;

  box-shadow:
    inset 0 0 16px rgba(255, 70, 0, 0.04),
    0 0 15px rgba(255, 70, 0, 0.08);

  transition: 0.25s ease;
}

.mini-wallet:hover {
  border-color: #ff5a16;

  box-shadow:
    0 0 16px rgba(255, 70, 0, 0.35),
    inset 0 0 20px rgba(255, 70, 0, 0.08);

  transform: translateY(-1px);
}

.wallet-icon {
  color: #ff5a16;
  font-size: 10px;
}

.wallet-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
}

.wallet-info small {
  color: #858c9a;
  font-size: 6px;
  letter-spacing: 1.2px;
}

.wallet-info strong {
  font-size: 10px;
  color: #fff;
}

/* PROFILE */

.profile-button {
  width: 40px;
  height: 40px;

  border-radius: 50%;

  border: 1px solid rgba(115, 65, 255, 0.75);

  background:
    radial-gradient(
      circle,
      rgba(107, 52, 255, 0.22),
      rgba(30, 15, 70, 0.2)
    );

  color: #fff;
  cursor: pointer;

  box-shadow:
    0 0 12px rgba(103, 50, 255, 0.3);

  transition: 0.25s ease;
}

.profile-button:hover {
  box-shadow:
    0 0 20px rgba(103, 50, 255, 0.6);

  transform: translateY(-1px);
}

/* =========================================================
   MAIN
   ========================================================= */

.main-content {
  width: min(1100px, calc(100% - 32px));
  margin: 0 auto;

  padding:
    28px
    0
    150px;
}

/* =========================================================
   HERO
   ========================================================= */

.hero {
  position: relative;
  min-height: 405px;

  display: flex;
  align-items: center;

  overflow: hidden;

  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 22px;

  background:
    radial-gradient(
      circle at 8% 40%,
      rgba(255, 70, 0, 0.22),
      transparent 34%
    ),
    radial-gradient(
      circle at 75% 30%,
      rgba(79, 52, 255, 0.16),
      transparent 34%
    ),
    linear-gradient(
      135deg,
      #171016 0%,
      #0a0e16 50%,
      #070a10 100%
    );

  box-shadow:
    0 0 45px rgba(255, 60, 0, 0.08),
    inset 0 0 80px rgba(255, 255, 255, 0.015);
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 65, 0, 0.08) 45%,
      transparent 75%
    );

  pointer-events: none;
}

.hero::after {
  content: "";

  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  height: 2px;

  background: linear-gradient(
    90deg,
    transparent,
    #ff4e0a,
    #ff8a00,
    #713cff,
    transparent
  );

  box-shadow:
    0 0 10px #ff4e0a,
    0 0 22px rgba(113, 60, 255, 0.8);
}

.hero-grid {
  position: absolute;
  inset: 0;

  opacity: 0.35;

  background-image:
    linear-gradient(
      rgba(255, 255, 255, 0.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.035) 1px,
      transparent 1px
    );

  background-size: 30px 30px;

  mask-image: linear-gradient(
    to right,
    black,
    transparent 85%
  );
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(45px);
  pointer-events: none;
}

.hero-glow-one {
  width: 190px;
  height: 190px;

  right: 80px;
  top: 60px;

  background: rgba(255, 66, 0, 0.15);
}

.hero-glow-two {
  width: 220px;
  height: 220px;

  right: 250px;
  bottom: -100px;

  background: rgba(84, 47, 255, 0.12);
}

.hero-content {
  position: relative;
  z-index: 3;

  width: 58%;

  padding: 48px 38px;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  padding: 6px 11px;

  border: 1px solid rgba(255, 75, 0, 0.65);
  border-radius: 999px;

  background: rgba(255, 67, 0, 0.05);

  color: #ff651c;

  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;

  box-shadow:
    0 0 12px rgba(255, 75, 0, 0.13);
}

.live-badge i {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: #ff5b15;

  box-shadow: 0 0 8px #ff5b15;
}

.hero h2 {
  margin: 18px 0 14px;

  font-size: clamp(54px, 7vw, 76px);
  line-height: 0.84;

  font-weight: 950;
  letter-spacing: -4px;

  color: #fff;

  text-shadow:
    0 0 22px rgba(255, 255, 255, 0.05);
}

.hero h2 span {
  color: #ff5412;

  text-shadow:
    0 0 16px rgba(255, 70, 0, 0.35),
    0 0 42px rgba(255, 70, 0, 0.14);
}

.hero-content > p {
  max-width: 580px;

  margin: 0 0 25px;

  color: #8f98aa;

  font-size: 12px;
  line-height: 1.7;
}

.hero-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.primary-button,
.secondary-button,
.outline-button,
.text-button {
  cursor: pointer;
}

.primary-button {
  height: 42px;

  padding: 0 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  border: 1px solid #ff671d;
  border-radius: 8px;

  background: linear-gradient(
    135deg,
    #ff6a1c,
    #ff4508
  );

  color: white;

  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.3px;

  box-shadow:
    0 0 15px rgba(255, 70, 0, 0.35),
    0 8px 25px rgba(255, 50, 0, 0.12);

  transition: 0.25s ease;
}

.primary-button:hover {
  transform: translateY(-2px);

  box-shadow:
    0 0 20px rgba(255, 70, 0, 0.65),
    0 10px 30px rgba(255, 50, 0, 0.18);
}

.primary-button span {
  font-size: 15px;
}

.secondary-button {
  height: 42px;

  padding: 0 18px;

  border: 1px solid #30394a;
  border-radius: 8px;

  background: rgba(10, 15, 23, 0.7);

  color: #dfe4ee;

  font-size: 10px;
  font-weight: 800;
}

/* HERO ART */

.hero-art {
  position: absolute;

  right: 55px;
  top: 50%;

  width: 280px;
  height: 280px;

  transform: translateY(-50%);

  display: flex;
  align-items: center;
  justify-content: center;

  opacity: 0.7;
}

.hero-art-ring {
  position: absolute;

  border-radius: 50%;

  border: 1px solid rgba(255, 73, 0, 0.35);

  box-shadow:
    0 0 15px rgba(255, 73, 0, 0.08);
}

.ring-one {
  width: 210px;
  height: 210px;
}

.ring-two {
  width: 145px;
  height: 145px;

  border-color: rgba(112, 62, 255, 0.4);

  box-shadow:
    0 0 20px rgba(112, 62, 255, 0.14);
}

.hero-art-text {
  position: relative;
  z-index: 2;

  font-size: 70px;
  font-weight: 950;

  color: rgba(255, 255, 255, 0.04);

  text-shadow:
    0 0 30px rgba(255, 255, 255, 0.05);
}

.hero-art-label {
  position: absolute;

  bottom: 30px;

  color: rgba(255, 75, 0, 0.4);

  font-size: 8px;
  letter-spacing: 5px;
  font-weight: 900;
}

/* =========================================================
   SECTIONS
   ========================================================= */

.section {
  position: relative;

  margin-top: 52px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  margin-bottom: 18px;
}

.eyebrow {
  display: block;

  margin-bottom: 5px;

  color: #ff5715;

  font-size: 7px;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.section-heading h3 {
  margin: 0;

  font-size: 21px;
  line-height: 1.1;

  letter-spacing: -0.6px;
}

.section-small {
  color: #697284;
  font-size: 8px;
}

/* =========================================================
   GAMES
   ========================================================= */

.games-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.game-card {
  position: relative;

  min-height: 220px;

  overflow: hidden;

  padding: 14px;

  border: 1px solid #293242;
  border-radius: 14px;

  background: #080d15;

  color: white;
  text-align: left;

  cursor: pointer;

  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.game-card:hover {
  transform: translateY(-5px);

  border-color: rgba(255, 79, 16, 0.8);

  box-shadow:
    0 0 22px rgba(255, 67, 0, 0.16);
}

.game-card-top {
  display: flex;
  justify-content: space-between;
}

.status {
  padding: 4px 7px;

  border-radius: 4px;

  font-size: 6px;
  font-weight: 900;
  letter-spacing: 0.7px;
}

.status-live {
  border: 1px solid rgba(0, 255, 128, 0.5);
  color: #36f39a;
  background: rgba(0, 255, 128, 0.05);

  box-shadow: 0 0 9px rgba(0, 255, 128, 0.12);
}

.status-soon {
  border: 1px solid #30384a;
  color: #747d8e;
}

.game-arrow {
  color: #70798a;
  font-size: 13px;
}

.game-visual {
  height: 105px;

  margin-top: 5px;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
}

.game-visual::before {
  content: "";

  position: absolute;

  width: 120px;
  height: 70px;

  border-radius: 50%;

  filter: blur(25px);

  background: rgba(255, 65, 0, 0.12);
}

.game-visual span {
  position: relative;
  z-index: 2;

  font-size: 48px;
  font-weight: 950;

  color: rgba(255, 255, 255, 0.08);
}

.game-info h4 {
  margin: 0;

  font-size: 14px;
}

.game-info p {
  margin: 4px 0 0;

  color: #697386;

  font-size: 8px;
}

.freefire {
  background:
    radial-gradient(
      circle at 80% 55%,
      rgba(255, 70, 0, 0.18),
      transparent 35%
    ),
    #080d15;
}

.bgmi {
  background:
    radial-gradient(
      circle at 80% 50%,
      rgba(0, 207, 255, 0.12),
      transparent 35%
    ),
    #080d15;
}

.moregame {
  background:
    radial-gradient(
      circle at 80% 50%,
      rgba(105, 57, 255, 0.18),
      transparent 35%
    ),
    #080d15;
}

/* =========================================================
   TOURNAMENTS
   ========================================================= */

.tournament-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tournament-card {
  position: relative;

  overflow: hidden;

  padding: 18px;

  border: 1px solid #2b3546;
  border-radius: 14px;

  background:
    radial-gradient(
      circle at 85% 10%,
      rgba(255, 69, 0, 0.11),
      transparent 30%
    ),
    #080d15;

  box-shadow:
    inset 0 0 40px rgba(255, 255, 255, 0.008);

  transition: 0.25s ease;
}

.tournament-card:hover {
  border-color: rgba(255, 77, 16, 0.75);

  box-shadow:
    0 0 25px rgba(255, 67, 0, 0.12);
}

.card-shine {
  position: absolute;

  top: -50px;
  right: -70px;

  width: 180px;
  height: 120px;

  background: rgba(255, 76, 10, 0.08);

  filter: blur(35px);

  pointer-events: none;
}

.tournament-top {
  position: relative;
  z-index: 2;

  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.game-label,
.game-label {
  color: #ff5715;

  font-size: 7px;
  font-weight: 900;
  letter-spacing: 1.1px;
}

.tournament-top h4 {
  margin: 5px 0 3px;

  font-size: 15px;
}

.tournament-top p {
  margin: 0;

  color: #677286;

  font-size: 7px;
}

.open-badge {
  height: 22px;

  display: flex;
  align-items: center;
  gap: 5px;

  padding: 0 8px;

  border: 1px solid rgba(0, 255, 130, 0.45);
  border-radius: 4px;

  color: #36f39a;

  font-size: 6px;
  font-weight: 900;
}

.open-badge i {
  width: 4px;
  height: 4px;

  border-radius: 50%;

  background: #36f39a;

  box-shadow: 0 0 7px #36f39a;
}

.match-time {
  display: grid;
  grid-template-columns: 1fr 1fr;

  margin-top: 17px;

  padding: 12px 0;

  border-top: 1px solid #27303e;
  border-bottom: 1px solid #27303e;
}

.match-time div,
.prize-grid div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.match-time span,
.prize-grid span {
  color: #687284;

  font-size: 6px;
  letter-spacing: 0.6px;
}

.match-time strong,
.prize-grid strong {
  color: #f2f4f8;

  font-size: 9px;
}

.prize-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;

  margin-top: 12px;
}

.prize-grid > div {
  padding: 10px;

  border: 1px solid #252e3c;
  border-radius: 7px;

  background: rgba(2, 5, 9, 0.4);
}

.orange-text {
  color: #ff5a16 !important;

  text-shadow:
    0 0 8px rgba(255, 75, 0, 0.35);
}

.players-row {
  display: flex;
  justify-content: space-between;

  margin-top: 14px;

  color: #6e788a;

  font-size: 7px;
}

.players-row strong {
  color: #e7ebf2;
}

.progress {
  height: 5px;

  margin-top: 7px;

  overflow: hidden;

  border-radius: 99px;

  background: #1b222d;
}

.progress-value {
  height: 100%;

  border-radius: inherit;

  background: linear-gradient(
    90deg,
    #ff4200,
    #ff751a
  );

  box-shadow:
    0 0 12px rgba(255, 75, 0, 0.6);
}

.join-button {
  width: 100%;
  height: 38px;

  margin-top: 14px;

  border: 0;
  border-radius: 7px;

  background: linear-gradient(
    90deg,
    #ff6819,
    #ff4c0c
  );

  color: white;

  font-size: 9px;
  font-weight: 900;

  cursor: pointer;

  box-shadow:
    0 0 14px rgba(255, 70, 0, 0.22);

  transition: 0.25s ease;
}

.join-button:hover {
  box-shadow:
    0 0 22px rgba(255, 70, 0, 0.5);

  transform: translateY(-1px);
}

.join-button span {
  margin-left: 10px;
}

/* =========================================================
   TOURNAMENT OVERVIEW
   ========================================================= */

.overview-section {
  position: relative;
}

.overview-section::before {
  content: "";

  position: absolute;

  left: -30%;
  right: -30%;

  top: 35%;

  height: 1px;

  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 73, 0, 0.25),
    rgba(100, 55, 255, 0.25),
    transparent
  );

  pointer-events: none;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr 1fr;
  gap: 10px;
}

.overview-card {
  min-height: 190px;

  position: relative;
  overflow: hidden;

  padding: 18px;

  border: 1px solid #293343;
  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      rgba(12, 18, 28, 0.96),
      rgba(6, 10, 17, 0.98)
    );

  transition: 0.25s ease;
}

.overview-card:hover {
  border-color: rgba(255, 74, 10, 0.65);

  box-shadow:
    0 0 20px rgba(255, 70, 0, 0.08);
}

.overview-main {
  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(255, 65, 0, 0.14),
      transparent 45%
    ),
    #080d15;
}

.overview-number {
  position: absolute;

  top: 12px;
  right: 15px;

  color: rgba(255, 255, 255, 0.05);

  font-size: 28px;
  font-weight: 950;
}

.overview-tag {
  display: block;

  margin-bottom: 9px;

  color: #ff5816;

  font-size: 6px;
  font-weight: 900;
  letter-spacing: 1px;
}

.overview-card h4 {
  margin: 0 0 9px;

  font-size: 13px;
}

.overview-card p {
  margin: 0;

  color: #697386;

  font-size: 8px;
  line-height: 1.6;
}

.overview-card ul {
  margin: 15px 0 0;
  padding: 0;

  list-style: none;
}

.overview-card li {
  padding: 6px 0;

  border-bottom: 1px solid #242c39;

  color: #7f8999;

  font-size: 7px;
}

.overview-card li::before {
  content: "•";

  margin-right: 7px;

  color: #ff5a16;
}

.outline-button {
  height: 30px;

  margin-top: 15px;

  padding: 0 10px;

  border: 1px solid rgba(255, 79, 16, 0.7);
  border-radius: 6px;

  background: rgba(255, 72, 0, 0.04);

  color: #ff6720;

  font-size: 7px;
  font-weight: 900;

  transition: 0.2s ease;
}

.outline-button:hover {
  background: rgba(255, 72, 0, 0.12);

  box-shadow:
    0 0 12px rgba(255, 72, 0, 0.25);
}

/* =========================================================
   RULES
   ========================================================= */

.rules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.rule-card {
  min-height: 68px;

  display: flex;
  align-items: flex-start;
  gap: 13px;

  padding: 14px;

  border: 1px solid #293342;
  border-radius: 11px;

  background:
    linear-gradient(
      90deg,
      rgba(255, 67, 0, 0.035),
      rgba(8, 13, 21, 0.95)
    );

  transition: 0.25s ease;
}

.rule-card:hover {
  border-color: rgba(255, 76, 10, 0.55);

  box-shadow:
    inset 3px 0 0 #ff5412,
    0 0 15px rgba(255, 65, 0, 0.07);
}

.rule-card > span {
  min-width: 22px;

  color: #ff5b16;

  font-size: 8px;
  font-weight: 900;
}

.rule-card h4 {
  margin: 0 0 4px;

  font-size: 9px;
}

.rule-card p {
  margin: 0;

  color: #687386;

  font-size: 7px;
  line-height: 1.5;
}

/* =========================================================
   TERMS
   ========================================================= */

.terms-section {
  margin-bottom: 35px;
}

.terms-card {
  position: relative;

  display: flex;
  align-items: flex-start;
  gap: 16px;

  min-height: 100px;

  padding: 20px;

  overflow: hidden;

  border: 1px solid #30374b;
  border-radius: 14px;

  background:
    radial-gradient(
      circle at 100% 50%,
      rgba(101, 58, 255, 0.18),
      transparent 50%
    ),
    linear-gradient(
      90deg,
      #080d15,
      #0b0e18
    );

  box-shadow:
    inset 0 0 35px rgba(83, 47, 255, 0.035);
}

.terms-card::after {
  content: "";

  position: absolute;

  left: 0;
  right: 0;
  bottom: 0;

  height: 1px;

  background: linear-gradient(
    90deg,
    #ff4d0a,
    transparent 35%,
    #663cff
  );

  box-shadow:
    0 0 12px rgba(255, 70, 0, 0.5);
}

.terms-icon {
  width: 36px;
  height: 36px;

  flex: 0 0 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #613cff;
  border-radius: 8px;

  color: #a184ff;

  font-size: 20px;

  background: rgba(90, 50, 255, 0.06);

  box-shadow:
    0 0 15px rgba(91, 52, 255, 0.16);
}

.terms-content {
  position: relative;
  z-index: 2;
}

.terms-content h3 {
  margin: 0 0 5px;

  font-size: 18px;
}

.terms-content p {
  max-width: 760px;

  margin: 0;

  color: #788396;

  font-size: 7px;
  line-height: 1.6;
}

.terms-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  margin-top: 8px;
}

.terms-links button {
  padding: 0;

  border: 0;

  background: transparent;

  color: #8993a4;

  font-size: 6px;

  cursor: pointer;
}

.terms-links button:hover {
  color: #ff641c;
}

/* =========================================================
   BOTTOM NAV
   ========================================================= */

.bottom-nav {
  position: fixed;

  left: 50%;
  bottom: 18px;

  z-index: 9999;

  width: min(540px, calc(100% - 30px));
  height: 62px;

  transform: translateX(-50%);

  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: stretch;

  padding: 5px;

  border: 1px solid rgba(64, 76, 97, 0.85);
  border-radius: 15px;

  background:
    linear-gradient(
      135deg,
      rgba(8, 13, 21, 0.96),
      rgba(6, 9, 16, 0.97)
    );

  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  box-shadow:
    0 15px 50px rgba(0, 0, 0, 0.65),
    0 0 25px rgba(77, 45, 255, 0.08);
}

.bottom-nav::before {
  content: "";

  position: absolute;

  left: 12%;
  right: 12%;
  top: -1px;

  height: 1px;

  background: linear-gradient(
    90deg,
    transparent,
    #ff5311,
    #633bff,
    transparent
  );

  box-shadow:
    0 0 10px rgba(255, 70, 0, 0.6);
}

.bottom-nav button {
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 4px;

  border: 0;
  border-radius: 10px;

  background: transparent;

  color: #596476;

  font-size: 6px;
  font-weight: 900;
  letter-spacing: 0.5px;

  cursor: pointer;

  transition: 0.2s ease;
}

.bottom-nav button span {
  font-size: 13px;
}

.bottom-nav button:hover {
  color: #dce1e9;

  background: rgba(255, 255, 255, 0.025);
}

.bottom-nav .nav-active {
  color: #ff5a16;

  background:
    radial-gradient(
      circle at center,
      rgba(255, 70, 0, 0.10),
      transparent 70%
    );

  text-shadow:
    0 0 9px rgba(255, 70, 0, 0.45);
}

.bottom-nav .nav-active::after {
  content: "";

  position: absolute;

  left: 50%;
  bottom: 4px;

  width: 18px;
  height: 2px;

  transform: translateX(-50%);

  border-radius: 99px;

  background: #ff5a16;

  box-shadow:
    0 0 9px #ff5a16;
}

/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 800px) {
  .topbar {
    height: 58px;
    padding: 0 12px;
  }

  .brand-copy h1 {
    font-size: 13px;
  }

  .main-content {
    width: min(100% - 20px, 650px);

    padding-top: 18px;
    padding-bottom: 125px;
  }

  .hero {
    min-height: 470px;

    border-radius: 17px;
  }

  .hero-content {
    width: 100%;

    padding: 32px 22px;
  }

  .hero h2 {
    font-size: clamp(52px, 16vw, 68px);
    letter-spacing: -3px;
  }

  .hero-content > p {
    max-width: 90%;

    font-size: 10px;
  }

  .hero-art {
    width: 180px;
    height: 180px;

    right: -40px;
    bottom: 15px;
    top: auto;

    transform: none;

    opacity: 0.4;
  }

  .ring-one {
    width: 145px;
    height: 145px;
  }

  .ring-two {
    width: 100px;
    height: 100px;
  }

  .hero-art-text {
    font-size: 48px;
  }

  .hero-art-label {
    bottom: 10px;
  }

  .games-grid,
  .tournament-grid,
  .overview-grid,
  .rules-grid {
    grid-template-columns: 1fr;
  }

  .game-card {
    min-height: 190px;
  }

  .tournament-card {
    padding: 15px;
  }

  .overview-card {
    min-height: auto;
  }

  .overview-main {
    min-height: 190px;
  }

  .section {
    margin-top: 38px;
  }

  .section-heading {
    align-items: flex-end;
  }

  .section-heading h3 {
    font-size: 19px;
  }

  .terms-card {
    padding: 16px;

    gap: 11px;
  }

  .terms-content h3 {
    font-size: 16px;
  }

  .bottom-nav {
    bottom: 10px;

    width: calc(100% - 20px);
    height: 58px;

    border-radius: 14px;
  }
}

/* =========================================================
   SMALL MOBILE
   ========================================================= */

@media (max-width: 480px) {
  .mini-wallet {
    min-width: 58px;

    padding: 3px 7px;
  }

  .wallet-info small {
    font-size: 5px;
  }

  .wallet-info strong {
    font-size: 9px;
  }

  .profile-button {
    width: 36px;
    height: 36px;
  }

  .hero {
    min-height: 455px;
  }

  .hero-content {
    padding: 28px 18px;
  }

  .hero h2 {
    font-size: 49px;

    letter-spacing: -2.5px;
  }

  .hero-content > p {
    font-size: 9px;
  }

  .primary-button {
    height: 40px;

    padding: 0 14px;

    font-size: 8px;
  }

  .prize-grid {
    gap: 5px;
  }

  .prize-grid > div {
    padding: 8px;
  }

  .terms-card {
    align-items: flex-start;
  }

  .terms-icon {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
  }

  .bottom-nav button {
    font-size: 5px;
  }

  .bottom-nav button span {
    font-size: 12px;
  }
}
