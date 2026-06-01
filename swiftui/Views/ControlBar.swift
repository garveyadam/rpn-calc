//  ControlBar.swift
//  RPNCalc — top bar: wordmark, DEG/RAD, ƒ(x), history, settings

import SwiftUI

struct ControlBar: View {
    @EnvironmentObject var settings: AppSettings
    @Binding var sciOpen: Bool
    var onHistory: () -> Void
    var onSettings: () -> Void

    var body: some View {
        HStack(spacing: 8) {
            // wordmark + angle
            HStack(spacing: 9) {
                Circle().fill(settings.accent).frame(width: 7, height: 7)
                    .shadow(color: settings.accent, radius: 5)
                Text("RPN")
                    .font(.system(size: 13, weight: .bold))
                    .tracking(4)
                    .foregroundColor(Color(hex: "DCECFF").opacity(0.92))
                Button {
                    settings.angle = settings.angle == .deg ? .rad : .deg
                } label: {
                    Text(settings.angle == .deg ? "DEG" : "RAD")
                        .font(.system(size: 11, weight: .bold)).tracking(1.2)
                        .foregroundColor(Color(hex: "BEE3FF"))
                        .padding(.horizontal, 10).frame(height: 26)
                        .background(Capsule().fill(Color.white.opacity(0.08)))
                        .overlay(Capsule().stroke(Color.white.opacity(0.12)))
                }
            }
            Spacer()
            HStack(spacing: 8) {
                pill(active: sciOpen) { sciOpen.toggle() } label: {
                    HStack(spacing: 1) {
                        Text("ƒ").font(.system(size: 13, weight: .medium)).italic()
                        Text("(x)").font(.system(size: 11))
                    }
                }
                pill(active: false, action: onHistory) {
                    Image(systemName: "clock").font(.system(size: 15, weight: .medium))
                }
                pill(active: false, action: onSettings) {
                    Image(systemName: "gearshape").font(.system(size: 15, weight: .medium))
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 8)
        .padding(.bottom, 8)
    }

    @ViewBuilder
    private func pill<L: View>(active: Bool, action: @escaping () -> Void, @ViewBuilder label: () -> L) -> some View {
        Button(action: action) {
            label()
                .foregroundColor(active ? .white : Color(hex: "DCECFF").opacity(0.85))
                .frame(height: 34).padding(.horizontal, 11)
                .background(Capsule().fill(active ? settings.accent : Color.white.opacity(0.10)))
                .overlay(Capsule().stroke(Color.white.opacity(0.10)))
        }
    }
}
