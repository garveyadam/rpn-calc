//  Feedback.swift
//  RPNCalc — haptics + key-press sound

import UIKit
import AudioToolbox

enum KeyWeight { case light, strong }

final class Feedback {
    static let shared = Feedback()

    private let light  = UIImpactFeedbackGenerator(style: .light)
    private let medium = UIImpactFeedbackGenerator(style: .medium)

    private init() { light.prepare(); medium.prepare() }

    /// Fire on every key press, gated by user settings.
    func tap(_ weight: KeyWeight, haptics: Bool, sound: Bool) {
        if haptics {
            switch weight {
            case .light:  light.impactOccurred(intensity: 0.6); light.prepare()
            case .strong: medium.impactOccurred(); medium.prepare()
            }
        }
        if sound {
            // 1104 = the iOS keyboard "tock". Crisp and native.
            AudioServicesPlaySystemSound(1104)
        }
    }
}
