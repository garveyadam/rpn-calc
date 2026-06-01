// rpn-calculator.jsx — RPN engine + themed calculator component
// Exports to window: RPNCalculator

// ───────────────────────── Number formatting ─────────────────────────
function groupInt(intStr) {
  const neg = intStr.startsWith('-');
  let s = neg ? intStr.slice(1) : intStr;
  s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-' : '') + s;
}

function fmtNum(n) {
  if (n === null || n === undefined) return '';
  if (Number.isNaN(n) || !isFinite(n)) return 'Error';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-9) {
    return n.toExponential(5).replace(/\.?0+e/, 'e').replace('e+', 'e');
  }
  let s = String(parseFloat(n.toPrecision(11)));
  if (s.includes('e')) return s;
  const parts = s.split('.');
  parts[0] = groupInt(parts[0]);
  return parts.join('.');
}

// format a live entry string ("-12.30") keeping trailing typed chars
function fmtEntry(e) {
  if (e === '' || e === '-') return e === '-' ? '-0' : '0';
  const neg = e.startsWith('-');
  let body = neg ? e.slice(1) : e;
  const [ip, dp] = body.split('.');
  let out = groupInt(ip || '0');
  if (body.includes('.')) out += '.' + (dp || '');
  return (neg ? '-' : '') + out;
}

// ───────────────────────── RPN reducer ─────────────────────────
function commit(state) {
  if (state.entry !== null) {
    return { stack: [...state.stack, parseFloat(state.entry)], entry: null };
  }
  return state;
}

function rpnReduce(state, action) {
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
    case 'enter': {
      if (state.entry !== null) {
        return { stack: [...state.stack, parseFloat(state.entry)], entry: null, flash: null };
      }
      if (state.stack.length) {
        return { stack: [...state.stack, state.stack[state.stack.length - 1]], entry: null, flash: null };
      }
      return { ...state, stack: [0], flash: null };
    }
    case 'op': {
      const s = commit(state);
      if (s.stack.length < 2) return { ...state, flash: 'err' };
      const b = s.stack[s.stack.length - 1];
      const a = s.stack[s.stack.length - 2];
      let r;
      if (action.op === '+') r = a + b;
      else if (action.op === '-') r = a - b;
      else if (action.op === '*') r = a * b;
      else r = b === 0 ? NaN : a / b;
      return { stack: s.stack.slice(0, -2).concat([r]), entry: null, flash: null };
    }
    case 'neg': {
      if (state.entry !== null) {
        const e = state.entry.startsWith('-') ? state.entry.slice(1) : '-' + state.entry;
        return { ...state, entry: e };
      }
      if (state.stack.length) {
        const ns = [...state.stack];
        ns[ns.length - 1] = -ns[ns.length - 1];
        return { stack: ns, entry: null };
      }
      return state;
    }
    case 'drop': {
      if (state.entry !== null) return { ...state, entry: null };
      if (state.stack.length) return { stack: state.stack.slice(0, -1), entry: null };
      return state;
    }
    case 'swap': {
      const s = commit(state);
      if (s.stack.length < 2) return { ...state, flash: 'err' };
      const ns = [...s.stack];
      const n = ns.length;
      [ns[n - 1], ns[n - 2]] = [ns[n - 2], ns[n - 1]];
      return { stack: ns, entry: null };
    }
    case 'back': {
      if (state.entry !== null) {
        let e = state.entry.slice(0, -1);
        if (e === '' || e === '-') return { ...state, entry: null };
        return { ...state, entry: e };
      }
      return state;
    }
    case 'clear':
      return { stack: [], entry: null, flash: null };
    default:
      return state;
  }
}

// derive the 4 visible registers (T,Z,Y,X) — X is bottom/live
function registers(state) {
  let vals = state.entry !== null
    ? [...state.stack, { entry: state.entry }]
    : [...state.stack];
  const labels = ['T', 'Z', 'Y', 'X'];
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const idx = vals.length - 4 + i;
    const v = idx >= 0 ? vals[idx] : null;
    rows.push({ label: labels[i], v });
  }
  return rows;
}

function renderReg(v, isX) {
  if (v === null) return null;
  if (typeof v === 'object' && 'entry' in v) return fmtEntry(v.entry);
  return fmtNum(v);
}

// ───────────────────────── Keypad spec ─────────────────────────
const ROWS = [
  [
    { label: 'AC', act: { t: 'clear' }, kind: 'fn' },
    { label: '⌫', act: { t: 'back' }, kind: 'fn' },
    { label: 'x⇄y', act: { t: 'swap' }, kind: 'fn', small: true },
    { label: 'DROP', act: { t: 'drop' }, kind: 'fn', small: true },
  ],
  [
    { label: '7', act: { t: 'digit', c: '7' }, kind: 'num' },
    { label: '8', act: { t: 'digit', c: '8' }, kind: 'num' },
    { label: '9', act: { t: 'digit', c: '9' }, kind: 'num' },
    { label: '÷', act: { t: 'op', op: '/' }, kind: 'op' },
  ],
  [
    { label: '4', act: { t: 'digit', c: '4' }, kind: 'num' },
    { label: '5', act: { t: 'digit', c: '5' }, kind: 'num' },
    { label: '6', act: { t: 'digit', c: '6' }, kind: 'num' },
    { label: '×', act: { t: 'op', op: '*' }, kind: 'op' },
  ],
  [
    { label: '1', act: { t: 'digit', c: '1' }, kind: 'num' },
    { label: '2', act: { t: 'digit', c: '2' }, kind: 'num' },
    { label: '3', act: { t: 'digit', c: '3' }, kind: 'num' },
    { label: '−', act: { t: 'op', op: '-' }, kind: 'op' },
  ],
  [
    { label: '0', act: { t: 'digit', c: '0' }, kind: 'num' },
    { label: '.', act: { t: 'point' }, kind: 'num' },
    { label: '+/−', act: { t: 'neg' }, kind: 'num', small: true },
    { label: '+', act: { t: 'op', op: '+' }, kind: 'op' },
  ],
  [
    { label: 'ENTER', act: { t: 'enter' }, kind: 'enter', span: 4 },
  ],
];

// keyboard mapping
const KEY_MAP = {
  '0': { t: 'digit', c: '0' }, '1': { t: 'digit', c: '1' }, '2': { t: 'digit', c: '2' },
  '3': { t: 'digit', c: '3' }, '4': { t: 'digit', c: '4' }, '5': { t: 'digit', c: '5' },
  '6': { t: 'digit', c: '6' }, '7': { t: 'digit', c: '7' }, '8': { t: 'digit', c: '8' },
  '9': { t: 'digit', c: '9' }, '.': { t: 'point' },
  '+': { t: 'op', op: '+' }, '-': { t: 'op', op: '-' },
  '*': { t: 'op', op: '*' }, '/': { t: 'op', op: '/' },
  'Enter': { t: 'enter' }, 'Backspace': { t: 'back' },
  'Escape': { t: 'clear' }, 's': { t: 'swap' }, 'd': { t: 'drop' }, 'n': { t: 'neg' },
};

// ───────────────────────── Component ─────────────────────────
function RPNCalculator({ theme, accent }) {
  const [state, dispatch] = React.useReducer(rpnReduce, { stack: [], entry: null, flash: null });
  const [pressed, setPressed] = React.useState(null);
  const rootRef = React.useRef(null);
  const acc = accent === 'native' ? theme.nativeAccent : accent;

  React.useEffect(() => {
    function onKey(e) {
      const a = KEY_MAP[e.key];
      if (a) { e.preventDefault(); dispatch(a); }
    }
    const el = rootRef.current;
    el && el.addEventListener('keydown', onKey);
    return () => el && el.removeEventListener('keydown', onKey);
  }, []);

  const regs = registers(state);
  const sharp = theme.sharp;

  // key visual
  function keyStyle(k) {
    const isPressed = pressed === k.label;
    let bg, fg, border = 'none';
    if (k.kind === 'op' || k.kind === 'enter') { bg = acc; fg = theme.opFg; }
    else if (k.kind === 'fn') { bg = theme.fnBg; fg = theme.fnFg; border = theme.keyBorder; }
    else { bg = theme.numBg; fg = theme.numFg; border = theme.keyBorder; }
    return {
      background: bg, color: fg,
      border: border || 'none',
      borderRadius: sharp ? 0 : (k.span ? 999 : theme.keyRadius),
      gridColumn: k.span ? `span ${k.span}` : undefined,
      height: theme.keyH,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: theme.keyFont,
      fontSize: k.small ? theme.keyFsSmall : (k.kind === 'enter' ? theme.keyFsSmall + 1 : theme.keyFs),
      fontWeight: k.kind === 'enter' ? 600 : theme.keyWeight,
      letterSpacing: k.kind === 'enter' ? '0.18em' : (k.small ? '0.02em' : '0'),
      cursor: 'pointer', userSelect: 'none',
      transform: isPressed ? 'scale(0.94)' : 'scale(1)',
      filter: isPressed ? 'brightness(1.25)' : 'none',
      transition: 'transform .09s ease, filter .12s ease',
      boxShadow: theme.keyShadow,
      WebkitTapHighlightColor: 'transparent',
    };
  }

  function onPress(k) {
    setPressed(k.label);
    dispatch(k.act);
  }
  React.useEffect(() => {
    if (pressed === null) return;
    const id = setTimeout(() => setPressed(null), 110);
    return () => clearTimeout(id);
  }, [pressed]);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: theme.bg, outline: 'none', position: 'relative',
        backgroundImage: theme.bgImage || 'none',
      }}
    >
      {/* ── Display / Stack ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: theme.id === 'instrument' ? '74px 0 8px' : '78px 26px 10px',
        minHeight: 0,
      }}>
        {theme.id === 'instrument' ? (
          <div style={{
            margin: '0 18px', background: theme.panelBg, border: `1px solid ${theme.panelBorder}`,
            padding: '14px 18px 16px',
          }}>
            <div style={{
              fontFamily: theme.labelFont, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: acc, marginBottom: 10,
            }}>Stack</div>
            {regs.map((r, i) => {
              const isX = r.label === 'X';
              const txt = renderReg(r.v, isX);
              const shown = txt === null ? (isX ? '0' : '·') : txt;
              const dim = txt === null && !isX;
              return (
                <div key={r.label} style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  borderTop: i === 0 ? 'none' : `1px solid ${theme.panelBorder}`,
                  padding: isX ? '12px 0 2px' : '7px 0',
                }}>
                  <span style={{
                    fontFamily: theme.labelFont, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
                    color: isX ? acc : theme.labelColor,
                  }}>{r.label}</span>
                  <span style={{
                    fontFamily: theme.numFont, fontVariantNumeric: 'tabular-nums',
                    fontSize: isX ? 40 : 19, fontWeight: isX ? 500 : 400,
                    color: dim ? theme.placeholderColor : (isX ? theme.displayColor : theme.displayMuted),
                    lineHeight: 1,
                  }}>{shown}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {regs.map((r) => {
              const isX = r.label === 'X';
              const txt = renderReg(r.v, isX);
              const shown = txt === null ? (isX ? '0' : '') : txt;
              const dim = txt === null && !isX;
              return (
                <div key={r.label} style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 14,
                  padding: isX ? '6px 0 2px' : '3px 0',
                }}>
                  <span style={{
                    fontFamily: theme.labelFont, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
                    color: isX ? acc : theme.labelColor, minWidth: 14, textAlign: 'right',
                    opacity: theme.showRowLabels ? 1 : (isX ? 1 : 0.55),
                  }}>{r.label}</span>
                  <span style={{
                    fontFamily: theme.numFont, fontVariantNumeric: 'tabular-nums',
                    fontWeight: 300,
                    fontSize: isX ? 56 : 22,
                    color: dim ? theme.placeholderColor : (isX ? theme.displayColor : theme.displayMuted),
                    lineHeight: 1.05, letterSpacing: isX ? '-0.02em' : '0',
                  }}>{shown}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Keypad ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: theme.keyGap,
        padding: theme.padKeypad, paddingBottom: 28,
      }}>
        {ROWS.flat().map((k) => (
          <div
            key={k.label}
            style={keyStyle(k)}
            onPointerDown={(e) => { e.preventDefault(); onPress(k); }}
          >{k.label}</div>
        ))}
      </div>
    </div>
  );
}

window.RPNCalculator = RPNCalculator;
window.rpnReduce = rpnReduce;
