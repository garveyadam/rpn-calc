//  DeepStackSheet.swift
//  RPNCalc — full stack view with roll / swap / clear

import SwiftUI

struct DeepStackSheet: View {
    @EnvironmentObject var model: CalculatorModel
    @EnvironmentObject var settings: AppSettings

    private func text(for r: Register) -> String {
        if r.isEntry, let e = model.liveEntry { return NumberFormat.entry(e, sep: settings.separators) }
        guard let v = r.value else { return "0" }
        return NumberFormat.string(v, sep: settings.separators, prec: settings.precision)
    }

    var body: some View {
        SheetChrome(title: "Stack") {
            ScrollView {
                VStack(spacing: 0) {
                    let rows = model.allRegisters()
                    SettingsGroup {
                        if rows.isEmpty {
                            Text("Stack is empty")
                                .font(.system(size: 13.5)).foregroundColor(Theme.sheetSub)
                                .frame(maxWidth: .infinity).padding(.vertical, 24)
                        } else {
                            ForEach(Array(rows.enumerated()), id: \.offset) { i, r in
                                HStack {
                                    Text(r.label)
                                        .font(.system(size: 15, weight: .bold)).tracking(2)
                                        .foregroundColor(r.isX ? settings.accent : Theme.sheetSub)
                                    Spacer()
                                    Text(text(for: r))
                                        .font(.system(size: 18, design: .rounded)).monospacedDigit()
                                        .foregroundColor(Theme.sheetText)
                                }
                                .padding(.horizontal, 16).padding(.vertical, 13)
                                if i < rows.count - 1 { Divider().overlay(Theme.cardEdge) }
                            }
                        }
                    }

                    HStack(spacing: 8) {
                        rollButton("Roll ↑") { model.rollUp() }
                        rollButton("Roll ↓") { model.rollDown() }
                        rollButton("x⇄y") { model.swap() }
                    }
                    .padding(.horizontal, 16).padding(.bottom, 10)

                    Button { model.clearStack() } label: {
                        Text("Clear stack")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(Theme.danger)
                            .frame(maxWidth: .infinity).padding(.vertical, 12)
                            .background(RoundedRectangle(cornerRadius: 12).fill(Theme.danger.opacity(0.12)))
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.danger.opacity(0.3)))
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal, 16)
                }
                .padding(.top, 4)
            }
        }
    }

    private func rollButton(_ label: String, action: @escaping () -> Void) -> some View {
        Button {
            Feedback.shared.tap(.light, haptics: settings.haptics, sound: settings.sound)
            action()
        } label: {
            Text(label)
                .font(.system(size: 13.5, weight: .semibold))
                .foregroundColor(Theme.sheetText)
                .frame(maxWidth: .infinity).padding(.vertical, 11)
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.white.opacity(0.08)))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.cardEdge))
        }
        .buttonStyle(.plain)
    }
}
