# RPN Calc — SwiftUI

A native SwiftUI port of the Brand-tinted RPN calculator prototype. This is a faithful
1:1 translation of the web app: same RPN engine, same navy Garvey Adam aesthetic, same
features (scientific functions, history tape, deep-stack roll, settings, persistence,
haptics + key sounds, accent theming).

Target: **iOS 16.4+** · Swift 5.9 · SwiftUI. No third-party dependencies.

---

## 1. Create the Xcode project

1. Open **Xcode → File → New → Project… → iOS → App**.
2. Product Name: `RPNCalc` · Interface: **SwiftUI** · Language: **Swift**.
   (Leave Core Data / Tests off — not needed.)
3. Xcode generates `RPNCalcApp.swift` and `ContentView.swift`. **Delete both** from the
   project (move to Trash) — this package ships its own.

## 2. Add these source files

Drag the contents of this `swiftui/` folder into the Xcode project navigator
(**✔ Copy items if needed**, **✔ Create groups**). Recommended grouping:

```
RPNCalc/
├── RPNCalcApp.swift            ← @main entry
├── Model/
│   ├── Operations.swift        ← BinaryOp / UnaryFn / AngleMode
│   ├── Formatting.swift        ← number & entry formatting
│   ├── CalculatorModel.swift   ← the RPN engine (ObservableObject) + persistence
│   ├── AppSettings.swift       ← preferences (UserDefaults)
│   └── Theme.swift             ← palette + accent options
├── Support/
│   ├── Color+Hex.swift
│   └── Feedback.swift          ← Core Haptics + key-press sound
└── Views/
    ├── ContentView.swift       ← composition + shake/sheets
    ├── ControlBar.swift
    ├── StackDisplayView.swift
    ├── SciTray.swift
    ├── Keypad.swift            ← KeyButton + numeric keypad
    ├── HistorySheet.swift
    ├── SettingsSheet.swift     ← also defines SheetChrome / Segmented / groups
    └── DeepStackSheet.swift
```

## 3. Project settings

- **Deployment target:** iOS 16.4 (uses `presentationDetents` / `presentationBackground`).
- **Display Name:** RPN Calc.
- **Supported orientations:** Portrait (recommended — the layout is portrait-first).
- **Appearance:** the app forces dark via `.preferredColorScheme(.dark)`.

Press **⌘R**. It builds and runs with no further wiring.

---

## How the web app maps to Swift

| Web (HTML/JSX)                | SwiftUI                                            |
|-------------------------------|---------------------------------------------------|
| `rpnReduceApp` reducer        | `CalculatorModel` methods (`enter()`, `binary()`…)|
| `rpnFmt` / `fmtEntry`         | `NumberFormat.string` / `.entry`                  |
| `localStorage`                | `UserDefaults` (Codable stack + history)          |
| `useTweaks` accent            | `AppSettings.accentHex` + in-app accent picker    |
| WebAudio click + `vibrate`    | `Feedback` → `AudioServicesPlaySystemSound(1104)` + `UIImpactFeedbackGenerator` |
| CSS `max-height` sci tray     | `if sciOpen { SciTray() }` + `.transition`        |
| Bottom-sheet divs             | `.sheet` + `presentationDetents`                  |
| `.rpn-lift` keyframe          | `.id(model.pulse)` + spring transition            |
| `.rpn-shake`                  | `ShakeEffect` modifier                            |

The RPN semantics are identical — same stack-lift behavior, same history strings,
same scientific set (sin/cos/tan + inverses, ln/log/eˣ/10ˣ, x²/x³, √/∛, 1/x, n!,
yˣ/ˣ√y, π/e), same DEG/RAD handling.

---

## Polishing toward the App Store

These are the native-only touches worth adding before shipping (all straightforward):

1. **App icon** — ✅ included. `AppIcon/appicon-1024.png` is a 1024², opaque,
   square PNG (navy gradient + accent X register + keypad). To install it:
   open `Assets.xcassets → AppIcon` and drag the 1024 PNG onto the single
   **"1024pt · Any Appearance"** well (Xcode 14+ uses one source size and generates
   the rest). Don't pre-round the corners — iOS applies the mask. `appicon-180.png`
   is just a convenience preview.
2. **Launch screen** — ✅ included in `Launch/`. It's a full-bleed gradient identical
   to the app background plus the centered stack mark, so cold-start dissolves into the
   live screen. To install:
   - Drag **`LaunchScreen.storyboard`** into the project.
   - In `Assets.xcassets`, create two **Image Sets** and set each to **Single Scale**
     (Attributes inspector → Scales → Single Scale):
     - `LaunchBackground` ← `launch-bg.png`
     - `LaunchMark` ← `launch-mark.png`
   - Target → **Info** → set **Launch Screen File** to `LaunchScreen`
     (General → App Icons and Launch Screen → Launch Screen File).
3. **Custom font (optional)** — the prototype uses *DM Sans*; this port uses SF Rounded
   for numerals (very iOS-native). To match the web exactly, add `DMSans` to the target,
   register it in Info.plist (`UIAppFonts`), and swap the `.rounded` design for
   `.custom("DMSans", size:)` in `KeyButton` / `StackDisplayView`.
4. **Richer haptics (optional)** — replace `UIImpactFeedbackGenerator` with a Core Haptics
   `CHHapticEngine` for distinct operator vs digit textures.
5. **Signing** — set your Team in *Signing & Capabilities*, then Product → Archive →
   Distribute to upload to TestFlight / App Store.
6. **Keyboard support (iPad/Mac)** — add `.keyboardShortcut` to the key buttons if you
   want hardware-keyboard input like the web version.

---

## Notes

- State (stack + history) and all preferences persist automatically across launches.
- Division by zero / invalid ops produce `Error` in the X register and a shake — they
  don't crash; `AC` clears.
- Everything is value-type and `ObservableObject`-driven; there is no global mutable
  state beyond `UserDefaults`.
