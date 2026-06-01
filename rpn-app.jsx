// rpn-app.jsx — state, persistence, sound/haptics, tweaks, composition
const { useState, useReducer, useEffect, useRef, useCallback } = React;

const STATE_KEY = 'rpn.state.v1';
const SETTINGS_KEY = 'rpn.settings.v1';

const SETTINGS_DEFAULTS = { angle: 'deg', prec: 'auto', sep: true, sound: true, haptics: true };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0099FF"
}/*EDITMODE-END*/;

const ACCENTS = [
  { id: '#0099FF', label: 'Azure' },
  { id: '#0072CE', label: 'Cobalt' },
  { id: '#FF9F0A', label: 'Amber' },
  { id: '#34C759', label: 'Green' },
  { id: '#5E5CE6', label: 'Indigo' },
];

// ── tiny WebAudio click synth ──
function useClick() {
  const ctxRef = useRef(null);
  return useCallback((kind) => {
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const now = ctx.currentTime;
      const freq = kind === 'op' || kind === 'enter' ? 320 : kind === 'fn' || kind === 'sci' ? 520 : 660;
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now);
      o.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.04);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.16, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.08);
    } catch (e) { /* ignore */ }
  }, []);
}

function loadJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const accent = t.accent;

  const [state, dispatch] = useReducer(rpnReduceApp, null, () => {
    const base = { ...RPN_INIT };
    const saved = loadJSON(STATE_KEY, null);
    if (saved) { base.stack = saved.stack || []; base.history = saved.history || []; }
    return base;
  });

  const [settings, setSettings] = useState(() => ({ ...SETTINGS_DEFAULTS, ...loadJSON(SETTINGS_KEY, {}) }));
  const setSetting = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const [sciOpen, setSciOpen] = useState(false);
  const [second, setSecond] = useState(false);
  const [sheet, setSheet] = useState(null); // 'history' | 'settings' | 'stack' | null

  const click = useClick();

  // ── persist ──
  useEffect(() => {
    try { localStorage.setItem(STATE_KEY, JSON.stringify({ stack: state.stack, history: state.history })); } catch (e) {}
  }, [state.stack, state.history]);
  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
  }, [settings]);

  // ── key dispatch with feedback ──
  const onKey = useCallback((act, label, kind) => {
    if (settings.sound) click(kind);
    if (settings.haptics && navigator.vibrate) navigator.vibrate(kind === 'op' || kind === 'enter' ? 12 : 7);
    const a = act.t === 'fn1' ? { ...act, angle: settings.angle } : act;
    dispatch(a);
  }, [settings.sound, settings.haptics, settings.angle, click]);

  // ── physical keyboard ──
  useEffect(() => {
    const map = {
      '0': { t: 'digit', c: '0' }, '1': { t: 'digit', c: '1' }, '2': { t: 'digit', c: '2' },
      '3': { t: 'digit', c: '3' }, '4': { t: 'digit', c: '4' }, '5': { t: 'digit', c: '5' },
      '6': { t: 'digit', c: '6' }, '7': { t: 'digit', c: '7' }, '8': { t: 'digit', c: '8' },
      '9': { t: 'digit', c: '9' }, '.': { t: 'point' },
      '+': { t: 'op', op: '+' }, '-': { t: 'op', op: '-' }, '*': { t: 'op', op: '*' }, '/': { t: 'op', op: '/' },
      'Enter': { t: 'enter' }, 'Backspace': { t: 'back' }, 'Escape': { t: 'clearAll' },
      's': { t: 'swap' }, 'r': { t: 'rolldown' }, 'n': { t: 'neg' },
    };
    const h = (e) => {
      if (sheet) return;
      const a = map[e.key];
      if (a) { e.preventDefault(); onKey(a, e.key, a.t === 'op' ? 'op' : 'num'); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onKey, sheet]);

  const regs = rpnRegisters(state, 4);
  const err = state.flash === 'err';

  return (
    <React.Fragment>
      <div className="rpn-stage">
        <div className="rpn-frame" id="rpn-frame">
          <IOSDevice dark>
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
              background: THEME_B.bg, overflow: 'hidden',
            }}>
              <ControlBar
                accent={accent} angle={settings.angle}
                onAngle={() => setSetting('angle', settings.angle === 'deg' ? 'rad' : 'deg')}
                sciOpen={sciOpen} onSci={() => setSciOpen((o) => !o)}
                onHistory={() => setSheet('history')} onSettings={() => setSheet('settings')}
              />

              <div className={err ? 'rpn-shake' : ''} style={{ flex: 1, minHeight: 0, display: 'flex' }}>
                <StackDisplay regs={regs} accent={accent} sep={settings.sep} prec={settings.prec} pulse={state.pulse} onTap={() => setSheet('stack')} />
              </div>

              <SciTray open={sciOpen} second={second} onSecond={() => setSecond((s) => !s)} onKey={onKey} accent={accent} />
              <Keypad onKey={onKey} accent={accent} />
              <div style={{ height: 26, flexShrink: 0 }} />

              <HistorySheet open={sheet === 'history'} onClose={() => setSheet(null)} history={state.history}
                onReuse={(v) => { dispatch({ t: 'push', v }); if (settings.sound) click('num'); setSheet(null); }} accent={accent} />
              <SettingsSheet open={sheet === 'settings'} onClose={() => setSheet(null)} settings={settings} set={setSetting}
                accent={accent} onClearHistory={() => dispatch({ t: 'clearHistory' })} />
              <DeepStackSheet open={sheet === 'stack'} onClose={() => setSheet(null)} state={state}
                sep={settings.sep} prec={settings.prec} dispatch={dispatch} accent={accent} />
            </div>
          </IOSDevice>
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Accent" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, padding: '2px 0 6px' }}>
          {ACCENTS.map((a) => {
            const active = accent === a.id;
            return (
              <button key={a.id} onClick={() => setTweak('accent', a.id)} title={a.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}>
                <span style={{
                  width: 34, height: 34, borderRadius: 999, background: a.id,
                  boxShadow: active ? '0 0 0 2px #fff, 0 0 0 4px #111' : 'inset 0 0 0 1px rgba(0,0,0,0.15)',
                }} />
                <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, color: active ? '#111' : '#888', fontFamily: 'system-ui' }}>{a.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: '#9aa0a6', fontFamily: 'system-ui', padding: '4px 2px 0' }}>
          Sets operator &amp; ENTER keys plus the live X register. App preferences (angle, sound, precision) live in the in-app Settings sheet.
        </div>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
