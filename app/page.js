"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import "./components/home/home.css";
import { Stat, SectionTitle, TournamentCard, GameCard, MoreGamesCard, Step, LeaderboardRow } from "./components/home/HomeSections";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [walletRefreshing, setWalletRefreshing] = useState(false);
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [walletRequest, setWalletRequest] = useState(null);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestReference, setRequestReference] = useState("");

useEffect(() => {
  let active = true;
  async function loadPlayer() {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user || null;
    if (!active) return;
    setAuthUser(user);
    if (!user) { setPlayerName(""); setWalletBalance(null); return; }
    const { data: row, error } = await supabase.from("users").select("full_name, wallet_balance").eq("user_id", user.id).maybeSingle();
    if (!active) return;
    if (error) { console.error("PLAY2PROVE HOME PLAYER:", error); setPlayerName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Player"); setWalletBalance(null); return; }
    setPlayerName(row?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Player");
    setWalletBalance(Number(row?.wallet_balance || 0));
  }
  loadPlayer();
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user || null;
    setAuthUser(user);
    if (!user) { setPlayerName(""); setWalletBalance(null); }
    else setTimeout(() => loadPlayer(), 0);
  });
  return () => { active = false; listener?.subscription?.unsubscribe(); };
}, []);

async function refreshWallet() {
  if (!authUser || walletRefreshing) return;
  setWalletRefreshing(true);
  try {
    const { data, error } = await supabase.from("users").select("wallet_balance, full_name").eq("user_id", authUser.id).maybeSingle();
    if (error) throw error;
    setWalletBalance(Number(data?.wallet_balance || 0));
    if (data?.full_name) setPlayerName(data.full_name);
  } catch (error) { console.error("PLAY2PROVE WALLET REFRESH:", error); }
  finally { setWalletRefreshing(false); }
}

const [homeTournaments, setHomeTournaments] = useState([]);
const [homeTournamentLoading, setHomeTournamentLoading] = useState(true);
const [homeGames, setHomeGames] = useState([]);
const [homeGamesLoading, setHomeGamesLoading] = useState(true);  

useEffect(() => {
  let cancelled = false;

  async function loadHomeTournaments() {
    try {
      const response = await fetch("/api/tournaments", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "default",
      });

      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }

      const data = await response.json();

      const tournaments = Array.isArray(data?.tournaments)
        ? data.tournaments
        : [];
      const games = Array.isArray(data?.games)
  ? data.games
  : [];

      if (!cancelled) {
  setHomeTournaments(tournaments);
  setHomeGames(games);
  setHomeGamesLoading(false);
}
    } catch (error) {
      console.error(
        "PLAY2PROVE HOME TOURNAMENT API:",
        error
      );

      if (!cancelled) {
        setHomeTournaments([]);
        setHomeGames([]);
      }
    } finally {
      if (!cancelled) {
        setHomeTournamentLoading(false);
        setHomeGamesLoading(false);
      }
    }
  }

  loadHomeTournaments();

  return () => {
    cancelled = true;
  };
}, []);


/* =====================================================
   HOME FEATURED TOURNAMENT FILTER
===================================================== */

const featuredTournaments = useMemo(() => {

  const upcoming = homeTournaments.filter((item) => {

    const status = String(
      item?.status ?? ""
    ).trim().toLowerCase();

    const publish = item?.publish;

    const isPublished =
      publish === undefined ||
      publish === true ||
      String(publish).trim().toLowerCase() === "true" ||
      String(publish).trim().toLowerCase() === "yes" ||
      String(publish).trim() === "1";

    return (
      isPublished &&
      status === "upcoming" &&
      String(item?.game ?? "").trim()
    );
  });


  /* FIRST: ONE FROM EACH GAME */

  const selected = [];
  const usedGames = new Set();

  for (const tournament of upcoming) {

    const game = String(
      tournament?.game ?? ""
    )
      .trim()
      .toLowerCase();

    if (!game) continue;

    if (!usedGames.has(game)) {

      selected.push(tournament);
      usedGames.add(game);

    }

    if (selected.length === 3) {
      break;
    }
  }


  /* IF LESS THAN 3 GAMES,
     FILL REMAINING CARDS */

  if (selected.length < 3) {

    for (const tournament of upcoming) {

      if (selected.length === 3) {
        break;
      }

      if (!selected.includes(tournament)) {
        selected.push(tournament);
      }
    }
  }

  return selected.slice(0, 3);

}, [homeTournaments]);
  
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


        <div className="navActions">
          {authUser ? (
            <>
              <button className="headerIconButton downloadsButton" onClick={() => go("/downloads")} aria-label="Downloads" title="Downloads">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"/></svg><span>Downloads</span>
              </button>
              <div className="notificationWrap">
                <button className={`headerIconButton notificationButton ${noticeOpen ? "is-active" : ""}`} onClick={() => {setNoticeOpen(v=>!v);setWalletMenuOpen(false);}} aria-label="Notifications" title="Notifications">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><i className="notificationDot"/>
                </button>
                {noticeOpen && <div className="notificationDropdown"><div><strong>Notifications</strong><button onClick={()=>setNoticeOpen(false)} aria-label="Close notifications">×</button></div><p>You’re all caught up.</p><small>New tournament and wallet updates will appear here.</small></div>}
              </div>
              <div className="navWalletWrap">
                <button className={`navWallet ${walletMenuOpen ? "is-open" : ""}`} onClick={() => {setWalletMenuOpen(v => !v);setNoticeOpen(false);}} aria-expanded={walletMenuOpen} aria-label="Open wallet options">
                  <svg className="navWalletIcon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M16 14h2"/></svg><strong>{walletBalance === null ? "₹ —" : `₹${walletBalance.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`}</strong><span className="navWalletPlus">+</span>
                </button>
                {walletMenuOpen && <div className="navWalletDropdown">
                  <div className="navWalletDropHead"><small>PLAYER WALLET</small><strong>{walletBalance === null ? "₹ —" : `₹${walletBalance.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`}</strong></div>
                  <button onClick={refreshWallet} disabled={walletRefreshing}><span className="walletActionIcon"><svg viewBox="0 0 24 24"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"/></svg></span><span><b>{walletRefreshing ? "Refreshing..." : "Refresh Balance"}</b><small>Update current wallet balance</small></span></button>
                  <button onClick={() => {setWalletMenuOpen(false);setWalletRequest("Deposit");setRequestAmount("");setRequestReference("");}}><span className="walletActionIcon"><svg viewBox="0 0 24 24"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></span><span><b>Deposit</b><small>Add funds to your wallet</small></span></button>
                  <button onClick={() => {setWalletMenuOpen(false);setWalletRequest("Withdraw");setRequestAmount("");setRequestReference("");}}><span className="walletActionIcon"><svg viewBox="0 0 24 24"><path d="M12 5v14m-6-6 6 6 6-6"/></svg></span><span><b>Withdraw</b><small>Request wallet withdrawal</small></span></button>
                  <button onClick={() => {setWalletMenuOpen(false);go("/profile?section=transactions");}}><span className="walletActionIcon"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h4"/></svg></span><span><b>Transaction History</b><small>View deposits and withdrawals</small></span></button>
                </div>}
              </div>
              <button className="navProfile" onClick={() => go("/profile")} aria-label="Open player profile">
                <span className="navProfileAvatar">{(playerName || authUser.email || "P").charAt(0).toUpperCase()}</span><span className="navProfileText"><strong>{playerName || "Player"}</strong><small>MY PROFILE</small></span><span className="navProfileChevron">⌄</span>
              </button>
            </>
          ) : (
            <>
              <button className="navLogin" onClick={() => go("/login")}>Login</button>
              <button className="navSignup" onClick={() => go("/signup")}>Sign Up</button>
            </>
          )}
        </div>

      </header>


      {/* =====================================================
          TOP NEON RAIL
      ===================================================== */}

      {authUser && (
        <aside className={`p2pDockSidebar ${shortcutOpen ? "is-open" : ""}`} aria-label="Player Centre">
          <div className="quickPanelScroll">
            <div className="quickPanelBrand"><span className="quickBrandLogo">P2P</span><span><b>Play2Prove</b><small>PLAYER CENTRE</small></span></div>
            <div className="quickNavLabel">MAIN MENU</div>
            <nav className="quickNav">
              <button onClick={() => {setShortcutOpen(false);scrollTo("home");}}><span>⌂</span>Home</button>
              <button onClick={() => {setShortcutOpen(false);go("/all-tournaments");}}><span>♜</span>Tournaments</button>
              <button onClick={() => {setShortcutOpen(false);go("/matches");}}><span>⚔</span>My Matches</button>
              <button onClick={() => {setShortcutOpen(false);go("/leaderboard");}}><span>▥</span>Leaderboard</button>
              <button onClick={() => {setShortcutOpen(false);go("/rewards");}}><span>♙</span>Rewards</button>
              <button onClick={() => {setShortcutOpen(false);go("/store");}}><span>▣</span>Store</button>
              <button onClick={() => {setShortcutOpen(false);go("/refer");}}><span>♧</span>Refer &amp; Earn</button>
            </nav>
            <div className="quickNavLabel quickAccountLabel">ACCOUNT &amp; SUPPORT</div>
            <nav className="quickNav quickAccountNav">
              <button onClick={() => {setShortcutOpen(false);go("/profile");}}><span>♙</span>My Profile</button>
              <button onClick={() => {setShortcutOpen(false);go("/help");}}><span>ⓘ</span>Help Center</button>
            </nav>
            <div className="quickPanelSocial"><small>SOCIAL LINKS</small><div><a href="https://wa.me/?text=https%3A%2F%2Fplay2prove.vercel.app" target="_blank" rel="noreferrer">↗</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">◎</a><a href="https://www.youtube.com/" target="_blank" rel="noreferrer">▷</a></div></div>
          </div>
          <div className="quickPanelFoot"><span/>PLAY • COMPETE • EARN • PROVE</div>
          <button className="p2pDockToggle" onClick={() => setShortcutOpen(v => !v)} aria-label={shortcutOpen ? "Collapse player centre" : "Expand player centre"} title={shortcutOpen ? "Collapse sidebar" : "Expand sidebar"}>
            <span>{shortcutOpen ? "‹" : "☰"}</span><small>{shortcutOpen ? "COLLAPSE" : "MENU"}</small>
          </button>
        </aside>
      )}

      {walletRequest && (
        <div className="walletModalBackdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setWalletRequest(null);}}>
          <section className="walletRequestModal" role="dialog" aria-modal="true" aria-labelledby="walletRequestTitle">
            <button className="walletModalClose" onClick={()=>setWalletRequest(null)} aria-label="Close dialog"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
            <div className="walletModalEyebrow">PLAYER WALLET</div>
            <h2 id="walletRequestTitle">{walletRequest} Funds</h2>
            <p>{walletRequest==="Deposit" ? "Enter the amount you want to add to your wallet." : "Enter the amount you want to withdraw from your wallet."}</p>
            <label htmlFor="walletAmount">Amount (₹)</label>
            <input id="walletAmount" type="number" min="1" step="1" placeholder="Enter amount" value={requestAmount} onChange={e=>setRequestAmount(e.target.value)}/>
            {walletRequest==="Deposit" ? <><label htmlFor="walletReference">Payment reference / UTR (optional)</label><input id="walletReference" value={requestReference} onChange={e=>setRequestReference(e.target.value)} placeholder="Enter UTR after payment"/></> : <><label htmlFor="walletReference">UPI ID / Bank details</label><input id="walletReference" value={requestReference} onChange={e=>setRequestReference(e.target.value)} placeholder="Enter withdrawal details"/></>}
            <div className="walletModalNotice">Payment gateway and wallet request processing are not connected yet. This form is a UI preview; no money will be transferred or request submitted.</div>
            <button className="walletModalPrimary" onClick={()=>setWalletRequest(null)}>Close</button>
          </section>
        </div>
      )}
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
              onClick={() => go("/all-tournaments")}
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

        <button onClick={() => go("/all-tournaments")}>
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

  {homeTournamentLoading ? (

    <div className="tournamentMessage">
      LOADING TOURNAMENTS...
    </div>

  ) : featuredTournaments.length > 0 ? (

    featuredTournaments.map((tournament) => (
      <TournamentCard
        key={tournament.id}
        tournament={tournament}
      />
    ))

  ) : (

    <div className="tournamentMessage">
      NO UPCOMING TOURNAMENTS
    </div>

  )}

</div>


        <div className="centerButton">

          <button
            className="outlineButton"
            onClick={() => go("/all-tournaments")}
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

  {homeGamesLoading ? (

    <div className="tournamentMessage">
      LOADING GAMES...
    </div>

  ) : homeGames.length > 0 ? (

    <>
      {homeGames.slice(0, 3).map((game) => (

        <GameCard
          key={game.gameName}
          game={game.gameName}
          image={game.image}
          type={game.status || "LIVE"}
        />

      ))}

      <MoreGamesCard />

    </>

  ) : (

    <div className="tournamentMessage">
      NO GAMES AVAILABLE
    </div>

  )}

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

          <div className="skillCards">

  <div className="skillCard">
    <small>COMPETE</small>
    <strong>Build Your Skill</strong>
  </div>

  <div className="skillCard">
    <small>RANK</small>
    <strong>Climb The Leaderboard</strong>
  </div>

  <div className="skillCard">
    <small>REWARD</small>
    <strong>Win. Prove. Earn.</strong>
  </div>

</div>

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
            onClick={() => go("/all-tournaments")}
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

          <button onClick={() => go("/all-tournaments")}>
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
