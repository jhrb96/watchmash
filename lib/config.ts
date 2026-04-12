export const INITIAL_ELO = 1500;
export const ELO_K = 32;

export const COOKIE_RATE_UID = "watchmash_rl_uid";

export function getRateLimitConfig() {
  const ipMax = Number(process.env.RATE_LIMIT_IP_MAX ?? "30");
  const cookieMax = Number(process.env.RATE_LIMIT_COOKIE_MAX ?? "30");
  const windowSec = Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? "3600");
  return {
    ipMax: Number.isFinite(ipMax) ? ipMax : 30,
    cookieMax: Number.isFinite(cookieMax) ? cookieMax : 30,
    windowSec: Number.isFinite(windowSec) ? windowSec : 3600,
  };
}
