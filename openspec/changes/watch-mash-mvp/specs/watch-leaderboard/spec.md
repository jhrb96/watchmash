## ADDED Requirements

### Requirement: Global leaderboard

The system SHALL expose a global leaderboard listing every watch in the fixed catalog ordered by current Elo descending. Each row SHALL include at minimum the watch identifier, display label, and current Elo used for ordering.

#### Scenario: Ordered by Elo

- **WHEN** a user views the leaderboard
- **THEN** watches appear sorted from highest Elo to lowest Elo

#### Scenario: Catalog completeness

- **WHEN** the leaderboard is rendered
- **THEN** every catalog watch appears exactly once

### Requirement: Tie-breaking

When two watches share the same Elo, the system SHALL apply a deterministic tie-breaker so sort order is stable (e.g. ascending watch id).

#### Scenario: Equal Elo

- **WHEN** two or more watches have identical Elo values
- **THEN** their relative order is deterministic across refreshes

### Requirement: Default rating for unseen watches

If Redis has no Elo value for a catalog watch, the system SHALL treat that watch as having the configured initial Elo when displaying or sorting the leaderboard.

#### Scenario: Missing Redis key

- **WHEN** a catalog watch has never received a vote
- **THEN** the leaderboard still lists it using the initial Elo constant
