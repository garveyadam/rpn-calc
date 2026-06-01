// app.jsx — assembles the three calculator variations on a design canvas
const { useState } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "native"
}/*EDITMODE-END*/;

const ACCENTS = [
  { id: 'native', label: 'Native', swatch: 'conic-gradient(from 210deg, #FF9F0A, #0099FF, #0072CE, #FF9F0A)' },
  { id: '#FF9F0A', label: 'Orange', swatch: '#FF9F0A' },
  { id: '#0099FF', label: 'Blue', swatch: '#0099FF' },
  { id: '#34C759', label: 'Green', swatch: '#34C759' },
  { id: '#5E5CE6', label: 'Indigo', swatch: '#5E5CE6' },
];

function Variant({ themeKey, accent }) {
  const theme = window.RPN_THEMES[themeKey];
  const dark = theme.id !== 'instrument';
  return (
    <IOSDevice dark={dark}>
      <RPNCalculator theme={theme} accent={accent} />
    </IOSDevice>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const accent = t.accent;

  const board = (key, label) => (
    <DCArtboard
      id={key}
      label={label}
      width={446}
      height={910}
      style={{ background: '#eceef0', overflow: 'visible', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Variant themeKey={key} accent={accent} />
    </DCArtboard>
  );

  return (
    <React.Fragment>
      <DesignCanvas>
        <DCSection
          id="rpn"
          title="RPN Calculator"
          subtitle="Three takes on brand ↔ native · live RPN math · HP-style T/Z/Y/X stack"
        >
          {board('apple', 'A · Pure Apple')}
          {board('navy', 'B · Brand-tinted')}
          {board('instrument', 'C · Brand instrument')}
        </DCSection>
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="Accent color" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '2px 0 4px' }}>
          {ACCENTS.map((a) => {
            const active = accent === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setTweak('accent', a.id)}
                title={a.label}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <span style={{
                  width: 34, height: 34, borderRadius: 999, background: a.swatch,
                  boxShadow: active ? '0 0 0 2px #fff, 0 0 0 4px #111' : 'inset 0 0 0 1px rgba(0,0,0,0.12)',
                  display: 'block',
                }} />
                <span style={{
                  fontSize: 10.5, fontWeight: active ? 700 : 500,
                  color: active ? '#111' : '#888', fontFamily: 'system-ui',
                }}>{a.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{
          fontSize: 11.5, lineHeight: 1.5, color: '#9aa0a6', fontFamily: 'system-ui',
          padding: '6px 2px 0',
        }}>
          “Native” keeps each variant's own default (Apple orange · brand blues). Operators &amp; ENTER pick up the accent.
        </div>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
