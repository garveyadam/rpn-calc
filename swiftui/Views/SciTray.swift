//  SciTray.swift
//  RPNCalc — collapsible scientific function tray with a 2nd toggle

import SwiftUI

struct SciKey: Identifiable {
    let id = UUID()
    let primary: String
    let secondary: String
    let run: (CalculatorModel, AngleMode) -> Void          // primary action
    let runSecond: (CalculatorModel, AngleMode) -> Void     // 2nd action
}

let sciKeys: [SciKey] = [
    .init(primary: "sin", secondary: "sin⁻¹",
          run: { m, a in m.unary(.sin, angle: a) }, runSecond: { m, a in m.unary(.asin, angle: a) }),
    .init(primary: "cos", secondary: "cos⁻¹",
          run: { m, a in m.unary(.cos, angle: a) }, runSecond: { m, a in m.unary(.acos, angle: a) }),
    .init(primary: "tan", secondary: "tan⁻¹",
          run: { m, a in m.unary(.tan, angle: a) }, runSecond: { m, a in m.unary(.atan, angle: a) }),
    .init(primary: "ln", secondary: "eˣ",
          run: { m, a in m.unary(.ln, angle: a) }, runSecond: { m, a in m.unary(.exp, angle: a) }),
    .init(primary: "log", secondary: "10ˣ",
          run: { m, a in m.unary(.log, angle: a) }, runSecond: { m, a in m.unary(.tenx, angle: a) }),
    .init(primary: "x²", secondary: "x³",
          run: { m, a in m.unary(.sq, angle: a) }, runSecond: { m, a in m.unary(.cube, angle: a) }),
    .init(primary: "√", secondary: "∛",
          run: { m, a in m.unary(.sqrt, angle: a) }, runSecond: { m, a in m.unary(.cbrt, angle: a) }),
    .init(primary: "1/x", secondary: "n!",
          run: { m, a in m.unary(.inv, angle: a) }, runSecond: { m, a in m.unary(.fact, angle: a) }),
    .init(primary: "yˣ", secondary: "ˣ√y",
          run: { m, _ in m.binary(.pow) }, runSecond: { m, _ in m.binary(.root) }),
    .init(primary: "π", secondary: "e",
          run: { m, _ in m.pushConstant(.pi) }, runSecond: { m, _ in m.pushConstant(M_E) }),
]

struct SciTray: View {
    @EnvironmentObject var model: CalculatorModel
    @EnvironmentObject var settings: AppSettings
    @State private var second = false

    private let cols = Array(repeating: GridItem(.flexible(), spacing: 7), count: 5)

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text("FUNCTIONS")
                    .font(.system(size: 10, weight: .bold)).tracking(2)
                    .foregroundColor(Color(hex: "96C4E8").opacity(0.6))
                Spacer()
                Button { second.toggle() } label: {
                    Text("2nd")
                        .font(.system(size: 11, weight: .bold)).tracking(0.8)
                        .foregroundColor(.white)
                        .padding(.horizontal, 12).frame(height: 24)
                        .background(Capsule().fill(second ? settings.accent : Color.white.opacity(0.08)))
                        .overlay(Capsule().stroke(Color.white.opacity(0.12)))
                }
            }
            .padding(.bottom, 2)

            LazyVGrid(columns: cols, spacing: 7) {
                ForEach(sciKeys) { k in
                    KeyButton(label: second ? k.secondary : k.primary,
                              kind: .sci, accent: settings.accent, small: true) {
                        Feedback.shared.tap(.light, haptics: settings.haptics, sound: settings.sound)
                        if second { k.runSecond(model, settings.angle) }
                        else { k.run(model, settings.angle) }
                    }
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.bottom, 4)
    }
}
