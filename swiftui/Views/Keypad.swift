//  Keypad.swift
//  RPNCalc — key button, key style, and the numeric keypad

import SwiftUI

enum KeyKind { case num, op, fn, enter, sci }

/// Press animation: scale down + brighten, matching the web prototype.
struct CalcKeyStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.93 : 1)
            .brightness(configuration.isPressed ? 0.12 : 0)
            .animation(.easeOut(duration: 0.09), value: configuration.isPressed)
    }
}

struct KeyButton: View {
    let label: String
    let kind: KeyKind
    let accent: Color
    var small: Bool = false
    var span: Bool = false      // full-width (ENTER)
    let action: () -> Void

    private var bg: Color {
        switch kind {
        case .op, .enter: return accent
        case .fn:  return Theme.fnKey
        case .sci: return Theme.sciKey
        case .num: return Theme.numKey
        }
    }
    private var fg: Color {
        switch kind {
        case .op, .enter: return .white
        case .fn:  return Theme.fnText
        case .sci: return Theme.sciText
        case .num: return Theme.numText
        }
    }
    private var fontSize: CGFloat {
        if small { return 16 }
        if kind == .enter { return 17 }
        return 30
    }

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(kind == .sci
                      ? .system(size: fontSize, weight: .medium)
                      : .system(size: fontSize, weight: kind == .enter ? .semibold : .regular, design: .rounded))
                .tracking(kind == .enter ? 3 : 0)
                .foregroundColor(fg)
                .frame(maxWidth: .infinity)
                .frame(height: small ? 44 : 62)
                .background(bg)
                .overlay(RoundedRectangle(cornerRadius: small ? 14 : (span ? 32 : 20))
                    .stroke(Theme.keyStroke, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: small ? 14 : (span ? 32 : 20)))
        }
        .buttonStyle(CalcKeyStyle())
    }
}

struct Keypad: View {
    @EnvironmentObject var model: CalculatorModel
    @EnvironmentObject var settings: AppSettings

    private func fire(_ weight: KeyWeight, _ run: () -> Void) {
        Feedback.shared.tap(weight, haptics: settings.haptics, sound: settings.sound)
        run()
    }

    private func num(_ s: String) -> some View {
        KeyButton(label: s, kind: .num, accent: settings.accent) { fire(.light) { model.input(s) } }
    }
    private func op(_ label: String, _ o: BinaryOp) -> some View {
        KeyButton(label: label, kind: .op, accent: settings.accent) { fire(.strong) { model.binary(o) } }
    }

    var body: some View {
        VStack(spacing: 10) {
            HStack(spacing: 10) {
                KeyButton(label: "AC", kind: .fn, accent: settings.accent) { fire(.light) { model.clearAll() } }
                KeyButton(label: "⌫", kind: .fn, accent: settings.accent) { fire(.light) { model.backspace() } }
                KeyButton(label: "x⇄y", kind: .fn, accent: settings.accent, small: true) { fire(.light) { model.swap() } }
                KeyButton(label: "R↓", kind: .fn, accent: settings.accent, small: true) { fire(.light) { model.rollDown() } }
            }
            HStack(spacing: 10) { num("7"); num("8"); num("9"); op("÷", .div) }
            HStack(spacing: 10) { num("4"); num("5"); num("6"); op("×", .mul) }
            HStack(spacing: 10) { num("1"); num("2"); num("3"); op("−", .sub) }
            HStack(spacing: 10) {
                num("0")
                KeyButton(label: ".", kind: .num, accent: settings.accent) { fire(.light) { model.inputPoint() } }
                KeyButton(label: "+/−", kind: .num, accent: settings.accent, small: true) { fire(.light) { model.negate() } }
                op("+", .add)
            }
            KeyButton(label: "ENTER", kind: .enter, accent: settings.accent, span: true) { fire(.strong) { model.enter() } }
        }
        .padding(.horizontal, 14)
        .padding(.top, 6)
    }
}
