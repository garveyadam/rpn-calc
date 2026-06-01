//  ContentView.swift
//  RPNCalc — top-level composition

import SwiftUI

enum ActiveSheet: String, Identifiable {
    case history, settings, stack
    var id: String { rawValue }
}

struct ContentView: View {
    @StateObject private var model = CalculatorModel()
    @StateObject private var settings = AppSettings()
    @State private var sciOpen = false
    @State private var sheet: ActiveSheet?

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                ControlBar(
                    sciOpen: $sciOpen,
                    onHistory: { sheet = .history },
                    onSettings: { sheet = .settings }
                )

                StackDisplayView(onTap: { sheet = .stack })
                    .modifier(ShakeEffect(active: model.errorFlash))

                if sciOpen {
                    SciTray()
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }

                Keypad()
                Color.clear.frame(height: 8)
            }
            .padding(.top, 4)
        }
        .environmentObject(model)
        .environmentObject(settings)
        .preferredColorScheme(.dark)
        .animation(.spring(response: 0.34, dampingFraction: 0.86), value: sciOpen)
        .sheet(item: $sheet) { which in
            Group {
                switch which {
                case .history:  HistorySheet()
                case .settings: SettingsSheet()
                case .stack:    DeepStackSheet()
                }
            }
            .environmentObject(model)
            .environmentObject(settings)
            .presentationDetents(which == .settings ? [.large] : [.medium, .large])
            .presentationDragIndicator(.hidden)
            .presentationBackground(Theme.sheetBG)
        }
    }
}

/// Horizontal shake used for invalid operations.
struct ShakeEffect: ViewModifier {
    var active: Bool
    @State private var phase: CGFloat = 0
    func body(content: Content) -> some View {
        content
            .offset(x: phase)
            .onChange(of: active) { now in
                guard now else { return }
                withAnimation(.linear(duration: 0.06).repeatCount(5, autoreverses: true)) { phase = 7 }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.34) {
                    withAnimation(.linear(duration: 0.05)) { phase = 0 }
                }
            }
    }
}

#Preview {
    ContentView()
}
