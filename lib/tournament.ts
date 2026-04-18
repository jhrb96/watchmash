export type TournamentSession = {
  order: string[];
  /** Next pick the client must send (0 = first pick). */
  pickIndex: number;
  roundQueue: string[];
  nextRound: string[];
  status: "active" | "complete";
  championId?: string;
  /** Cached terminal JSON for complete sessions. */
  terminalResponseJson?: string;
  completedPicks: Array<{
    pickIndex: number;
    winnerId: string;
    loserId: string;
    responseJson: string;
  }>;
};

/** `order` is the bracket seed order (already shuffled by the caller). */
export function createTournamentSessionFromOrder(order: string[]): TournamentSession {
  const o = [...order];
  return {
    order: o,
    pickIndex: 0,
    roundQueue: [...o],
    nextRound: [],
    status: "active",
    completedPicks: [],
  };
}

export function currentPairIds(s: TournamentSession): [string, string] | null {
  if (s.status !== "active") return null;
  if (s.roundQueue.length >= 2) {
    return [s.roundQueue[0]!, s.roundQueue[1]!];
  }
  return null;
}

function advanceBracketAfterValidPick(s: TournamentSession, winnerId: string): void {
  s.roundQueue.shift();
  s.roundQueue.shift();
  s.nextRound.push(winnerId);

  while (s.status === "active") {
    if (s.roundQueue.length >= 2) return;

    if (s.roundQueue.length === 0 && s.nextRound.length === 1) {
      s.status = "complete";
      s.championId = s.nextRound[0]!;
      s.nextRound = [];
      return;
    }

    if (s.roundQueue.length === 0 && s.nextRound.length > 1) {
      s.roundQueue = [...s.nextRound];
      s.nextRound = [];
      continue;
    }

    /** Odd-sized round: lone waiter joins winners (bye), then promotion continues. */
    if (s.roundQueue.length === 1 && s.nextRound.length > 0) {
      s.nextRound.push(s.roundQueue.shift()!);
      continue;
    }

    if (s.roundQueue.length === 1 && s.nextRound.length === 0) {
      s.status = "complete";
      s.championId = s.roundQueue[0]!;
      s.roundQueue = [];
      return;
    }

    if (s.roundQueue.length === 0 && s.nextRound.length === 0) {
      return;
    }

    return;
  }
}

export type PickProcessResult =
  | { kind: "complete_replay"; bodyJson: string }
  | { kind: "idempotent_replay"; bodyJson: string }
  | { kind: "conflict"; expectedPickIndex: number; leftId?: string; rightId?: string }
  | { kind: "bad_request"; message: string }
  | {
      kind: "success";
      newSession: TournamentSession;
      responseJson: string;
      winsIncrKey: string | null;
    };

function cloneSession(s: TournamentSession): TournamentSession {
  return {
    order: [...s.order],
    pickIndex: s.pickIndex,
    roundQueue: [...s.roundQueue],
    nextRound: [...s.nextRound],
    status: s.status,
    championId: s.championId,
    terminalResponseJson: s.terminalResponseJson,
    completedPicks: s.completedPicks.map((c) => ({ ...c })),
  };
}

/**
 * Pure pick handler: validates idempotency and pair, returns new session + response JSON
 * (caller supplies `responseJson` builder for success via callback to avoid circular types).
 */
export function processPick(
  session: TournamentSession,
  input: { pickIndex: number; winnerId: string; loserId: string },
  buildResponse: (s: TournamentSession) => string,
): PickProcessResult {
  if (session.status === "complete") {
    if (!session.terminalResponseJson) {
      return { kind: "bad_request", message: "Session is complete but missing payload" };
    }
    return { kind: "complete_replay", bodyJson: session.terminalResponseJson };
  }

  const { pickIndex, winnerId, loserId } = input;

  if (pickIndex > session.pickIndex) {
    const pair = currentPairIds(session);
    return {
      kind: "conflict",
      expectedPickIndex: session.pickIndex,
      leftId: pair?.[0],
      rightId: pair?.[1],
    };
  }

  if (pickIndex < session.pickIndex) {
    const hit = session.completedPicks.find(
      (c) =>
        c.pickIndex === pickIndex &&
        c.winnerId === winnerId &&
        c.loserId === loserId,
    );
    if (hit) {
      return { kind: "idempotent_replay", bodyJson: hit.responseJson };
    }
    const pair = currentPairIds(session);
    return {
      kind: "conflict",
      expectedPickIndex: session.pickIndex,
      leftId: pair?.[0],
      rightId: pair?.[1],
    };
  }

  const pair = currentPairIds(session);
  if (!pair) {
    return { kind: "bad_request", message: "No active match" };
  }
  const [leftId, rightId] = pair;
  if (winnerId === loserId) {
    return { kind: "bad_request", message: "winnerId and loserId must differ" };
  }
  if (
    (winnerId !== leftId || loserId !== rightId) &&
    (winnerId !== rightId || loserId !== leftId)
  ) {
    return { kind: "bad_request", message: "winnerId and loserId must match the current pair" };
  }
  if (winnerId !== leftId && winnerId !== rightId) {
    return { kind: "bad_request", message: "winnerId must be one of the current pair" };
  }

  const next = cloneSession(session);
  advanceBracketAfterValidPick(next, winnerId);
  next.pickIndex = session.pickIndex + 1;

  const responseJson = buildResponse(next);
  next.completedPicks.push({
    pickIndex: session.pickIndex,
    winnerId,
    loserId,
    responseJson,
  });

  if (next.status === "complete" && next.championId) {
    next.terminalResponseJson = responseJson;
  }

  const winsIncrKey =
    next.status === "complete" && next.championId ? next.championId : null;

  return {
    kind: "success",
    newSession: next,
    responseJson,
    winsIncrKey,
  };
}
