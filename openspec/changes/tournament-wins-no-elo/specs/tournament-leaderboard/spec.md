## ADDED Requirements

### Requirement: Win counters in Redis

The system SHALL maintain a non-negative integer win count per catalog watch id under the key pattern **`wins:<watchId>`** (exact prefix as implemented, documented in design). When a tournament completes, the system SHALL increment the champion’s key with **`INCR`** exactly once per completed tournament. Keys MAY be absent for watches that have never won; absent keys SHALL be treated as **zero** when reading the leaderboard.

#### Scenario: Champion increments once

- **WHEN** a tournament completes with champion id **C**
- **THEN** **`INCR wins:C`** occurs exactly once for that completion event

### Requirement: Leaderboard sorted by tournament wins

The system SHALL present a leaderboard that lists catalog watches ordered by **descending** tournament win count. The system SHALL **not** use Elo scores for ordering or display on the leaderboard page. The system SHALL define a **deterministic tie-break** when two watches share the same win count (e.g. ascending lexicographic order by **`watchId`**).

#### Scenario: Higher wins rank above

- **WHEN** watch **A** has strictly more tournament wins than watch **B**
- **THEN** **A** appears above **B** in the leaderboard

#### Scenario: Tie on wins

- **WHEN** two watches have identical win counts
- **THEN** ordering between them follows the documented deterministic tie-break rule consistently

### Requirement: No Elo on leaderboard

The system SHALL remove Elo columns, Elo-derived sorting, and Elo fetch logic from the leaderboard user experience and its backing API for this product surface.

#### Scenario: Leaderboard API response

- **WHEN** a client requests leaderboard data
- **THEN** the response includes win counts (or implied zero) per watch and does not require Elo fields for ranking
