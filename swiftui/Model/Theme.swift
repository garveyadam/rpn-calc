//  Theme.swift
//  RPNCalc — Brand-tinted (Garvey Adam) palette & accent options

import SwiftUI

enum Theme {
    // Display
    static let display       = Color(hex: "FFFFFF")
    static let displayMuted  = Color(hex: "DCECFF").opacity(0.5)
    static let placeholder   = Color(hex: "B4D2EB").opacity(0.16)
    static let label         = Color(hex: "96C4E8").opacity(0.6)

    // Keys
    static let numKey   = Color.white.opacity(0.10)
    static let numText  = Color.white
    static let fnKey    = Color(hex: "0099FF").opacity(0.16)
    static let fnText   = Color(hex: "BFE3FF")
    static let sciKey   = Color.white.opacity(0.07)
    static let sciText  = Color(hex: "DCECFF")
    static let keyStroke = Color.white.opacity(0.06)

    // Sheets
    static let sheetBG   = Color(hex: "06243A")
    static let card      = Color.white.opacity(0.05)
    static let cardEdge  = Color.white.opacity(0.08)
    static let sheetText = Color(hex: "EAF4FF")
    static let sheetSub  = Color(hex: "B4D2EB").opacity(0.55)
    static let danger    = Color(hex: "FF6B6B")

    /// The signature navy gradient background.
    static var background: LinearGradient {
        LinearGradient(
            colors: [Color(hex: "00496E"), Color(hex: "002847"), Color(hex: "001B30")],
            startPoint: .top, endPoint: .bottom
        )
    }
}

struct AccentOption: Identifiable {
    let id = UUID()
    let hex: String
    let name: String
    var color: Color { Color(hex: hex) }
}

let accentOptions: [AccentOption] = [
    .init(hex: "0099FF", name: "Azure"),
    .init(hex: "0072CE", name: "Cobalt"),
    .init(hex: "FF9F0A", name: "Amber"),
    .init(hex: "34C759", name: "Green"),
    .init(hex: "5E5CE6", name: "Indigo"),
]
