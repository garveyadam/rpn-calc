# Handoff: RPN Calc (iOS)

## Overview
A Reverse Polish Notation (RPN) calculator for iOS, styled in the Garvey Adam LLP brand
(deep navy gradient, accent blue, HP-style visible stack). It supports full RPN arithmetic,
scientific functions, a visible 4-register stack with roll, a history "tape," persistence,
haptics + key sounds, and accent theming.

## About the design files
This repo contains **both** a design reference and a production implementation:

- **HTML prototype = reference.** `RPN Calc App.html` (with `rpn-core.jsx`, `rpn-ui.jsx`,
  `rpn-sheets.jsx`, `rpn-app.jsx`) is the fully working web app demonstrating the intended
  look and behavior. It is a reference prototype — **not** the code to ship.
- **SwiftUI source = production.** Everything under `swiftui/` is a faithful native port,
  written for iOS 16.4+, no dependencies. **This is what gets built and shipped.**

The task is **not** to recreate the HTML in a new framework — the native code already
exists. The task is to scaffold an Xcode project around `swiftui/`, integrate the icon +
launch screen, fix any compile issues, and verify behavior against the prototype.
(See root `CLAUDE.md` for the step-by-step.)

## Fidelity
**High-fidelity.** Final colors, typography, spacing, motion, and interactions. Recreate
exactly; do not restyle.

---

## Screens / Views

### 1. Main calculator (`ContentView` → `swiftui/Views/`)
Vertical stack, dark, on the navy gradient. Top → bottom:

- **Control bar** (`ControlBar.swift`)
  - Left: accent dot (7pt, glowing) + wordmark `RPN` (13pt bold, tracking 4) +
    `DEG`/`RAD` pill (tap toggles angle mode).
  - Right: three pill buttons — `ƒ(x)` (toggles the scientific tray, fills with accent when
    on), `clock` (opens History), `gearshape` (opens Settings).
- **Stack display** (`StackDisplayView.swift`)
  - Right-aligned registers labelled **T, Z, Y, X** bottom-up; X is the live/entry line.
  - X: 54pt light, rounded, monospaced digits, white. Y/Z/T: 21pt, muted. Empty slots use
    a faint placeholder; empty X shows `0`.
  - Labels 11pt semibold, tracking 2.5; the X label uses the accent color.
  - Tapping the display opens the **deep-stack sheet**.
  - Animates a subtle "lift" on every push/compute (`.id(pulse)` + spring). Invalid ops
    trigger a horizontal **shake** (`ShakeEffect`).
- **Scientific tray** (`SciTray.swift`) — collapsible; shown only when `ƒ(x)` is on.
  - Header `FUNCTIONS` (10pt bold tracking 2) + a `2nd` toggle pill.
  - 5-column grid, 10 keys. Primary / 2nd labels:
    `sin·cos·tan·ln·log·x²·√·1/x·yˣ·π` ↔ `sin⁻¹·cos⁻¹·tan⁻¹·eˣ·10ˣ·x³·∛·n!·ˣ√y·e`.
- **Keypad** (`Keypad.swift`) — 4-column grid:
  - Row 1: `AC` `⌫` `x⇄y` `R↓` (function keys, faint accent fill).
  - Rows 2–5: `7 8 9 ÷` / `4 5 6 ×` / `1 2 3 −` / `0 . +/− +`.
  - Row 6: `ENTER` — full width, accent fill, semibold, tracking 0.18em.
  - Number keys: translucent white. Operator/ENTER: accent. Press = scale 0.93 + brighten.

### 2. History sheet (`HistorySheet.swift`)
Medium/large detent. Scrollable list of past computations (newest first), each a card
showing the operation string (e.g. `9 yˣ 2 = 81`, `sin(25) = 0.4226182617`) + a `PUSH`
pill. Tapping a row pushes that result back onto the stack and dismisses. Empty state with
guidance copy.

### 3. Settings sheet (`SettingsSheet.swift`)
Large detent. Grouped rows: **Angle units** (DEG/RAD segmented), **Decimal precision**
(Auto/2/4/6 segmented), **Thousands separators** / **Key sounds** / **Haptics** (toggles),
**Clear history** (destructive), an **Accent** swatch picker, footer `Garvey Adam LLP · RPN`.

### 4. Deep-stack sheet (`DeepStackSheet.swift`)
Medium/large detent. Lists every stack register bottom-up (X accent-labelled) with formatted
values, then **Roll ↑ / Roll ↓ / x⇄y** buttons and a destructive **Clear stack**.

---

## Interactions & behavior (RPN semantics — keep identical)
- **Digit/point** build the live entry (X). Leading-zero handled; one decimal point.
- **ENTER** pushes the entry onto the stack; with no entry it duplicates X.
- **Binary op** (`+ − × ÷`, plus `yˣ`, `ˣ√y`) commits the entry, then `Y op X` → result.
- **Unary fn** acts on X (commits entry first). DEG/RAD applies to trig.
- **Constants** `π`, `e` push (committing any entry first — a stack "lift").
- **`+/−`** negates the entry or X. **`⌫`** deletes one entry char. **`DROP`/R↓ /R↑ /x⇄y**
  manage the stack. **AC** clears stack + entry.
- **Errors** (÷0, invalid) → `Error` in X + shake; never crash. AC recovers.
- **Persistence**: stack + history (UserDefaults JSON) and all settings persist across launches.
- **Feedback**: every key fires a haptic (`UIImpactFeedbackGenerator`) and a key-press sound
  (`AudioServicesPlaySystemSound(1104)`), each gated by its setting.

### RPN test cases (must all pass)
| Keys | Result (X) |
|---|---|
| `12 ENTER 7 +` | `19` |
| `12 ENTER 7 −` | `5` |
| `6 ENTER 7 ×` | `42` |
| `20 ENTER 4 ÷` | `5` |
| `3 ENTER 4 ENTER 5 + +` | `12` |
| `8 ENTER 2 x⇄y −` | `−6` |
| `9 ENTER 2 yˣ` | `81` |
| `25 sin` (DEG) | `0.4226182617` |
| `5 ENTER 9 DROP` | stack `[5]` |
| `7 +/−` | `−7` |

## State management
- `CalculatorModel: ObservableObject` — `stack: [Double]`, `entry: String?`,
  `history: [HistoryItem]`, `pulse: Int`, `errorFlash: Bool`. All ops are methods. Persists
  on mutation.
- `AppSettings: ObservableObject` — `angle`, `precisionRaw` (-1=auto), `separators`, `sound`,
  `haptics`, `accentHex`. Persists to UserDefaults.

## Design tokens
- **Background** (gradient, top→bottom): `#00496E` → `#002847` → `#001B30`.
- **Accent** (default Azure): `#0099FF`. Options: `#0072CE` Cobalt, `#FF9F0A` Amber,
  `#34C759` Green, `#5E5CE6` Indigo.
- **Display**: white `#FFFFFF`; muted `#DCECFF`@50%; placeholder `#B4D2EB`@16%; label `#96C4E8`@60%.
- **Keys**: number `white@10%`; function `#0099FF@16%` text `#BFE3FF`; sci `white@7%`;
  operator/ENTER = accent; stroke `white@6%`.
- **Sheets**: bg `#06243A`; card `white@5%`; edge `white@8%`; text `#EAF4FF`; sub `#B4D2EB@55%`;
  danger `#FF6B6B`.
- **Type**: numerals = SF Rounded (DM Sans optional — see polish note). X 54 / regs 21 /
  num keys 30 / sci keys 16 / ENTER 17.
- **Radii**: number keys 20, sci keys 14, ENTER 32 (pill), sheets 30 top, cards 14–16.
- **Key press**: scale 0.93, brightness +0.12, ~0.09s ease-out.

## Assets
- `swiftui/AppIcon/appicon-1024.png` — App Store icon (opaque, square).
- `swiftui/Launch/launch-bg.png`, `launch-mark.png`, `LaunchScreen.storyboard`.
- Brand fonts: `fonts/DMSans-VariableFont_opsz_wght.ttf` (optional; SF Rounded used by default).

## Files
- **Build these:** everything in `swiftui/` (see `swiftui/README.md` for the file map and
  Xcode steps).
- **Reference only:** `RPN Calc App.html` + `rpn-*.jsx` (run it to compare behavior);
  `RPN Calculator.html` (earlier exploration — Brand-tinted was chosen).
