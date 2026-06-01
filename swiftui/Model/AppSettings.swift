//  AppSettings.swift
//  RPNCalc — user preferences, persisted to UserDefaults

import SwiftUI
import Combine

final class AppSettings: ObservableObject {
    @Published var angle: AngleMode { didSet { d.set(angle.rawValue, forKey: "angle") } }
    @Published var precisionRaw: Int { didSet { d.set(precisionRaw, forKey: "prec") } }  // -1 = auto
    @Published var separators: Bool { didSet { d.set(separators, forKey: "sep") } }
    @Published var sound: Bool { didSet { d.set(sound, forKey: "sound") } }
    @Published var haptics: Bool { didSet { d.set(haptics, forKey: "haptics") } }
    @Published var accentHex: String { didSet { d.set(accentHex, forKey: "accent") } }

    var precision: Precision { Precision.from(precisionRaw) }
    var accent: Color { Color(hex: accentHex) }

    private let d = UserDefaults.standard

    init() {
        if d.object(forKey: "angle") == nil { // first launch defaults
            d.set("deg", forKey: "angle"); d.set(-1, forKey: "prec")
            d.set(true, forKey: "sep"); d.set(true, forKey: "sound")
            d.set(true, forKey: "haptics"); d.set("0099FF", forKey: "accent")
        }
        angle = AngleMode(rawValue: d.string(forKey: "angle") ?? "deg") ?? .deg
        precisionRaw = d.integer(forKey: "prec")
        separators = d.bool(forKey: "sep")
        sound = d.bool(forKey: "sound")
        haptics = d.bool(forKey: "haptics")
        accentHex = d.string(forKey: "accent") ?? "0099FF"
    }
}
