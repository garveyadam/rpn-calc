//  Operations.swift
//  RPNCalc — math operations & enums (ports rpn-core.jsx)

import Foundation

enum AngleMode: String, Codable { case deg, rad }

// ───────── Binary operators ─────────
enum BinaryOp {
    case add, sub, mul, div, pow, root, mod

    var symbol: String {
        switch self {
        case .add:  return "+"
        case .sub:  return "−"
        case .mul:  return "×"
        case .div:  return "÷"
        case .pow:  return "yˣ"
        case .root: return "ˣ√y"
        case .mod:  return "mod"
        }
    }

    /// Applies the operator with `y` below `x` on the stack.
    func apply(_ y: Double, _ x: Double) -> Double {
        switch self {
        case .add:  return y + x
        case .sub:  return y - x
        case .mul:  return y * x
        case .div:  return x == 0 ? .nan : y / x
        case .pow:  return Foundation.pow(y, x)
        case .root: return Foundation.pow(y, 1 / x)
        case .mod:  return y - x * (y / x).rounded(.down)
        }
    }
}

// ───────── Unary functions ─────────
enum UnaryFn {
    case sin, cos, tan, asin, acos, atan
    case ln, log, exp, tenx
    case sq, cube, sqrt, cbrt, inv, fact, neg

    var label: String {
        switch self {
        case .sin: return "sin";   case .cos: return "cos";   case .tan: return "tan"
        case .asin: return "sin⁻¹"; case .acos: return "cos⁻¹"; case .atan: return "tan⁻¹"
        case .ln: return "ln";     case .log: return "log";   case .exp: return "eˣ"
        case .tenx: return "10ˣ";  case .sq: return "x²";     case .cube: return "x³"
        case .sqrt: return "√";    case .cbrt: return "∛";    case .inv: return "1/x"
        case .fact: return "n!";   case .neg: return "±"
        }
    }

    func apply(_ x: Double, angle: AngleMode) -> Double {
        let deg = angle == .deg
        let d2r = Double.pi / 180
        switch self {
        case .sin:  return Foundation.sin(deg ? x * d2r : x)
        case .cos:  return Foundation.cos(deg ? x * d2r : x)
        case .tan:  return Foundation.tan(deg ? x * d2r : x)
        case .asin: return deg ? Foundation.asin(x) / d2r : Foundation.asin(x)
        case .acos: return deg ? Foundation.acos(x) / d2r : Foundation.acos(x)
        case .atan: return deg ? Foundation.atan(x) / d2r : Foundation.atan(x)
        case .ln:   return Foundation.log(x)
        case .log:  return Foundation.log10(x)
        case .exp:  return Foundation.exp(x)
        case .tenx: return Foundation.pow(10, x)
        case .sq:   return x * x
        case .cube: return x * x * x
        case .sqrt: return Foundation.sqrt(x)
        case .cbrt: return Foundation.cbrt(x)
        case .inv:  return 1 / x
        case .fact: return Self.factorial(x)
        case .neg:  return -x
        }
    }

    private static func factorial(_ x: Double) -> Double {
        guard x >= 0, x.rounded() == x else { return .nan }
        if x > 170 { return .infinity }
        var r = 1.0
        var i = 2.0
        while i <= x { r *= i; i += 1 }
        return r
    }
}
