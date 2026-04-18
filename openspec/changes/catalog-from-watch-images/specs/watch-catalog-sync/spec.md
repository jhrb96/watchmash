## ADDED Requirements

### Requirement: Source folder defines catalog membership

The system SHALL build the watch catalog from image files residing in the repository folder **`watch images/`** (path relative to repo root, including the space in the folder name). The system SHALL include **one catalog entry per eligible image file** and SHALL NOT invent catalog rows that do not correspond to a file in that folder after a sync.

#### Scenario: Eligible file types

- **WHEN** a file in **`watch images/`** has an extension **`.png`**, **`.jpg`**, **`.jpeg`**, **`.webp`**, or **`.avif`** (case-insensitive)
- **THEN** it MAY be included in the catalog when sync runs

#### Scenario: Ignored files

- **WHEN** a file is named **`.DS_Store`** or does not match an eligible image extension
- **THEN** the sync procedure SHALL NOT create a catalog watch for that file

### Requirement: Stable ids and public URLs

Each synced watch SHALL have an **`id`** of the form **`w-`** followed by a **two-digit** zero-padded index (**`01`…`N`**) assigned in **deterministic sorted order** of source basenames. Each watch’s **`image`** path SHALL be under **`/watches/`** and SHALL resolve to a file deployed under **`public/watches/`** with a **safe filename** (e.g. **`w-01.png`**, **`w-07.avif`**) that does not require URL-encoding of spaces or shell metacharacters.

#### Scenario: Image URL is public-relative

- **WHEN** a watch has id **`w-03`**
- **THEN** its **`image`** field starts with **`/watches/`** and points at the synced asset in **`public/watches/`**

### Requirement: Display name derivation

Each watch SHALL have a non-empty **`name`** string suitable for UI labels. Unless a separate manifest overrides (out of scope unless implemented), the **`name`** SHALL be derived deterministically from the **source file’s basename** (e.g. strip extension, replace separators with spaces, trim).

#### Scenario: Name is human-readable

- **WHEN** a synced source file basename is **`GrandSeiko-SBGK007.png`**
- **THEN** the resulting **`name`** is a readable title (exact formatting as implemented) and is not the raw internal id alone

### Requirement: Documented sync command

The repository SHALL document and provide a **single documented command** (e.g. **`npm run sync:watches`**) that operators run after changing contents of **`watch images/`** to regenerate the catalog module and refresh **`public/watches/`** accordingly.

#### Scenario: README documents workflow

- **WHEN** a developer adds a new watch image to **`watch images/`**
- **THEN** the README instructs them to run the sync command before relying on updated **`WATCHES`** in the app
