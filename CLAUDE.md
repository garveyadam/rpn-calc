# CLAUDE.md — RPN Calc

You are picking up a finished design + a near-complete native implementation. Read this
before doing anything.

## What this project is
A **Reverse Polish Notation (RPN) calculator for iOS**, in the visual style of the
Garvey Adam LLP brand (deep navy gradient, accent blue, HP-style visible stack).

There are **two tracks** in this repo:

1. **HTML prototype — the reference, not the product.**
   - `RPN Calc App.html` + `rpn-core.jsx`, `rpn-ui.jsx`, `rpn-sheets.jsx`, `rpn-app.jsx`
     — the fully working web app. Open it to see exact intended look & behavior.
   - `RPN Calculator.html` — an earlier 3-variation exploration (Pure Apple / Brand-tinted /
     Brand instrument). **Brand-tinted (navy) was chosen.** Ignore the other two.
   - These are design references. Do not ship them.

2. **SwiftUI source — the product. THIS is the source of truth.**
   - Everything under `swiftui/`. It is a faithful, idiomatic 1:1 port of the prototype,
     written for **iOS 16.4+**, no third-party dependencies.

## Your job
Stand up a buildable, runnable native iOS app from the `swiftui/` source.

1. Create an Xcode iOS App project (SwiftUI lifecycle), product name `RPNCalc`,
   bundle id of the user's choosing, deployment target **iOS 16.4**.
2. Delete Xcode's generated `RPNCalcApp.swift` / `ContentView.swift` and add ALL files
   from `swiftui/` (see `swiftui/README.md` for the exact group structure).
3. Install the **app icon** (`swiftui/AppIcon/appicon-1024.png` → single 1024 slot) and the
   **launch screen** (`swiftui/Launch/` → storyboard + two Single-Scale image sets
   `LaunchBackground` / `LaunchMark`; set Launch Screen File = `LaunchScreen`).
   Full steps are in `swiftui/README.md`.
4. Build (`xcodebuild` or in Xcode). **Fix any compiler errors you hit** — the code is
   written to compile but I could not run a Swift toolchain when authoring it, so treat
   warnings/errors as real and resolve them without changing behavior or design.
5. Verify against the prototype: run `RPN Calc App.html` side by side and match behavior.

## Hard rules
- **Do not redesign.** Match the prototype's layout, colors, type, and motion exactly.
  Design tokens and RPN semantics are specified in `design_handoff_rpn_calc/README.md`.
- **Preserve RPN correctness.** The engine semantics (stack lift, enter, operator commit,
  roll, scientific ops, history strings) are defined in `swiftui/Model/CalculatorModel.swift`
  and mirrored in `rpn-core.jsx`. If you refactor, keep behavior identical — there are
  worked examples in the handoff README to test against.
- **No new dependencies.** Pure SwiftUI + Foundation + UIKit feedback only.
- Keep persistence (`UserDefaults`), haptics, and key sounds intact.

## Where to read more
- `swiftui/README.md` — Xcode setup, file map, web→Swift mapping table, polish checklist.
- `design_handoff_rpn_calc/README.md` — full design spec: tokens, every screen, every
  interaction, and RPN test cases. Self-sufficient.
