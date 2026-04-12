## ADDED Requirements

### Requirement: Two-column duel on mobile viewports

The duel interface SHALL display the two watch options **side by side** (two columns in a single row) when the viewport width is below Tailwind’s `sm` breakpoint (i.e. typical smartphone portrait widths), not only at `sm` and above.

#### Scenario: Narrow viewport

- **WHEN** the user views the duel on a viewport width less than `640px`
- **THEN** both watches are visible at the same time in a horizontal two-column layout (left and right)

#### Scenario: Wider viewport

- **WHEN** the user views the duel on a viewport width of `640px` or greater
- **THEN** the duel continues to show both watches side by side with layout that does not regress below the pre-change desktop experience

### Requirement: Usable tap targets on small screens

The system SHALL keep each watch choice as an obvious, tappable control on narrow viewports (e.g. full card remains clickable with no requirement to use a separate tiny control).

#### Scenario: Vote by tapping a watch on phone

- **WHEN** a user taps either watch card on a narrow viewport
- **THEN** the vote action for that watch is submitted as today, without requiring scroll to reach the second option first
