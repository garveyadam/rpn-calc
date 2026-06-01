//  Formatting.swift
//  RPNCalc — number formatting (ports rpnFmt / fmtEntry)

import Foundation

enum Precision: Equatable, Codable {
    case auto
    case fixed(Int)

    var rawInt: Int { if case .fixed(let n) = self { return n }; return -1 }
    static func from(_ raw: Int) -> Precision { raw < 0 ? .auto : .fixed(raw) }
}

enum NumberFormat {

    /// Insert thousands separators into an integer-part string.
    private static func group(_ intStr: String) -> String {
        let neg = intStr.hasPrefix("-")
        let digits = neg ? String(intStr.dropFirst()) : intStr
        var out = ""
        var count = 0
        for ch in digits.reversed() {
            if count != 0 && count % 3 == 0 { out.append(",") }
            out.append(ch)
            count += 1
        }
        return (neg ? "-" : "") + String(out.reversed())
    }

    /// Format a finished value.
    static func string(_ n: Double, sep: Bool, prec: Precision) -> String {
        if n.isNaN || n.isInfinite { return "Error" }
        if n == 0 {
            if case .fixed(let p) = prec { return String(format: "%.\(p)f", 0.0) }
            return "0"
        }
        let abs = Swift.abs(n)
        if abs >= 1e12 || abs < 1e-9 {
            let p = { if case .fixed(let f) = prec { return f }; return 5 }()
            var s = String(format: "%.\(p)e", n)
            // tidy "1.20000e+05" → "1.2e5"
            s = s.replacingOccurrences(of: "e+0", with: "e")
                 .replacingOccurrences(of: "e-0", with: "e-")
                 .replacingOccurrences(of: "e+", with: "e")
            return s
        }
        var body: String
        switch prec {
        case .auto:  body = String(format: "%.11g", n)
        case .fixed(let p): body = String(format: "%.\(p)f", n)
        }
        if body.contains("e") { return body }
        let parts = body.split(separator: ".", maxSplits: 1).map(String.init)
        let intPart = sep ? group(parts[0]) : parts[0]
        return parts.count > 1 ? intPart + "." + parts[1] : intPart
    }

    /// Format a live entry string, preserving trailing typed chars.
    static func entry(_ e: String, sep: Bool) -> String {
        if e.isEmpty { return "0" }
        if e == "-" { return "-0" }
        let neg = e.hasPrefix("-")
        let bodyStr = neg ? String(e.dropFirst()) : e
        let dotIdx = bodyStr.firstIndex(of: ".")
        let ip = dotIdx == nil ? bodyStr : String(bodyStr[..<dotIdx!])
        let dp = dotIdx == nil ? nil : String(bodyStr[bodyStr.index(after: dotIdx!)...])
        var out = sep ? group(ip.isEmpty ? "0" : ip) : (ip.isEmpty ? "0" : ip)
        if let dp = dp { out += "." + dp }
        return (neg ? "-" : "") + out
    }

    /// Compact, separator-free formatting used in history text.
    static func short(_ n: Double) -> String { string(n, sep: false, prec: .auto) }
}
