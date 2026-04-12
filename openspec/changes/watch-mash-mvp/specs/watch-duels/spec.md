## ADDED Requirements

### Requirement: Random duel pair

The system SHALL present a duel consisting of exactly two distinct watches from the fixed catalog, selected uniformly at random from all valid unordered pairs.

#### Scenario: Two watches shown

- **WHEN** a client requests a new duel
- **THEN** the response includes two catalog watch identifiers that are not equal and both exist in the catalog

#### Scenario: Randomness over time

- **WHEN** many duels are requested over time
- **THEN** pair selection is not deterministic on a single fixed ordering (i.e. uses random selection per the catalog)

### Requirement: Winner submission updates Elo only

The system SHALL accept a submission identifying the winning watch and the losing watch for the current duel, validate both ids against the catalog, apply a standard 1v1 Elo update to both watches, persist only the updated Elo values in Redis, and SHALL NOT persist individual vote records.

#### Scenario: Valid winner

- **WHEN** the client submits a winner id and loser id that are both in the catalog and are distinct
- **THEN** the system updates Redis-stored Elo for both watches and responds with success

#### Scenario: Invalid id rejected

- **WHEN** either submitted id is not in the catalog or both ids are equal
- **THEN** the system does not change Elo and responds with an error

### Requirement: Anonymous usage

The system SHALL NOT require user accounts, registration, or login to submit duels or view the leaderboard.

#### Scenario: No auth gate

- **WHEN** an unauthenticated user opens the duel or leaderboard experience
- **THEN** all MVP features remain usable without credentials

### Requirement: Rate limit by IP

The system SHALL enforce a configurable maximum number of successful vote submissions per time window per client IP address.

#### Scenario: IP limit exceeded

- **WHEN** a client IP has already reached the vote limit within the current window
- **THEN** the system rejects the vote submission without changing Elo

### Requirement: Rate limit by cookie

The system SHALL enforce a configurable maximum number of successful vote submissions per time window per opaque client cookie identifier (independent of the IP limit).

#### Scenario: Cookie issued

- **WHEN** a client without the rate-limit cookie submits a vote
- **THEN** the system may set or refresh an httpOnly cookie carrying an opaque identifier used for subsequent cookie-bucket limits

#### Scenario: Cookie limit exceeded

- **WHEN** the cookie bucket has reached its limit within the current window
- **THEN** the system rejects the vote submission without changing Elo

### Requirement: Dual rate limits both apply

The system SHALL require both IP-based and cookie-based limits to allow a vote: exceeding either limit results in rejection.

#### Scenario: IP ok but cookie blocked

- **WHEN** the IP is under its limit but the cookie bucket is exhausted
- **THEN** the vote is rejected

#### Scenario: Cookie ok but IP blocked

- **WHEN** the cookie bucket is under its limit but the IP is exhausted
- **THEN** the vote is rejected
