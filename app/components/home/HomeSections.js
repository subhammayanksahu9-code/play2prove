export function Stat({ number, label }) {
  return (
    <div className="platformStat">
      <strong>{number}</strong>
      <span>{label}</span>
    </div>
  );
}


export function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="sectionTitle">

      <span>{eyebrow}</span>

      <h2>{title}</h2>

      <p>{text}</p>

    </div>
  );
}


export function TournamentCard({ tournament }) {

  const game = String(
    tournament?.game ?? "GAME"
  ).trim();

  const title = String(
    tournament?.title ?? "Tournament"
  ).trim();

  const status = String(
    tournament?.status ?? "Upcoming"
  ).trim();

  const image = String(
  tournament?.image ??
  tournament?.imageUrl ??
  ""
).trim();

const entry = String(
  tournament?.entryFee ??
  tournament?.entry ??
  "₹0"
).trim();

const prize = String(
  tournament?.prizePool ??
  tournament?.prize ??
  "₹0"
).trim();

  return (
    <article className="newTournamentCard">

      {image && (
        <div className="homeTournamentImage">
          <img
  src={image}
  alt={game}
  loading="lazy"
  decoding="async"
  fetchPriority="low"
/>
        </div>
      )}


      <div className="tournamentCardTop">

        <span>
          {game.toUpperCase()}
        </span>

        <small
          className={
            status.toLowerCase() === "open"
              ? "statusOpen"
              : "statusSoon"
          }
        >
          {status.toUpperCase()}
        </small>

      </div>


      <h3>
        {title}
      </h3>


      <div className="tournamentData">

        <div>
          <small>DATE</small>
          <strong>
            {tournament?.date || "—"}
          </strong>
        </div>

        <div>
          <small>TIME</small>
          <strong>
            {tournament?.time || "—"}
          </strong>
        </div>

        <div>
          <small>MODE</small>
          <strong>
            {tournament?.mode || "—"}
          </strong>
        </div>

      </div>


      <div className="tournamentData">

        <div>
          <small>MAP</small>
          <strong>
            {tournament?.map || "—"}
          </strong>
        </div>

        <div>
          <small>ENTRY</small>
          <strong>
            {entry}
          </strong>
        </div>

        <div>
          <small>PRIZE POOL</small>
          <strong>
            {prize}
          </strong>
        </div>

      </div>

      <button
  onClick={() => {
    const gameSlug = String(
      tournament?.game ?? ""
    )
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    window.location.href =
      `/tournaments?game=${encodeURIComponent(gameSlug)}`;
  }}
>
  VIEW & JOIN
  <span>→</span>
</button>

    </article>
  );
}


export function GameCard({
  game,
  type,
  image,
}) {

  const gameSlug = String(
    game ?? ""
  )
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return (
    <article
      className="newGameCard"
      onClick={() => {
        window.location.href =
          `/tournaments?game=${encodeURIComponent(gameSlug)}`;
      }}
      role="button"
      tabIndex={0}
    >

    <div className="gameImageNew">
      {image ? (
        <img
          src={image}
          alt={game}
          loading="lazy"
        />
      ) : (
        <div className="gameImageFallback">
          🎮
        </div>
      )}
    </div>

    <div className="gameCardInfo">

  <div className="gameStatusRowHome">
    <span
      className={`gameStatus ${String(type)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")}`}
    >
      {type}
    </span>
  </div>

  <div className="gameTitleRow">

    <h3>
      {game}
    </h3>

    <strong className="gameArrowNew">
      →
    </strong>

  </div>

</div>

  </article>
);
}
export function MoreGamesCard() {

  return (
    <article
      className="newGameCard moreGamesCard"
      onClick={() => {
        window.location.href = "/games";
      }}
    >

      <div className="moreGamesIcon">
        +
      </div>

      <div className="gameCardInfo">

        <span>
          EXPLORE
        </span>

        <h3>
          MORE GAMES
        </h3>

      </div>

      <strong className="gameArrowNew">
        →
      </strong>

    </article>
  );
}

export function Step({
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


export function LeaderboardRow({
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
