//  CalculatorModel.swift
//  RPNCalc — RPN engine + stack/history state + persistence
//  Ports the reducer in rpn-core.jsx to an ObservableObject.

import Foundation
import SwiftUI

struct HistoryItem: Identifiable, Codable, Equatable {
    let id: UUID
    let text: String
    let value: Double
    init(text: String, value: Double) {
        self.id = UUID(); self.text = text; self.value = value
    }
}

/// One visible stack register for the display.
struct Register: Identifiable {
    let id: Int          // position from bottom (0 = X)
    let label: String
    let value: Double?   // nil = empty slot
    let isEntry: Bool
    let isX: Bool
}

final class CalculatorModel: ObservableObject {
    @Published private(set) var stack: [Double] = []
    @Published private(set) var entry: String? = nil
    @Published private(set) var history: [HistoryItem] = []
    @Published private(set) var pulse: Int = 0
    @Published var errorFlash: Bool = false

    private let store = UserDefaults.standard
    private let stackKey = "rpn.stack.v1"
    private let histKey  = "rpn.history.v1"

    init() { load() }

    // MARK: Entry

    func input(_ c: String) {
        var e = entry ?? ""
        if e == "0" { e = "" }
        if e == "-0" { e = "-" }
        entry = e + c
    }

    func inputPoint() {
        var e = entry ?? "0"
        if e == "-" { e = "-0" }
        if e.contains(".") { return }
        entry = e + "."
    }

    func backspace() {
        guard var e = entry else { return }
        e.removeLast()
        entry = (e.isEmpty || e == "-") ? nil : e
    }

    // MARK: Core ops

    func enter() {
        if let e = entry {
            stack.append(value(of: e)); entry = nil
        } else if let last = stack.last {
            stack.append(last)
        } else {
            stack = [0]
        }
        pulse += 1; save()
    }

    func binary(_ op: BinaryOp) {
        commit()
        guard stack.count >= 2 else { flash(); return }
        let x = stack.removeLast()
        let y = stack.removeLast()
        let r = op.apply(y, x)
        stack.append(r)
        addHistory("\(NumberFormat.short(y)) \(op.symbol) \(NumberFormat.short(x)) = \(NumberFormat.short(r))", r)
        pulse += 1; save()
    }

    func unary(_ fn: UnaryFn, angle: AngleMode) {
        commit()
        guard let x = stack.last else { flash(); return }
        stack.removeLast()
        let r = fn.apply(x, angle: angle)
        stack.append(r)
        if fn != .neg {
            addHistory("\(fn.label)(\(NumberFormat.short(x))) = \(NumberFormat.short(r))", r)
        }
        pulse += 1; save()
    }

    func negate() {
        if let e = entry {
            entry = e.hasPrefix("-") ? String(e.dropFirst()) : "-" + e
        } else if let last = stack.last {
            stack[stack.count - 1] = -last; save()
        }
    }

    func pushConstant(_ v: Double) { commit(); stack.append(v); pulse += 1; save() }

    func push(_ v: Double) { commit(); stack.append(v); pulse += 1; save() }

    func drop() {
        if entry != nil { entry = nil }
        else if !stack.isEmpty { stack.removeLast(); save() }
    }

    func swap() {
        commit()
        guard stack.count >= 2 else { flash(); return }
        stack.swapAt(stack.count - 1, stack.count - 2); save()
    }

    func rollDown() {
        commit()
        guard stack.count >= 2 else { return }
        let top = stack.removeLast(); stack.insert(top, at: 0); save()
    }

    func rollUp() {
        commit()
        guard stack.count >= 2 else { return }
        let bottom = stack.removeFirst(); stack.append(bottom); save()
    }

    func clearStack() { stack = []; entry = nil; save() }
    func clearAll()   { stack = []; entry = nil; save() }
    func clearHistory() { history = []; save() }

    // MARK: Display registers

    /// `depth` registers, bottom = X. Includes the live entry as the X slot.
    func registers(depth: Int = 4) -> [Register] {
        var vals: [(Double?, Bool)] = stack.map { ($0, false) }
        if let e = entry { vals.append((value(of: e), true)) }

        var rows: [Register] = []
        for i in 0..<depth {
            let idx = vals.count - depth + i
            let fromBottom = depth - 1 - i
            let label: String
            switch fromBottom {
            case 0: label = "X"; case 1: label = "Y"; case 2: label = "Z"; case 3: label = "T"
            default: label = "\(fromBottom + 1)"
            }
            if idx >= 0 {
                let (v, isE) = vals[idx]
                rows.append(Register(id: fromBottom, label: label, value: v, isEntry: isE, isX: fromBottom == 0))
            } else {
                rows.append(Register(id: fromBottom, label: label, value: nil, isEntry: false, isX: fromBottom == 0))
            }
        }
        return rows
    }

    /// All registers (for the deep-stack sheet), bottom = X.
    func allRegisters() -> [Register] {
        var vals: [(Double, Bool)] = stack.map { ($0, false) }
        if let e = entry { vals.append((value(of: e), true)) }
        var rows: [Register] = []
        for (i, (v, isE)) in vals.enumerated() {
            let fromBottom = vals.count - 1 - i
            let label: String
            switch fromBottom {
            case 0: label = "X"; case 1: label = "Y"; case 2: label = "Z"; case 3: label = "T"
            default: label = "\(fromBottom + 1)"
            }
            rows.append(Register(id: fromBottom, label: label, value: v, isEntry: isE, isX: fromBottom == 0))
        }
        return rows
    }

    /// The current live entry string (for displaying as-typed).
    var liveEntry: String? { entry }

    // MARK: Helpers

    private func commit() {
        if let e = entry { stack.append(value(of: e)); entry = nil }
    }

    private func value(of e: String) -> Double {
        var s = e
        if s.hasSuffix(".") { s += "0" }
        if s == "-" || s == "-." { s = "0" }
        return Double(s) ?? 0
    }

    private func addHistory(_ text: String, _ value: Double) {
        history.append(HistoryItem(text: text, value: value))
        if history.count > 200 { history.removeFirst() }
    }

    private func flash() {
        errorFlash = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { [weak self] in
            self?.errorFlash = false
        }
    }

    // MARK: Persistence

    private func save() {
        let enc = JSONEncoder()
        if let s = try? enc.encode(stack) { store.set(s, forKey: stackKey) }
        if let h = try? enc.encode(history) { store.set(h, forKey: histKey) }
    }

    private func load() {
        let dec = JSONDecoder()
        if let s = store.data(forKey: stackKey), let v = try? dec.decode([Double].self, from: s) { stack = v }
        if let h = store.data(forKey: histKey), let v = try? dec.decode([HistoryItem].self, from: h) { history = v }
    }
}
