//  SettingsSheet.swift
//  RPNCalc — grouped preferences + reusable sheet chrome & controls

import SwiftUI

// MARK: Shared sheet chrome (grabber, title, close)

struct SheetChrome<Content: View>: View {
    let title: String
    @ViewBuilder var content: Content
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            Capsule().fill(Color.white.opacity(0.22))
                .frame(width: 38, height: 5).padding(.top, 10)
            HStack {
                Text(title).font(.system(size: 19, weight: .bold)).foregroundColor(Theme.sheetText)
                Spacer()
                Button { dismiss() } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(Theme.sheetText)
                        .frame(width: 30, height: 30)
                        .background(Circle().fill(Color.white.opacity(0.10)))
                }
            }
            .padding(.horizontal, 22).padding(.top, 10).padding(.bottom, 8)
            content
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.sheetBG.ignoresSafeArea())
    }
}

// MARK: Controls

struct SettingRow<Trailing: View>: View {
    let title: String
    var sub: String? = nil
    @ViewBuilder var trailing: Trailing
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.system(size: 15, weight: .medium)).foregroundColor(Theme.sheetText)
                if let sub { Text(sub).font(.system(size: 12)).foregroundColor(Theme.sheetSub) }
            }
            Spacer()
            trailing
        }
        .padding(.horizontal, 16).padding(.vertical, 13)
    }
}

struct Segmented<T: Equatable>: View {
    let options: [(T, String)]
    @Binding var value: T
    let accent: Color
    var body: some View {
        HStack(spacing: 2) {
            ForEach(options.indices, id: \.self) { i in
                let opt = options[i]
                Button { value = opt.0 } label: {
                    Text(opt.1)
                        .font(.system(size: 12.5, weight: .semibold))
                        .foregroundColor(value == opt.0 ? .white : Theme.sheetSub)
                        .padding(.horizontal, 11).padding(.vertical, 5)
                        .background(RoundedRectangle(cornerRadius: 7)
                            .fill(value == opt.0 ? accent : .clear))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(2)
        .background(RoundedRectangle(cornerRadius: 9).fill(Color.black.opacity(0.25)))
    }
}

func SettingsGroup<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
    VStack(spacing: 0) {
        content()
    }
    .background(RoundedRectangle(cornerRadius: 16).fill(Theme.card))
    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Theme.cardEdge))
    .padding(.horizontal, 16).padding(.bottom, 14)
}

// MARK: Settings sheet

struct SettingsSheet: View {
    @EnvironmentObject var settings: AppSettings
    @EnvironmentObject var model: CalculatorModel

    var body: some View {
        SheetChrome(title: "Settings") {
            ScrollView {
                VStack(spacing: 0) {
                    SettingsGroup {
                        SettingRow(title: "Angle units", sub: "For trig functions") {
                            Segmented(options: [(AngleMode.deg, "DEG"), (.rad, "RAD")],
                                      value: $settings.angle, accent: settings.accent)
                        }
                        Divider().overlay(Theme.cardEdge)
                        SettingRow(title: "Decimal precision") {
                            Segmented(options: [(-1, "Auto"), (2, "2"), (4, "4"), (6, "6")],
                                      value: $settings.precisionRaw, accent: settings.accent)
                        }
                    }
                    SettingsGroup {
                        SettingRow(title: "Thousands separators") {
                            Toggle("", isOn: $settings.separators).labelsHidden().tint(settings.accent)
                        }
                        Divider().overlay(Theme.cardEdge)
                        SettingRow(title: "Key sounds") {
                            Toggle("", isOn: $settings.sound).labelsHidden().tint(settings.accent)
                        }
                        Divider().overlay(Theme.cardEdge)
                        SettingRow(title: "Haptics", sub: "Vibrate on key press") {
                            Toggle("", isOn: $settings.haptics).labelsHidden().tint(settings.accent)
                        }
                    }
                    SettingsGroup {
                        Button { model.clearHistory() } label: {
                            HStack {
                                Text("Clear history")
                                    .font(.system(size: 15, weight: .medium))
                                    .foregroundColor(Theme.danger)
                                Spacer()
                            }
                            .padding(.horizontal, 16).padding(.vertical, 13)
                        }
                        .buttonStyle(.plain)
                    }

                    // Accent picker (the in-app equivalent of the web Tweaks panel)
                    SettingsGroup {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("ACCENT").font(.system(size: 11, weight: .bold)).tracking(1.5)
                                .foregroundColor(Theme.sheetSub)
                            HStack(spacing: 14) {
                                ForEach(accentOptions) { opt in
                                    Button { settings.accentHex = opt.hex } label: {
                                        VStack(spacing: 5) {
                                            Circle().fill(opt.color).frame(width: 30, height: 30)
                                                .overlay(Circle().stroke(.white, lineWidth: settings.accentHex == opt.hex ? 2 : 0))
                                                .padding(2)
                                                .overlay(Circle().stroke(settings.accentHex == opt.hex ? .white.opacity(0.5) : .clear, lineWidth: 1))
                                            Text(opt.name).font(.system(size: 10))
                                                .foregroundColor(settings.accentHex == opt.hex ? Theme.sheetText : Theme.sheetSub)
                                        }
                                    }.buttonStyle(.plain)
                                }
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                    }

                    Text("Garvey Adam LLP · RPN")
                        .font(.system(size: 11.5)).foregroundColor(Theme.sheetSub)
                        .padding(.bottom, 8)
                }
                .padding(.top, 4)
            }
        }
    }
}
