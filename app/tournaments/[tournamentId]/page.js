"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import "./tournament-detail.css";

const API_URL = "/api/tournaments";

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  return String(value ?? "").trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatMoney(value) {
  const raw = clean(value);

  if (!raw) {
    return "—";
  }

  if (raw.includes("₹")) {
    return raw;
  }

  const number = Number(
    raw.replace(/[₹,\s]/g, "")
  );

  if (!Number.isFinite(number)) {
    return raw;
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

function normalizeStatus(value) {
  const status = clean(value)
    .toLowerCase()
    .replace(/_/g, " ");

  if (status === "upcoming") {
    return "UPCOMING";
  }

  if (
    status === "live" ||
    status === "match ongoing"
  ) {
    return "LIVE";
  }

  if (
    status === "calculation ongoing" ||
    status === "calculation pending"
  ) {
    return "CALCULATION ONGOING";
  }

  if (
    status === "past" ||
    status === "completed"
  ) {
    return "COMPLETED";
  }

  return clean(value).toUpperCase() || "UPCOMING";
}

/* =========================================================
   DEFAULT RULES
========================================================= */

const DEFAULT_RULES = [
  {
    icon: "🎮",
    title: "MATCH FORMAT",
    rules: [
      "Tournament mode and team format must be followed.",
      "Only registered players are allowed to participate.",
      "Players must join the official tournament room.",
      "Match settings announced by Play2Prove are final."
    ]
  },
  {
    icon: "📝",
    title: "REGISTRATION RULES",
    rules: [
      "One player can register only according to tournament eligibility.",
      "Correct Game UID must be provided.",
      "Registration is confirmed only after successful verification.",
      "Entry fee is non-refundable after tournament confirmation."
    ]
  },
  {
    icon: "🕹️",
    title: "GAMEPLAY RULES",
    rules: [
      "Teaming with opponents is not allowed.",
      "Cheats, hacks or third-party unfair tools are prohibited.",
      "Players must follow official match instructions.",
      "Admin decisions during the tournament are binding."
    ]
  },
  {
    icon: "🔫",
    title: "KILL RULES",
    rules: [
      "Only valid kills recorded by the tournament system are counted.",
      "Disputed kills may be reviewed by the admin.",
      "Invalid or manipulated kills will not receive rewards."
    ]
  },
  {
    icon: "🚫",
    title: "DISQUALIFICATION",
    rules: [
      "Cheating may result in immediate disqualification.",
      "Intentional teaming may result in tournament removal.",
      "Providing fake player information can lead to account action."
    ]
  }
];

/* =========================================================
   SAMPLE PLAYERS
========================================================= */

const SAMPLE_PLAYERS = [
  {
    id: 1,
    name: "ShadowX",
    uid: "123456",
    team: "Solo"
  },
  {
    id: 2,
    name: "DarkKing",
    uid: "456789",
    team: "Team Alpha"
  },
  {
    id: 3,
    name: "Xtreme",
    uid: "789123",
    team: "Team Alpha"
  },
  {
    id: 4,
    name: "BeastOP",
    uid: "456321",
    team: "Night Squad"
  },
  {
    id: 5,
    name: "Raider",
    uid: "987654",
    team: "Night Squad"
  }
];

/* =========================================================
   COMPONENT
========================================================= */

export default function TournamentDetailPage() {
  const params = useParams();

  const tournamentId = clean(
    params?.tournamentId
  );

  const [tournament, setTournament] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("overview");

  const [playerSearch, setPlayerSearch] =
    useState("");

  const [joinOpen, setJoinOpen] =
    useState(false);

  const [joinName, setJoinName] =
    useState("");

  const [joinUID, setJoinUID] =
    useState("");

  const [joinMessage, setJoinMessage] =
    useState("");

  const [openRule, setOpenRule] =
    useState(0);

  /* =======================================================
     FETCH TOURNAMENT
  ======================================================= */

  useEffect(() => {
    if (!tournamentId) {
      return;
    }

    async function loadTournament() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}?_=${Date.now()}`,
          {
            cache: "no-store"
          }
        );

        if (!response.ok) {
          throw new Error(
            "Tournament server is unavailable."
          );
        }

        const data =
          await response.json();

        const list =
          Array.isArray(data?.tournaments)
            ? data.tournaments
            : Array.isArray(data)
            ? data
            : [];

        const decodedId =
          decodeURIComponent(tournamentId);

        const found = list.find(
          (item, index) => {
            const generatedId =
              clean(item?.id) ||
              `${slugify(
                item?.game || item?.gameName
              )}-${slugify(
                item?.date
              )}-${slugify(
                item?.time
              )}-${index}`;

            const possibleIds = [
              generatedId,
              item?.id,
              item?.tournamentId,
              item?.tournamentName,
              item?.title
            ]
              .filter(Boolean)
              .map(slugify);

            return possibleIds.includes(
              slugify(decodedId)
            );
          }
        );

        if (!found) {
          throw new Error(
            "Tournament not found."
          );
        }

        setTournament(found);
      } catch (err) {
        console.error(err);

        setError(
          err?.message ||
          "Unable to load tournament."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTournament();
  }, [tournamentId]);

  /* =======================================================
     FILTER PLAYERS
  ======================================================= */

  const filteredPlayers =
    useMemo(() => {
      const query =
        playerSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return SAMPLE_PLAYERS;
      }

      return SAMPLE_PLAYERS.filter(
        (player) =>
          player.name
            .toLowerCase()
            .includes(query) ||
          player.uid
            .toLowerCase()
            .includes(query) ||
          player.team
            .toLowerCase()
            .includes(query)
      );
    }, [playerSearch]);

  /* =======================================================
     JOIN FUNCTIONS
  ======================================================= */

  function openJoin() {
    setJoinMessage("");
    setJoinOpen(true);
  }

  function closeJoin() {
    setJoinOpen(false);
    setJoinName("");
    setJoinUID("");
    setJoinMessage("");
  }

  function confirmJoin() {
    const name =
      joinName.trim();

    const uid =
      joinUID.trim();

    if (!name || !uid) {
      setJoinMessage(
        "Please enter Player Name and Game UID."
      );

      return;
    }

    setJoinMessage(
      `Tournament join request ready for ${name}.`
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="tdPage">
        <div className="tdLoading">
          <div className="tdSpinner" />

          <strong>
            LOADING TOURNAMENT
          </strong>

          <span>
            Connecting to Play2Prove...
          </span>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !tournament) {
    return (
      <main className="tdPage">
        <div className="tdError">
          <div className="tdErrorIcon">
            ⚠
          </div>

          <h2>
            TOURNAMENT UNAVAILABLE
          </h2>

          <p>
            {error ||
              "Tournament could not be found."}
          </p>

          <button
            onClick={() => {
              window.location.href =
                "/tournaments";
            }}
          >
            ← BACK TO TOURNAMENTS
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     TOURNAMENT DATA
  ======================================================= */

  const title =
    clean(
      tournament.tournamentName ||
      tournament.title
    ) ||
    "Tournament";

  const game =
    clean(
      tournament.game ||
      tournament.gameName
    ) ||
    "Game";

  const mode =
    clean(tournament.mode) ||
    "—";

  const map =
    clean(tournament.map) ||
    "—";

  const date =
    clean(tournament.date) ||
    "—";

  const time =
    clean(tournament.time) ||
    "—";

  const slot =
    clean(tournament.slot);

  const image =
    clean(tournament.image);

  const entryFee =
    formatMoney(
      tournament.entryFee
    );

  const prizePool =
    formatMoney(
      tournament.prizePool
    );

  const perKill =
    formatMoney(
      tournament.perKill
    );

  const status =
    normalizeStatus(
      tournament.status
    );

  const joined =
    Number(
      tournament.joined ||
      tournament.registeredPlayers ||
      SAMPLE_PLAYERS.length
    );

  const maxPlayers =
    Number(
      tournament.maxPlayers ||
      tournament.slots ||
      100
    );

  const availableSlots =
    Math.max(
      0,
      maxPlayers - joined
    );

  const progress =
    Math.min(
      100,
      Math.max(
        0,
        (joined / maxPlayers) * 100
      )
    );

  /* =======================================================
     RETURN PAGE
  ======================================================= */

  return (
    <main className="tdPage">

      {/* TOP BAR */}

      <div className="tdTopBar">

        <button
          className="tdBackButton"
          onClick={() => {
            window.location.href =
              "/tournaments";
          }}
        >
          ← BACK
        </button>

        <div className="tdId">
          {clean(
            tournament.id ||
            tournament.tournamentId
          ) || title}
        </div>

      </div>


      {/* HERO */}

      <section className="tdHero">

        {image && (
          <div
            className="tdHeroImage"
            style={{
              backgroundImage:
                `url("${image}")`
            }}
          />
        )}

        <div className="tdHeroOverlay" />

        <div className="tdHeroContent">

          <div className="tdGameRow">

            <span className="tdGameBadge">
              🎮 {game}
            </span>

            <span
              className={`tdStatus ${status
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              ● {status}
            </span>

          </div>


          <h1>
            {title}
          </h1>


          <div className="tdMeta">

            <span>
              {mode}
            </span>

            <span>•</span>

            <span>
              {map}
            </span>

            <span>•</span>

            <span>
              {date}
            </span>

            <span>•</span>

            <span>
              {time}
            </span>

          </div>


          <div className="tdStats">

            <div className="tdStat">
              <span>ENTRY</span>
              <strong>
                {entryFee}
              </strong>
            </div>

            <div className="tdStat">
              <span>PRIZE POOL</span>
              <strong>
                {prizePool}
              </strong>
            </div>

            <div className="tdStat">
              <span>PER KILL</span>
              <strong>
                {perKill}
              </strong>
            </div>

            <div className="tdStat">
              <span>PLAYERS</span>
              <strong>
                {joined}/{maxPlayers}
              </strong>
            </div>

          </div>


          <div className="tdJoinArea">

            <div className="tdSlotInfo">

              <div>

                <strong>
                  {availableSlots}
                </strong>

                <span>
                  SLOTS AVAILABLE
                </span>

              </div>


              <div className="tdProgress">

                <div
                  style={{
                    width:
                      `${progress}%`
                  }}
                />

              </div>

            </div>


            {status === "UPCOMING" ||
            status === "LIVE" ? (

              <button
                className="tdJoinButton"
                onClick={openJoin}
              >
                VIEW & JOIN →
              </button>

            ) : (

              <div className="tdClosed">
                {status}
              </div>

            )}

          </div>

        </div>

      </section>


      {/* TABS */}

      <nav className="tdTabs">

        {[
          ["overview", "OVERVIEW"],
          ["players", "PLAYERS"],
          ["rules", "RULES"],
          ["prizes", "PRIZES"],
          ["match", "MATCH INFO"]
        ].map(([id, label]) => (

          <button
            key={id}
            className={
              activeTab === id
                ? "tdTab active"
                : "tdTab"
            }
            onClick={() =>
              setActiveTab(id)
            }
          >
            {label}
          </button>

        ))}

      </nav>


      {/* CONTENT */}

      <section className="tdContent">


        {/* OVERVIEW */}

        {activeTab === "overview" && (

          <div className="tdGrid">

            <section className="tdCard tdMainCard">

              <div className="tdCardTitle">

                <div>

                  <span>
                    TOURNAMENT
                  </span>

                  <h2>
                    OVERVIEW
                  </h2>

                </div>

              </div>


              <div className="tdDetailsGrid">

                <div>
                  <span>GAME</span>
                  <strong>{game}</strong>
                </div>

                <div>
                  <span>MODE</span>
                  <strong>{mode}</strong>
                </div>

                <div>
                  <span>MAP</span>
                  <strong>{map}</strong>
                </div>

                <div>
                  <span>DATE</span>
                  <strong>{date}</strong>
                </div>

                <div>
                  <span>TIME</span>
                  <strong>{time}</strong>
                </div>

                <div>
                  <span>TIME SLOT</span>

                  <strong>
                    {slot || "—"}
                  </strong>
                </div>

              </div>

            </section>


            <aside className="tdCard">

              <div className="tdCardTitle">

                <div>

                  <span>
                    QUICK
                  </span>

                  <h2>
                    INFO
                  </h2>

                </div>

              </div>


              <div className="tdQuickInfo">

                <div>

                  <span>
                    ENTRY FEE
                  </span>

                  <strong>
                    {entryFee}
                  </strong>

                </div>


                <div>

                  <span>
                    PRIZE POOL
                  </span>

                  <strong>
                    {prizePool}
                  </strong>

                </div>


                <div>

                  <span>
                    PER KILL
                  </span>

                  <strong>
                    {perKill}
                  </strong>

                </div>

              </div>

            </aside>

          </div>

        )}


        {/* PLAYERS */}

        {activeTab === "players" && (

          <section className="tdCard">

            <div className="tdPlayersHeader">

              <div>

                <span>
                  REGISTERED
                </span>

                <h2>
                  PLAYERS
                </h2>

              </div>


              <div className="tdPlayerCount">
                {joined} / {maxPlayers}
              </div>

            </div>


            <input
              className="tdSearch"
              value={playerSearch}
              onChange={(event) =>
                setPlayerSearch(
                  event.target.value
                )
              }
              placeholder="Search player, UID or team..."
            />


            <div className="tdPlayerList">

              {filteredPlayers.map(
                (player, index) => (

                  <article
                    className="tdPlayer"
                    key={player.id}
                  >

                    <div className="tdPlayerNumber">

                      {String(
                        index + 1
                      ).padStart(2, "0")}

                    </div>


                    <div className="tdAvatar">

                      {player.name
                        .charAt(0)
                        .toUpperCase()}

                    </div>


                    <div className="tdPlayerInfo">

                      <strong>
                        {player.name}
                      </strong>

                      <span>
                        UID: {player.uid}
                        {" • "}
                        {player.team}
                      </span>

                    </div>


                    <div className="tdJoined">
                      ✓ JOINED
                    </div>

                  </article>

                )
              )}

            </div>

          </section>

        )}


        {/* RULES */}

        {activeTab === "rules" && (

          <section className="tdRules">

            <div className="tdSectionIntro">

              <span>
                PLAY2PROVE
              </span>

              <h2>
                TOURNAMENT RULES
              </h2>

              <p>
                Please read all rules before
                joining the tournament.
              </p>

            </div>


            {DEFAULT_RULES.map(
              (section, index) => {

                const isOpen =
                  openRule === index;

                return (

                  <article
                    className={
                      isOpen
                        ? "tdRuleSection open"
                        : "tdRuleSection"
                    }
                    key={section.title}
                  >

                    <button
                      className="tdRuleHeader"
                      onClick={() =>
                        setOpenRule(
                          isOpen
                            ? null
                            : index
                        )
                      }
                    >

                      <div>

                        <span className="tdRuleIcon">
                          {section.icon}
                        </span>

                        <strong>
                          {section.title}
                        </strong>

                      </div>


                      <span className="tdChevron">

                        {isOpen
                          ? "−"
                          : "+"}

                      </span>

                    </button>


                    {isOpen && (

                      <div className="tdRuleBody">

                        {section.rules.map(
                          (rule, ruleIndex) => (

                            <div
                              className="tdRuleItem"
                              key={ruleIndex}
                            >

                              <span>
                                {ruleIndex + 1}
                              </span>

                              <p>
                                {rule}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </article>

                );
              }
            )}

          </section>

        )}


        {/* PRIZES */}

        {activeTab === "prizes" && (

          <section className="tdCard">

            <div className="tdSectionIntro">

              <span>
                REWARDS
              </span>

              <h2>
                PRIZE INFORMATION
              </h2>

            </div>


            <div className="tdPrizeHero">

              <span>
                TOTAL PRIZE POOL
              </span>

              <strong>
                {prizePool}
              </strong>

            </div>


            <div className="tdPrizeGrid">

              <div>

                <span>
                  🏆
                </span>

                <strong>
                  PLACEMENT PRIZES
                </strong>

                <p>
                  Final placement rewards
                  will be calculated according
                  to tournament rules.
                </p>

              </div>


              <div>

                <span>
                  🔫
                </span>

                <strong>
                  KILL REWARD
                </strong>

                <p>
                  {perKill} per valid kill,
                  subject to tournament rules.
                </p>

              </div>

            </div>

          </section>

        )}


        {/* MATCH INFO */}

        {activeTab === "match" && (

          <section className="tdGrid">

            <section className="tdCard">

              <div className="tdCardTitle">

                <div>

                  <span>
                    MATCH
                  </span>

                  <h2>
                    INFORMATION
                  </h2>

                </div>

              </div>


              <div className="tdDetailsGrid">

                <div>
                  <span>GAME</span>
                  <strong>{game}</strong>
                </div>

                <div>
                  <span>MODE</span>
                  <strong>{mode}</strong>
                </div>

                <div>
                  <span>MAP</span>
                  <strong>{map}</strong>
                </div>

                <div>
                  <span>START DATE</span>
                  <strong>{date}</strong>
                </div>

                <div>
                  <span>START TIME</span>
                  <strong>{time}</strong>
                </div>

              </div>

            </section>


            <aside className="tdCard tdRoomCard">

              <span>
                ROOM DETAILS
              </span>

              <h2>
                🔒 LOCKED
              </h2>

              <p>
                Room ID and password will
                be available to eligible
                registered players at the
                scheduled room release time.
              </p>

            </aside>

          </section>

        )}

      </section>


      {/* JOIN MODAL */}

      {joinOpen && (

        <div
          className="tdModal"
          onClick={closeJoin}
        >

          <div
            className="tdModalBox"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="tdModalClose"
              onClick={closeJoin}
            >
              ×
            </button>


            <span>
              JOIN TOURNAMENT
            </span>

            <h2>
              {title}
            </h2>


            <p>
              Enter your player details.
            </p>


            <input
              value={joinName}
              onChange={(event) =>
                setJoinName(
                  event.target.value
                )
              }
              placeholder="Player Name"
            />


            <input
              value={joinUID}
              onChange={(event) =>
                setJoinUID(
                  event.target.value
                )
              }
              placeholder="Game UID"
            />


            {joinMessage && (

              <div className="tdJoinMessage">
                {joinMessage}
              </div>

            )}


            <button
              className="tdConfirmJoin"
              onClick={confirmJoin}
            >
              CONTINUE →
            </button>


            <small>
              Phase 1 test flow.
              Registration database integration
              will be added next.
            </small>

          </div>

        </div>

      )}

    </main>
  );
}
