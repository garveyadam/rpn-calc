//  HistorySheet.swift
//  RPNCalc — the tape: scrollable log, tap a result to push it

import SwiftUI

struct HistorySheet: View {
    @EnvironmentObject var model: CalculatorModel
    @EnvironmentObject var settings: AppSettings
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        SheetChrome(title: "History") {
            if model.history.isEmpty {
                VStack(spacing: 6) {
                    Text("No calculations yet")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(Theme.sheetText)
                    Text("Your operations will appear here. Tap any result to push it back onto the stack.")
                        .font(.system(size: 13))
                        .foregroundColor(Theme.sheetSub)
                        .multilineTextAlignment(.center)
                }
                .padding(.vertical, 44).padding(.horizontal, 20)
            } else {
                ScrollView {
                    VStack(spacing: 8) {
                        ForEach(model.history.reversed()) { item in
                            Button {
                                Feedback.shared.tap(.light, haptics: settings.haptics, sound: settings.sound)
                                model.push(item.value)
                                dismiss()
                            } label: {
                                HStack {
                                    Text(item.text)
                                        .font(.system(size: 15, design: .rounded))
                                        .monospacedDigit()
                                        .foregroundColor(Theme.sheetText)
                                        .lineLimit(1)
                                    Spacer(minLength: 10)
                                    Text("PUSH")
                                        .font(.system(size: 11, weight: .bold)).tracking(0.6)
                                        .foregroundColor(settings.accent)
                                        .padding(.horizontal, 9).padding(.vertical, 3)
                                        .overlay(Capsule().stroke(settings.accent))
                                }
                                .padding(.horizontal, 14).padding(.vertical, 12)
                                .background(RoundedRectangle(cornerRadius: 14).fill(Theme.card))
                                .overlay(RoundedRectangle(cornerRadius: 14).stroke(Theme.cardEdge))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 16).padding(.bottom, 12)
                }
            }
        }
    }
}
