## ADDED Requirements

### Requirement: Home page shows the duel

The system SHALL render the random pairwise watch duel (two watches, user picks a winner, then loads a new random pair) as part of the **`/`** route response such that a user can complete the full duel flow without navigating to any other path first.

#### Scenario: Vote from home

- **WHEN** a user opens `/` in a browser
- **THEN** the page includes the duel UI with two watches and a way to submit a choice that triggers the existing vote API and refreshes the pair

#### Scenario: Same API behavior

- **WHEN** the user votes from `/`
- **THEN** the system uses the same duel and vote endpoints and Elo update semantics as when the duel UI was only on `/duel`

### Requirement: Site navigation reflects home as duel entry

The global navigation (or equivalent persistent chrome) SHALL expose **`/`** as the primary entry for the duel experience. The system SHALL NOT require users to visit `/duel` to reach the duel.

#### Scenario: Nav from any page

- **WHEN** a user views any page that includes global navigation
- **THEN** they can reach the duel experience via a link to `/` without using `/duel` as the only path

### Requirement: Legacy duel path redirects

The system SHALL respond to **`GET /duel`** with a **permanent redirect** to **`/`** so existing bookmarks and external links continue to work.

#### Scenario: Old bookmark

- **WHEN** a client requests `/duel`
- **THEN** the response is a permanent redirect whose location is `/`
