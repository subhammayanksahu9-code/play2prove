// Play2Prove single-source tournament lifecycle. All times are IST.
export const TOURNAMENT_PHASES = Object.freeze({
  NORMAL_CARD: "NORMAL CARD",
  JOIN_MATCH: "JOIN MATCH",
  VERIFICATION: "VERIFYING PLAYER IDENTITY",
  MATCH_STARTED: "MATCH STARTED",
  RESULT_REVEALED: "RESULT REVEALED",
  PROOF_RECALCULATION: "PROOF / RECALCULATION",
  COMPLETED: "COMPLETED",
});

export function parseTournamentStart(dateValue, timeValue) {
  const dateText = String(dateValue ?? "").trim();
  const timeText = String(timeValue ?? "").trim().toUpperCase();
  if (!dateText || !timeText) return null;

  let year, month, day;
  let match = dateText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    year = Number(match[1]); month = Number(match[2]) - 1; day = Number(match[3]);
  } else {
    match = dateText.match(/^(\d{1,2})[\s-]+([A-Z]{3,9})[\s-]+(\d{2,4})$/i)
      || dateText.match(/^(\d{1,2})\s+([A-Z]{3,9})(?:\s+(\d{4}))?$/i);
    if (!match) return null;
    day = Number(match[1]);
    const months = { JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11 };
    month = months[match[2].slice(0,3).toUpperCase()];
    year = Number(match[3]) || new Date().getFullYear();
    if (year < 100) year += 2000;
  }
  if (!Number.isInteger(day) || !Number.isInteger(month) || month < 0 || month > 11 || day < 1 || day > 31) return null;

  let hour, minute;
  const twentyFour = timeText.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (twentyFour) {
    hour = Number(twentyFour[1]); minute = Number(twentyFour[2]);
  } else {
    const twelve = timeText.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)$/);
    if (!twelve) return null;
    hour = Number(twelve[1]); minute = Number(twelve[2] || 0);
    if (hour < 1 || hour > 12 || minute > 59) return null;
    if (twelve[3] === "AM" && hour === 12) hour = 0;
    if (twelve[3] === "PM" && hour !== 12) hour += 12;
  }
  const utc = Date.UTC(year, month, day, hour, minute) - 330 * 60 * 1000;
  const check = new Date(utc + 330 * 60 * 1000);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month || check.getUTCDate() !== day) return null;
  return utc;
}

export function getTournamentLifecycle(tournament, now = Date.now()) {
  const start = parseTournamentStart(
    tournament?.matchDate ?? tournament?.date ?? tournament?.match_date,
    tournament?.startTime ?? tournament?.time ?? tournament?.start_time
  );
  if (!Number.isFinite(start)) return { phase: TOURNAMENT_PHASES.NORMAL_CARD, key: "NORMAL_CARD", start: null, elapsed: null, registrationOpen: false, paymentOpen: false, roomAccessAllowed: false };
  const elapsed = now - start;
  let key;
  if (elapsed < -30 * 60_000) key = "NORMAL_CARD";
  else if (elapsed < -15 * 60_000) key = "JOIN_MATCH";
  else if (elapsed < 0) key = "VERIFICATION";
  else if (elapsed < 45 * 60_000) key = "MATCH_STARTED";
  else if (elapsed < 75 * 60_000) key = "RESULT_REVEALED";
  else if (elapsed < 120 * 60_000) key = "PROOF_RECALCULATION";
  else key = "COMPLETED";

  return {
    phase: TOURNAMENT_PHASES[key],
    key,
    start,
    elapsed,
    registrationOpen: key === "NORMAL_CARD" || key === "JOIN_MATCH",
    paymentOpen: key === "NORMAL_CARD" || key === "JOIN_MATCH",
    roomAccessAllowed: key === "MATCH_STARTED" || key === "RESULT_REVEALED" || key === "PROOF_RECALCULATION" || key === "COMPLETED",
  };
}
