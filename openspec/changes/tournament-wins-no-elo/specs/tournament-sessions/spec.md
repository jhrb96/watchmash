## ADDED Requirements

### Requirement: Tournament participant count

The system SHALL build each tournament from exactly **M** distinct catalog watches, where **M** is the **largest power of two** less than or equal to the catalog size. The **M** watches SHALL be chosen **uniformly at random** from the catalog (each valid subset of size **M** equally likely, or an equivalent procedure such as shuffle-all then take prefix). The system SHALL **reject** tournament start with **400** if the catalog contains fewer than **two** watches.

#### Scenario: Catalog larger than a power of two

- **WHEN** the catalog has more than **M** watches where **M** is the largest power of two not exceeding the catalog length
- **THEN** each tournament uses exactly **M** watches selected at random before shuffling for the bracket

#### Scenario: Catalog is a power of two

- **WHEN** the catalog length equals **M** for some integer **M = 2^k**
- **THEN** the tournament uses every catalog watch exactly once in that run’s random draw (equivalent to **M** drawn from the full set)

### Requirement: Tournament start

The system SHALL expose **`POST /api/tournament/start`** (or equivalent path documented in implementation) that creates a new server session, stores the **full shuffled order** of the **M** participant ids in Redis, initializes **`pickIndex`** to **0**, initializes bracket progression state sufficient to determine the **first** head-to-head pair, assigns a short TTL to the session key, and returns **200** with **`sessionId`**, **`pickIndex`**, and the **first** match as two distinct catalog ids with display metadata if applicable.

#### Scenario: Successful start

- **WHEN** a client calls start with a valid catalog configuration
- **THEN** the response includes **`sessionId`**, **`pickIndex`** of **0**, and two valid catalog identifiers forming the first match

### Requirement: Tournament pick and advancement

The system SHALL expose **`POST /api/tournament/pick`** that accepts **`sessionId`**, **`pickIndex`**, **`winnerId`**, and **`loserId`**. The system SHALL verify the session exists and is not already complete, that **`pickIndex`** equals the server’s expected index, that **`winnerId`** and **`loserId`** match the **current** match pair, and that **`winnerId`** is one of those two ids. On success, the system SHALL advance the bracket **exactly once**, increment **`pickIndex`**, refresh session TTL, and return either the **next** match (two ids) or a **terminal** payload naming the **champion** id. Advancement and response generation MUST be **atomic** so concurrent duplicate requests cannot double-advance.

#### Scenario: Valid pick mid-bracket

- **WHEN** the client sends a pick with correct **`sessionId`**, matching **`pickIndex`**, and **`winnerId`** / **`loserId`** equal to the current pair in the correct roles
- **THEN** the bracket advances by one match and the response reflects the next match or completion

#### Scenario: Tournament completes

- **WHEN** a successful pick leaves exactly one remaining competitor
- **THEN** the response marks completion, the session is marked **complete**, and **`INCR wins:<championId>`** executes **exactly once** for that champion

#### Scenario: Invalid pair or wrong winner id

- **WHEN** **`winnerId`** and **`loserId`** are not exactly the current pair or **`winnerId`** is not one of the two current competitors
- **THEN** the system returns **400** and does not advance the bracket or increment wins

#### Scenario: Unknown or expired session

- **WHEN** **`sessionId`** is missing or not found or the session has expired
- **THEN** the system returns **404** or **410** as appropriate and does not mutate wins

### Requirement: Pick index idempotency (Option A)

The system SHALL implement **pickIndex**-based idempotency. If a request carries **`pickIndex`** **less than** the server’s expected value **and** the tuple **`(pickIndex, winnerId, loserId)`** matches a pick that was **already successfully applied** for that session, the system SHALL return **200** with the **same** response body as returned immediately after that pick (no additional bracket advance, no additional **`INCR`**). If **`pickIndex`** is **less than** expected but does not match a completed pick, the system SHALL return **409** with enough information for the client to resync (**expected `pickIndex`**, current match if applicable). If **`pickIndex`** is **greater than** expected, the system SHALL return **409**.

#### Scenario: Client retries duplicate successful pick

- **WHEN** the client repeats the same successful pick request (same **`sessionId`**, **`pickIndex`**, **`winnerId`**, **`loserId`**) due to double-submit or network retry
- **THEN** the bracket advances at most once total and the duplicate receives the same logical outcome as specified for idempotent replay

### Requirement: No rate limiting

The system SHALL **not** apply IP-based or cookie-based rate limits to **`/api/tournament/start`** or **`/api/tournament/pick`**.

#### Scenario: Many starts from one client

- **WHEN** a client issues many valid start requests
- **THEN** each start that passes validation creates a distinct session subject only to TTL and resource limits, without artificial per-IP vote throttling

### Requirement: Removal of duel and Elo vote endpoints

The system SHALL **remove** or **disable** **`GET /api/duel`** and **`POST /api/vote`** as part of this capability’s delivery, and the application SHALL not rely on Elo updates for tournament play.

#### Scenario: Old endpoints unavailable

- **WHEN** a client calls the former duel or vote paths
- **THEN** the server responds with **404** or the routes are absent from the deployment
