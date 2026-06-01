// rpn-ui.jsx — control bar, animated stack, scientific tray, numeric keypad
// Exports to window: THEME_B, ControlBar, StackDisplay, SciTray, Keypad

const THEME_B = {
  bg: 'radial-gradient(120% 80% at 50% 0%, #00496e 0%, #002847 55%, #001b30 100%)',
  display: '#ffffff',
  displayMuted: 'rgba(220,236,255,0.5)',
  placeholder: 'rgba(180,210,235,0.16)',
  label: 'rgba(150,196,232,0.6)',
  numBg: 'rgba(255,255,255,0.10)',
  numFg: '#ffffff',
  fnBg: 'rgba(0,153,255,0.16)',
  fnFg: '#bfe3ff',
  sciBg: 'rgba(255,255,255,0.07)',
  sciFg: '#dcecff',
  opFg: '#ffffff',
  keyBorder: '1px solid rgba(255,255,255,0.06)',
  sans: '"DM Sans", system-ui, sans-serif',
  sf: '-apple-system, "SF Pro Display", system-ui, sans-serif',
};

// ── small glass pill button for the control bar ──
function PillBtn({ children, onClick, active, accent, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        height: 34, minWidth: 34, padding: '0 11px', borderRadius: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        background: active ? accent : 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: active ? '#fff' : 'rgba(220,236,255,0.85)',
        fontFamily: THEME_B.sans, fontSize: 12.5, fontWeight: 600, letterSpacing: '0.04em',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        transition: 'background .2s ease, color .2s ease',
      }}
    >{children}</button>
  );
}

function Icon({ name, size = 17 }) {
  const s = { width: size, height: size, display: 'block' };
  const st = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'clock') return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" {...st} /><path d="M12 7v5l3 2" {...st} /></svg>;
  if (name === 'gear') return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="3.2" {...st} /><path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.7 5.3l-1.7 1.7M7 17l-1.7 1.7M18.7 18.7L17 17M7 7L5.3 5.3" {...st} /></svg>;
  return null;
}

function ControlBar({ accent, angle, onAngle, sciOpen, onSci, onHistory, onSettings }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '64px 16px 8px', gap: 8, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: accent, display: 'block', boxShadow: `0 0 10px ${accent}` }} />
        <span style={{ fontFamily: THEME_B.sans, fontSize: 13, fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(220,236,255,0.92)' }}>RPN</span>
        <button
          onClick={onAngle}
          style={{
            marginLeft: 4, height: 26, padding: '0 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(190,227,255,0.95)', fontFamily: THEME_B.sans, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.12em', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >{angle === 'deg' ? 'DEG' : 'RAD'}</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <PillBtn onClick={onSci} active={sciOpen} accent={accent} label="Scientific functions"><span style={{ fontStyle: 'italic', fontFamily: THEME_B.sf }}>ƒ</span><span style={{ fontSize: 11 }}>(x)</span></PillBtn>
        <PillBtn onClick={onHistory} accent={accent} label="History"><Icon name="clock" /></PillBtn>
        <PillBtn onClick={onSettings} accent={accent} label="Settings"><Icon name="gear" /></PillBtn>
      </div>
    </div>
  );
}

// ───────────────────────── Stack display ─────────────────────────
function StackDisplay({ regs, accent, sep, prec, pulse, onTap }) {
  function show(r) {
    if (r.v === null) return r.isX ? '0' : '';
    if (typeof r.v === 'object' && 'entry' in r.v) return window.rpnFmtEntry(r.v.entry, sep);
    return rpnFmt(r.v, { sep, prec });
  }
  return (
    <div
      onClick={onTap}
      style={{
        flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '4px 24px 12px', overflow: 'hidden', cursor: 'pointer',
      }}
    >
      <div key={pulse} className="rpn-lift">
        {regs.map((r) => {
          const txt = show(r);
          const empty = txt === '' || (r.v === null && !r.isX);
          return (
            <div key={r.label} style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 14,
              padding: r.isX ? '6px 0 0' : '3px 0',
            }}>
              <span style={{
                fontFamily: THEME_B.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
                color: r.isX ? accent : THEME_B.label, minWidth: 14, textAlign: 'right',
              }}>{r.label}</span>
              <span className={r.isX ? 'rpn-x' : ''} style={{
                fontFamily: THEME_B.sf, fontVariantNumeric: 'tabular-nums', fontWeight: 300,
                fontSize: r.isX ? 54 : 21,
                color: empty ? THEME_B.placeholder : (r.isX ? THEME_B.display : THEME_B.displayMuted),
                lineHeight: 1.04, letterSpacing: r.isX ? '-0.02em' : '0',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
              }}>{txt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────── Scientific tray ─────────────────────────
const SCI_KEYS = [
  { p: 'sin', pa: { t: 'fn1', fn: 'sin' }, s: 'sin⁻¹', sa: { t: 'fn1', fn: 'asin' } },
  { p: 'cos', pa: { t: 'fn1', fn: 'cos' }, s: 'cos⁻¹', sa: { t: 'fn1', fn: 'acos' } },
  { p: 'tan', pa: { t: 'fn1', fn: 'tan' }, s: 'tan⁻¹', sa: { t: 'fn1', fn: 'atan' } },
  { p: 'ln', pa: { t: 'fn1', fn: 'ln' }, s: 'eˣ', sa: { t: 'fn1', fn: 'exp' } },
  { p: 'log', pa: { t: 'fn1', fn: 'log' }, s: '10ˣ', sa: { t: 'fn1', fn: 'tenx' } },
  { p: 'x²', pa: { t: 'fn1', fn: 'sq' }, s: 'x³', sa: { t: 'fn1', fn: 'cube' } },
  { p: '√', pa: { t: 'fn1', fn: 'sqrt' }, s: '∛', sa: { t: 'fn1', fn: 'cbrt' } },
  { p: '1/x', pa: { t: 'fn1', fn: 'inv' }, s: 'n!', sa: { t: 'fn1', fn: 'fact' } },
  { p: 'yˣ', pa: { t: 'op', op: 'pow' }, s: 'ˣ√y', sa: { t: 'op', op: 'root' } },
  { p: 'π', pa: { t: 'const', v: Math.PI }, s: 'e', sa: { t: 'const', v: Math.E } },
];

function SciTray({ open, second, onSecond, onKey, accent }) {
  return (
    <div style={{
      maxHeight: open ? 160 : 0, opacity: open ? 1 : 0, flexShrink: 0,
      overflow: 'hidden', transition: 'max-height .32s cubic-bezier(.22,1,.36,1), opacity .25s ease',
      padding: open ? '0 14px' : '0 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px 8px' }}>
        <span style={{ fontFamily: THEME_B.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(150,196,232,0.6)' }}>FUNCTIONS</span>
        <button
          onClick={onSecond}
          style={{
            height: 24, padding: '0 12px', borderRadius: 999, cursor: 'pointer',
            background: second ? accent : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)', color: '#fff',
            fontFamily: THEME_B.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            WebkitTapHighlightColor: 'transparent', transition: 'background .2s',
          }}
        >2nd</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 7 }}>
        {SCI_KEYS.map((k) => {
          const label = second ? k.s : k.p;
          const act = second ? k.sa : k.pa;
          return <Key key={k.p} label={label} act={act} kind="sci" small onKey={onKey} accent={accent} />;
        })}
      </div>
    </div>
  );
}

// ───────────────────────── Key + numeric keypad ─────────────────────────
const NUM_ROWS = [
  [
    { label: 'AC', act: { t: 'clearAll' }, kind: 'fn' },
    { label: '⌫', act: { t: 'back' }, kind: 'fn' },
    { label: 'x⇄y', act: { t: 'swap' }, kind: 'fn', mid: true },
    { label: 'R↓', act: { t: 'rolldown' }, kind: 'fn', mid: true },
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
    { label: '+/−', act: { t: 'neg' }, kind: 'num', mid: true },
    { label: '+', act: { t: 'op', op: '+' }, kind: 'op' },
  ],
  [
    { label: 'ENTER', act: { t: 'enter' }, kind: 'enter', span: 4 },
  ],
];

function Key({ label, act, kind, small, mid, span, onKey, accent }) {
  const [down, setDown] = React.useState(false);
  let bg, fg, border = THEME_B.keyBorder, fs;
  if (kind === 'op' || kind === 'enter') { bg = accent; fg = THEME_B.opFg; }
  else if (kind === 'fn') { bg = THEME_B.fnBg; fg = THEME_B.fnFg; }
  else if (kind === 'sci') { bg = THEME_B.sciBg; fg = THEME_B.sciFg; }
  else { bg = THEME_B.numBg; fg = THEME_B.numFg; }
  fs = small ? 16 : (kind === 'enter' ? 17 : (mid ? 17 : 30));
  return (
    <div
      onPointerDown={(e) => { e.preventDefault(); setDown(true); onKey(act, label, kind); }}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      style={{
        gridColumn: span ? `span ${span}` : undefined,
        height: small ? 44 : 62,
        background: bg, color: fg, border,
        borderRadius: small ? 14 : (span ? 999 : 20),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: kind === 'sci' ? THEME_B.sans : THEME_B.sf,
        fontSize: fs, fontWeight: kind === 'enter' ? 600 : (kind === 'sci' ? 500 : 400),
        letterSpacing: kind === 'enter' ? '0.18em' : '0',
        cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent',
        transform: down ? 'scale(0.93)' : 'scale(1)',
        filter: down ? 'brightness(1.3)' : 'none',
        transition: 'transform .08s ease, filter .12s ease',
        boxShadow: '0 1px 0 rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >{label}</div>
  );
}

function Keypad({ onKey, accent }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, padding: '6px 14px 0', flexShrink: 0 }}>
      {NUM_ROWS.flat().map((k) => (
        <Key key={k.label} {...k} onKey={onKey} accent={accent} />
      ))}
    </div>
  );
}

Object.assign(window, { THEME_B, ControlBar, StackDisplay, SciTray, Keypad, Key });
