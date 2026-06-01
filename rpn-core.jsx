// rpn-core.jsx — RPN engine: formatting, scientific ops, roll, history
// Exports to window: rpnFmt, rpnReduceApp, rpnRegisters, RPN_INIT

// ───────────────────────── Formatting ─────────────────────────
function groupInt(intStr) {
  const neg = intStr.startsWith('-');
  let s = neg ? intStr.slice(1) : intStr;
  s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-' : '') + s;
}

// fmt a number with options {sep, prec}. prec: 'auto' | 0..8
function rpnFmt(n, opts) {
  opts = opts || {};
  const sep = opts.sep !== false;
  const prec = opts.prec === undefined ? 'auto' : opts.prec;
  if (n === null || n === undefined) return '';
  if (Number.isNaN(n) || !isFinite(n)) return 'Error';
  if (n === 0) return prec === 'auto' ? '0' : (0).toFixed(prec);
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-9) {
    return n.toExponential(prec === 'auto' ? 5 : prec).replace(/\.?0+e/, 'e').replace('e+', 'e');
  }
  let s;
  if (prec === 'auto') {
    s = String(parseFloat(n.toPrecision(11)));
  } else {
    s = n.toFixed(prec);
  }
  if (s.includes('e')) return s;
  const parts = s.split('.');
  if (sep) parts[0] = groupInt(parts[0]);
  return parts.join('.');
}

// fmt a live entry string keeping trailing typed chars
function fmtEntry(e, sep) {
  if (e === '' || e === '-') return e === '-' ? '-0' : '0';
  const neg = e.startsWith('-');
  let body = neg ? e.slice(1) : e;
  const dot = body.indexOf('.');
  const ip = dot === -1 ? body : body.slice(0, dot);
  const dp = dot === -1 ? null : body.slice(dot + 1);
  let out = sep ? groupInt(ip || '0') : (ip || '0');
  if (dot !== -1) out += '.' + dp;
  return (neg ? '-' : '') + out;
}
window.rpnFmtEntry = fmtEntry;

// ───────────────────────── Math ops ─────────────────────────
const D2R = Math.PI / 180;

function factorial(x) {
  if (x < 0 || !Number.isInteger(x)) return NaN;
  if (x > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= x; i++) r *= i;
  return r;
}

function applyUnary(fn, x, angle) {
  const deg = angle === 'deg';
  switch (fn) {
    case 'sin': return Math.sin(deg ? x * D2R : x);
    case 'cos': return Math.cos(deg ? x * D2R : x);
    case 'tan': return Math.tan(deg ? x * D2R : x);
    case 'asin': return deg ? Math.asin(x) / D2R : Math.asin(x);
    case 'acos': return deg ? Math.acos(x) / D2R : Math.acos(x);
    case 'atan': return deg ? Math.atan(x) / D2R : Math.atan(x);
    case 'ln': return Math.log(x);
    case 'log': return Math.log10(x);
    case 'exp': return Math.exp(x);
    case 'tenx': return Math.pow(10, x);
    case 'sq': return x * x;
    case 'cube': return x * x * x;
    case 'sqrt': return Math.sqrt(x);
    case 'cbrt': return Math.cbrt(x);
    case 'inv': return 1 / x;
    case 'fact': return factorial(x);
    case 'neg': return -x;
    default: return x;
  }
}

const UNARY_LABEL = {
  sin: 'sin', cos: 'cos', tan: 'tan', asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹',
  ln: 'ln', log: 'log', exp: 'eˣ', tenx: '10ˣ', sq: 'x²', cube: 'x³',
  sqrt: '√', cbrt: '∛', inv: '1/x', fact: 'n!', neg: '±',
};

function applyBinary(fn, y, x) {
  switch (fn) {
    case '+': return y + x;
    case '-': return y - x;
    case '*': return y * x;
    case '/': return x === 0 ? NaN : y / x;
    case 'pow': return Math.pow(y, x);
    case 'root': return Math.pow(y, 1 / x);
    case 'mod': return y - x * Math.floor(y / x);
    default: return x;
  }
}

const BINARY_SYM = { '+': '+', '-': '−', '*': '×', '/': '÷', pow: 'yˣ', root: 'ˣ√y', mod: 'mod' };

// ───────────────────────── Reducer ─────────────────────────
const RPN_INIT = { stack: [], entry: null, history: [], flash: null, pulse: 0 };

let HID = Date.now();
function hist(state, text, value) {
  const item = { id: HID++, text, value, t: Date.now() };
  const history = [...state.history, item];
  if (history.length > 200) history.shift();
  return history;
}

function commit(state) {
  if (state.entry !== null) return { stack: [...state.stack, parseFloat(state.entry)], entry: null };
  return { stack: state.stack, entry: null };
}

function fmtH(n) { return rpnFmt(n, { sep: false, prec: 'auto' }); }

function rpnReduceApp(state, action) {
  switch (action.t) {
    case 'digit': {
      let e = state.entry === null ? '' : state.entry;
      if (e === '0') e = '';
      if (e === '-0') e = '-';
      return { ...state, entry: e + action.c, flash: null };
    }
    case 'point': {
      let e = state.entry === null ? '0' : state.entry;
      if (e === '-') e = '-0';
      if (e.includes('.')) return state;
      return { ...state, entry: e + '.', flash: null };
    }
    case 'back': {
      if (state.entry !== null) {
        let e = state.entry.slice(0, -1);
        if (e === '' || e === '-') return { ...state, entry: null };
        return { ...state, entry: e };
      }
      return state;
    }
    case 'enter': {
      if (state.entry !== null) {
        return { ...state, stack: [...state.stack, parseFloat(state.entry)], entry: null, flash: null, pulse: state.pulse + 1 };
      }
      if (state.stack.length) {
        return { ...state, stack: [...state.stack, state.stack[state.stack.length - 1]], entry: null, pulse: state.pulse + 1 };
      }
      return { ...state, stack: [0], pulse: state.pulse + 1 };
    }
    case 'op': {
      const s = commit(state);
      if (s.stack.length < 2) return { ...state, flash: 'err' };
      const x = s.stack[s.stack.length - 1];
      const y = s.stack[s.stack.length - 2];
      const r = applyBinary(action.op, y, x);
      const text = `${fmtH(y)} ${BINARY_SYM[action.op]} ${fmtH(x)} = ${fmtH(r)}`;
      return { ...state, stack: s.stack.slice(0, -2).concat([r]), entry: null, flash: null, pulse: state.pulse + 1, history: hist(state, text, r) };
    }
    case 'fn1': {
      const s = commit(state);
      if (!s.stack.length) return { ...state, flash: 'err' };
      const x = s.stack[s.stack.length - 1];
      const r = applyUnary(action.fn, x, action.angle);
      const lbl = UNARY_LABEL[action.fn] || action.fn;
      const text = action.fn === 'neg' ? null : `${lbl}(${fmtH(x)}) = ${fmtH(r)}`;
      return {
        ...state, stack: s.stack.slice(0, -1).concat([r]), entry: null, flash: null,
        pulse: state.pulse + 1, history: text ? hist(state, text, r) : state.history,
      };
    }
    case 'neg': {
      if (state.entry !== null) {
        const e = state.entry.startsWith('-') ? state.entry.slice(1) : '-' + state.entry;
        return { ...state, entry: e };
      }
      if (state.stack.length) {
        const ns = [...state.stack];
        ns[ns.length - 1] = -ns[ns.length - 1];
        return { ...state, stack: ns };
      }
      return state;
    }
    case 'const': {
      const s = commit(state);
      return { ...state, stack: [...s.stack, action.v], entry: null, pulse: state.pulse + 1 };
    }
    case 'drop': {
      if (state.entry !== null) return { ...state, entry: null };
      if (state.stack.length) return { ...state, stack: state.stack.slice(0, -1) };
      return state;
    }
    case 'swap': {
      const s = commit(state);
      if (s.stack.length < 2) return { ...state, flash: 'err' };
      const ns = [...s.stack];
      const n = ns.length;
      [ns[n - 1], ns[n - 2]] = [ns[n - 2], ns[n - 1]];
      return { ...state, stack: ns, entry: null };
    }
    case 'rolldown': {
      const s = commit(state);
      if (s.stack.length < 2) return { ...state, entry: null };
      const ns = [...s.stack];
      ns.unshift(ns.pop());
      return { ...state, stack: ns, entry: null };
    }
    case 'rollup': {
      const s = commit(state);
      if (s.stack.length < 2) return { ...state, entry: null };
      const ns = [...s.stack];
      ns.push(ns.shift());
      return { ...state, stack: ns, entry: null };
    }
    case 'push': { // push a specific value (from history reuse)
      const s = commit(state);
      return { ...state, stack: [...s.stack, action.v], entry: null, pulse: state.pulse + 1 };
    }
    case 'clearStack':
      return { ...state, stack: [], entry: null };
    case 'clearAll':
      return { ...state, stack: [], entry: null, flash: null };
    case 'clearHistory':
      return { ...state, history: [] };
    case 'hydrate':
      return { ...state, stack: action.stack || [], history: action.history || [] };
    default:
      return state;
  }
}

// derive visible registers (labels T,Z,Y,X by default; can request depth)
function rpnRegisters(state, depth) {
  depth = depth || 4;
  let vals = state.entry !== null ? [...state.stack, { entry: state.entry }] : [...state.stack];
  const labels = ['T', 'Z', 'Y', 'X'];
  const rows = [];
  for (let i = 0; i < depth; i++) {
    const idx = vals.length - depth + i;
    const v = idx >= 0 ? vals[idx] : null;
    let label;
    if (depth <= 4) label = labels[depth - 1 - (depth - 1 - i)] || '';
    rows.push({ v, idx: depth - 1 - i });
  }
  // assign labels from bottom: X(0),Y(1),Z(2),T(3),4,5...
  for (let i = 0; i < rows.length; i++) {
    const fromBottom = rows.length - 1 - i;
    rows[i].label = fromBottom === 0 ? 'X' : fromBottom === 1 ? 'Y' : fromBottom === 2 ? 'Z' : fromBottom === 3 ? 'T' : String(fromBottom + 1);
    rows[i].isX = fromBottom === 0;
  }
  return rows;
}

Object.assign(window, { rpnFmt, rpnReduceApp, rpnRegisters, RPN_INIT });
