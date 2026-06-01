//  StackDisplayView.swift
//  RPNCalc — the HP-style register display (T/Z/Y/X)

import SwiftUI

struct StackDisplayView: View {
    @EnvironmentObject var model: CalculatorModel
    @EnvironmentObject var settings: AppSettings
    var onTap: () -> Void

    private func text(for r: Register) -> String {
        if r.isEntry, let e = model.liveEntry {
            return NumberFormat.entry(e, sep: settings.separators)
        }
        guard let v = r.value else { return r.isX ? "0" : "" }
        return NumberFormat.string(v, sep: settings.separators, prec: settings.precision)
    }

    var body: some View {
        VStack(alignment: .trailing, spacing: 0) {
            Spacer(minLength: 0)
            ForEach(model.registers(depth: 4)) { r in
                let t = text(for: r)
                let empty = t.isEmpty || (r.value == nil && !r.isX && !r.isEntry)
                HStack(alignment: .firstTextBaseline, spacing: 14) {
                    Text(r.label)
                        .font(.system(size: 11, weight: .semibold))
                        .tracking(2.5)
                        .foregroundColor(r.isX ? settings.accent : Theme.label)
                        .frame(width: 14, alignment: .trailing)
                    Text(t)
                        .font(.system(size: r.isX ? 54 : 21, weight: .light, design: .rounded))
                        .monospacedDigit()
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)
                        .foregroundColor(empty ? Theme.placeholder : (r.isX ? Theme.display : Theme.displayMuted))
                }
                .padding(.vertical, r.isX ? 3 : 2)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
        .padding(.horizontal, 24)
        .padding(.bottom, 12)
        .contentShape(Rectangle())
        .onTapGesture(perform: onTap)
        .id(model.pulse)                       // re-mount on push/compute → lift animation
        .transition(.move(edge: .top).combined(with: .opacity))
        .animation(.spring(response: 0.32, dampingFraction: 0.82), value: model.pulse)
    }
}
