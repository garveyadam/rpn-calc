// rpn-sheets.jsx — iOS-style bottom sheets: history, settings, deep stack
// Exports to window: Sheet, HistorySheet, SettingsSheet, DeepStackSheet

const SH = {
  panel: '#06243a',
  card: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.08)',
  text: '#eaf4ff',
  sub: 'rgba(180,210,235,0.55)',
  sans: '"DM Sans", system-ui, sans-serif',
  sf: '-apple-system, "SF Pro Display", system-ui, sans-serif',
};

function Sheet({ open, onClose, title, children, accent }) {
  return (
    <React.Fragment>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 40,
          background: 'rgba(0,8,16,0.55)',
          opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .3s ease',
        }}
      />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 41,
        maxHeight: '78%', display: 'flex', flexDirection: 'column',
        background: SH.panel, borderTopLeftRadius: 30, borderTopRightRadius: 30,
        border: `1px solid ${SH.border}`, borderBottom: 'none',
        boxShadow: '0 -20px 50px rgba(0,0,0,0.4)',
        transform: open ? 'translateY(0)' : 'translateY(105%)',
        transition: 'transform .36s cubic-bezier(.22,1,.36,1)',
        paddingBottom: 30,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
          <div style={{ width: 38, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.22)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 22px 8px' }}>
          <span style={{ fontFamily: SH.sans, fontSize: 19, fontWeight: 700, color: SH.text, letterSpacing: '0.01em' }}>{title}</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.10)', color: SH.text, fontSize: 16, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        <div style={{ overflow: 'auto', padding: '4px 16px 0', WebkitOverflowScrolling: 'touch' }}>{children}</div>
      </div>
    </React.Fragment>
  );
}

// ── iOS switch ──
function Switch({ on, onChange, accent }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 50, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
        background: on ? accent : 'rgba(255,255,255,0.18)', transition: 'background .2s', position: 'relative',
        WebkitTapHighlightColor: 'transparent', flexShrink: 0,
      }}
    >
      <span style={{
        display: 'block', width: 26, height: 26, borderRadius: 999, background: '#fff',
        transform: on ? 'translateX(20px)' : 'translateX(0)', transition: 'transform .2s cubic-bezier(.4,1.3,.5,1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

// ── segmented control ──
function Segmented({ value, options, onChange, accent }) {
  return (
    <div style={{ display: 'flex', gap: 2, background: 'rgba(0,0,0,0.25)', borderRadius: 9, padding: 2 }}>
      {options.map((o) => {
        const v = typeof o === 'object' ? o.v : o;
        const lbl = typeof o === 'object' ? o.label : o;
        const active = value === v;
        return (
          <button key={String(v)} onClick={() => onChange(v)} style={{
            padding: '5px 11px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: active ? accent : 'transparent', color: active ? '#fff' : SH.sub,
            fontFamily: SH.sans, fontSize: 12.5, fontWeight: 600, letterSpacing: '0.02em',
            transition: 'background .15s, color .15s', WebkitTapHighlightColor: 'transparent',
          }}>{lbl}</button>
        );
      })}
    </div>
  );
}

function Row({ label, sub, children, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: '13px 16px', borderBottom: last ? 'none' : `1px solid ${SH.border}`,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: SH.sans, fontSize: 15, fontWeight: 500, color: SH.text }}>{label}</div>
        {sub && <div style={{ fontFamily: SH.sans, fontSize: 12, color: SH.sub, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Group({ children }) {
  return <div style={{ background: SH.card, border: `1px solid ${SH.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>{children}</div>;
}

// ───────────────────────── Settings ─────────────────────────
function SettingsSheet({ open, onClose, settings, set, accent, onClearHistory }) {
  return (
    <Sheet open={open} onClose={onClose} title="Settings" accent={accent}>
      <Group>
        <Row label="Angle units" sub="For trig functions">
          <Segmented value={settings.angle} options={[{ v: 'deg', label: 'DEG' }, { v: 'rad', label: 'RAD' }]} onChange={(v) => set('angle', v)} accent={accent} />
        </Row>
        <Row label="Decimal precision" last>
          <Segmented value={settings.prec} options={[{ v: 'auto', label: 'Auto' }, { v: 2, label: '2' }, { v: 4, label: '4' }, { v: 6, label: '6' }]} onChange={(v) => set('prec', v)} accent={accent} />
        </Row>
      </Group>
      <Group>
        <Row label="Thousands separators">
          <Switch on={settings.sep} onChange={(v) => set('sep', v)} accent={accent} />
        </Row>
        <Row label="Key sounds">
          <Switch on={settings.sound} onChange={(v) => set('sound', v)} accent={accent} />
        </Row>
        <Row label="Haptics" sub="Vibrate on key press" last>
          <Switch on={settings.haptics} onChange={(v) => set('haptics', v)} accent={accent} />
        </Row>
      </Group>
      <Group>
        <button onClick={onClearHistory} style={{
          width: '100%', padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontFamily: SH.sans, fontSize: 15, fontWeight: 500, color: '#ff6b6b',
        }}>Clear history</button>
      </Group>
      <div style={{ textAlign: 'center', padding: '4px 0 8px', fontFamily: SH.sans, fontSize: 11.5, color: SH.sub }}>
        Garvey Adam LLP · RPN
      </div>
    </Sheet>
  );
}

// ───────────────────────── History tape ─────────────────────────
function HistorySheet({ open, onClose, history, onReuse, accent }) {
  const items = [...history].reverse();
  return (
    <Sheet open={open} onClose={onClose} title="History" accent={accent}>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px 50px', fontFamily: SH.sans, color: SH.sub }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: SH.text, marginBottom: 6 }}>No calculations yet</div>
          <div style={{ fontSize: 13 }}>Your operations will appear here. Tap any result to push it back onto the stack.</div>
        </div>
      ) : (
        <div style={{ paddingBottom: 8 }}>
          {items.map((it) => (
            <button key={it.id} onClick={() => onReuse(it.value)} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              padding: '12px 14px', marginBottom: 8, cursor: 'pointer', textAlign: 'left',
              background: SH.card, border: `1px solid ${SH.border}`, borderRadius: 14,
              WebkitTapHighlightColor: 'transparent',
            }}>
              <span style={{
                fontFamily: SH.sf, fontVariantNumeric: 'tabular-nums', fontSize: 15, color: SH.text,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{it.text}</span>
              <span style={{
                flexShrink: 0, fontFamily: SH.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                color: accent, border: `1px solid ${accent}`, borderRadius: 999, padding: '3px 9px',
              }}>PUSH</span>
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}

// ───────────────────────── Deep stack ─────────────────────────
function DeepStackSheet({ open, onClose, state, sep, prec, dispatch, accent }) {
  // build full stack rows bottom = X
  const vals = state.entry !== null ? [...state.stack, { entry: state.entry }] : [...state.stack];
  const rows = [];
  for (let i = 0; i < vals.length; i++) {
    const fromBottom = vals.length - 1 - i;
    const lbl = fromBottom === 0 ? 'X' : fromBottom === 1 ? 'Y' : fromBottom === 2 ? 'Z' : fromBottom === 3 ? 'T' : String(fromBottom + 1);
    rows.push({ v: vals[i], label: lbl, isX: fromBottom === 0 });
  }
  function show(v) {
    if (typeof v === 'object' && 'entry' in v) return window.rpnFmtEntry(v.entry, sep);
    return rpnFmt(v, { sep, prec });
  }
  const RollBtn = ({ label, onClick }) => (
    <button onClick={onClick} style={{
      flex: 1, padding: '11px 0', borderRadius: 12, cursor: 'pointer',
      background: 'rgba(255,255,255,0.08)', border: `1px solid ${SH.border}`, color: SH.text,
      fontFamily: SH.sans, fontSize: 13.5, fontWeight: 600, WebkitTapHighlightColor: 'transparent',
    }}>{label}</button>
  );
  return (
    <Sheet open={open} onClose={onClose} title="Stack" accent={accent}>
      <Group>
        {rows.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', fontFamily: SH.sans, color: SH.sub, fontSize: 13.5 }}>Stack is empty</div>
        ) : rows.map((r, i) => (
          <Row key={i} label={<span style={{ fontFamily: SH.sf, fontWeight: 700, letterSpacing: '0.14em', color: r.isX ? accent : SH.sub }}>{r.label}</span>} last={i === rows.length - 1}>
            <span style={{ fontFamily: SH.sf, fontVariantNumeric: 'tabular-nums', fontSize: 18, color: SH.text }}>{show(r.v)}</span>
          </Row>
        ))}
      </Group>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <RollBtn label="Roll ↑" onClick={() => dispatch({ t: 'rollup' })} />
        <RollBtn label="Roll ↓" onClick={() => dispatch({ t: 'rolldown' })} />
        <RollBtn label="x⇄y" onClick={() => dispatch({ t: 'swap' })} />
      </div>
      <button onClick={() => dispatch({ t: 'clearStack' })} style={{
        width: '100%', padding: '12px 0', borderRadius: 12, cursor: 'pointer', marginBottom: 6,
        background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b',
        fontFamily: SH.sans, fontSize: 14, fontWeight: 600, WebkitTapHighlightColor: 'transparent',
      }}>Clear stack</button>
    </Sheet>
  );
}

Object.assign(window, { Sheet, HistorySheet, SettingsSheet, DeepStackSheet, Switch, Segmented });
