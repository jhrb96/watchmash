## ADDED Requirements

### Requirement: Catalog size is fourteen

The system SHALL expose exactly **14** watches in the in-repository catalog **`WATCHES`**. The system SHALL NOT include catalog entries with numeric suffixes outside **1** through **14** for the default generated ids **`w-01`** … **`w-14`**.

#### Scenario: Leaderboard row count

- **WHEN** the leaderboard page or `fetchLeaderboard` enumerates the catalog
- **THEN** exactly **14** rows are produced (one per catalog watch)

#### Scenario: Tournament participant pool

- **WHEN** a tournament start selects participants using largest power of two not exceeding catalog length
- **THEN** the maximum participants per tournament is **8** for a catalog of length **14**

### Requirement: Image path per watch

Each catalog entry SHALL use an **`image`** path of the form **`/watches/w-{nn}.png`** where **`{nn}`** is the two-digit zero-padded index from **01** to **14**, matching the watch **`id`** suffix.

#### Scenario: Id and image alignment

- **WHEN** a watch has id **`w-07`**
- **THEN** its **`image`** field is **`/watches/w-07.png`**

### Requirement: Valid id predicate

The function **`isValidWatchId`** (or equivalent) SHALL return **true** only for ids present in **`WATCHES`** and **false** for any id not in that set (including former ids such as **`w-33`** once removed).

#### Scenario: Unknown id rejected

- **WHEN** a client submits **`w-20`** to an API that validates against the catalog
- **THEN** validation fails because **`w-20`** is not a catalog id
