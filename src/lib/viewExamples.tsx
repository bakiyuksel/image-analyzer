import type { Lang } from './i18n'

const T = '#d43030'   // red accent
const R = '#ef4444'   // red alert
const A = '#f59e0b'   // amber warn
const G = '#10b981'   // green ok

type EP = { lang: Lang }
const nl = (lang: Lang) => lang === 'nl'

function Frame({ children, h = 160 }: { children: React.ReactNode; h?: number }) {
  return (
    <svg viewBox={`0 0 280 ${h}`} xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px] rounded-xl border border-rim/40">
      <rect width="280" height={h} fill="#171929" rx="10"/>
      {children}
    </svg>
  )
}

function Tag({ x, y, w = 110, color, text }: { x: number; y: number; w?: number; color: string; text: string }) {
  return (
    <>
      <rect x={x - w / 2} y={y - 12} width={w} height={16} rx="4" fill={`${color}22`}/>
      <text x={x} y={y} textAnchor="middle" fill={color} fontSize="8.5" fontFamily="system-ui,sans-serif">{text}</text>
    </>
  )
}

// ── ORIGINAL ─────────────────────────────────────────────────────────────────
function OriginalExample({ lang }: EP) {
  const isNL = nl(lang)
  return (
    <Frame>
      <rect width="280" height="160" fill="#28303d" rx="10"/>
      <rect y="105" width="280" height="55" fill="#1e2a1e"/>
      {/* sun top-left */}
      <circle cx="28" cy="28" r="11" fill="#fbbf24" opacity="0.85"/>
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <line key={i} x1={28 + Math.cos(a * Math.PI/180) * 14} y1={28 + Math.sin(a * Math.PI/180) * 14}
              x2={28 + Math.cos(a * Math.PI/180) * 20} y2={28 + Math.sin(a * Math.PI/180) * 20}
              stroke="#fbbf24" strokeWidth="1.5" opacity="0.6"/>
      ))}
      {/* object 1 – correct shadow (bottom-right of sun) */}
      <ellipse cx="90" cy="88" rx="22" ry="22" fill="#5a6070"/>
      <ellipse cx="100" cy="107" rx="20" ry="5" fill="#0008"/>
      <Tag x={90} y={150} color={G} text={isNL ? '✓ Schaduw klopt' : '✓ Shadow correct'} />
      {/* object 2 – wrong shadow direction */}
      <ellipse cx="200" cy="88" rx="22" ry="22" fill="#5a6070"/>
      <ellipse cx="188" cy="107" rx="20" ry="5" fill="#0008"/>
      <rect x="173" y="63" width="56" height="52" rx="5" fill="none" stroke={R} strokeWidth="1.5" strokeDasharray="3,2"/>
      <Tag x={200} y={150} color={R} text={isNL ? '⚠ Schaduw verkeerd' : '⚠ Shadow mismatch'} />
    </Frame>
  )
}

// ── ELA ──────────────────────────────────────────────────────────────────────
function ElaExample({ lang }: EP) {
  const isNL = nl(lang)
  return (
    <Frame>
      <rect width="280" height="160" fill="#060606" rx="10"/>
      <ellipse cx="70" cy="80" rx="45" ry="32" fill="#191919"/>
      <ellipse cx="170" cy="75" rx="55" ry="38" fill="#222"/>
      {/* minor edit */}
      <ellipse cx="105" cy="112" rx="32" ry="20" fill="#3a3a3a"/>
      <rect x="72" y="92" width="65" height="40" rx="4" fill="none" stroke={A} strokeWidth="1.2" strokeDasharray="3,2"/>
      <Tag x={105} y={150} w={100} color={A} text={isNL ? 'Lichte afwijking' : 'Minor deviation'} />
      {/* heavy edit */}
      <ellipse cx="218" cy="62" rx="34" ry="24" fill="#999"/>
      <ellipse cx="222" cy="59" rx="19" ry="13" fill="#fff"/>
      <rect x="181" y="36" width="73" height="53" rx="4" fill="none" stroke={R} strokeWidth="1.5" strokeDasharray="3,2"/>
      <Tag x={218} y={150} w={100} color={R} text={isNL ? 'Sterk bewerkt' : 'Heavily edited'} />
    </Frame>
  )
}

// ── NOISE MAP ─────────────────────────────────────────────────────────────────
function NoiseMapExample({ lang }: EP) {
  const isNL = nl(lang)
  return (
    <Frame>
      <defs>
        <pattern id="nm" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <rect width="5" height="5" fill="#464e5a"/>
          <circle cx="1.2" cy="1.4" r="0.9" fill="#525c68" opacity="0.9"/>
          <circle cx="3.8" cy="2.2" r="0.7" fill="#3c4450" opacity="0.8"/>
          <circle cx="1.8" cy="3.9" r="0.8" fill="#5a6270" opacity="0.7"/>
          <circle cx="4.2" cy="4.5" r="0.6" fill="#4a5260" opacity="0.9"/>
        </pattern>
      </defs>
      <rect x="2" y="2" width="136" height="156" fill="url(#nm)" rx="9"/>
      <rect x="140" y="2" width="138" height="156" fill="#48505c" rx="9"/>
      <line x1="139" y1="0" x2="139" y2="160" stroke={T} strokeWidth="1.5" strokeDasharray="5,3"/>
      <rect x="8" y="130" width="122" height="22" rx="4" fill="#000a"/>
      <text x="69" y="145" textAnchor="middle" fill={G} fontSize="9" fontFamily="system-ui,sans-serif">{isNL ? '✓ Organische ruis' : '✓ Organic noise'}</text>
      <rect x="150" y="130" width="122" height="22" rx="4" fill="#000a"/>
      <text x="211" y="145" textAnchor="middle" fill={R} fontSize="9" fontFamily="system-ui,sans-serif">{isNL ? '⚠ Te glad (bewerkt)' : '⚠ Too smooth (edited)'}</text>
    </Frame>
  )
}

// ── SOBEL ─────────────────────────────────────────────────────────────────────
function SobelExample({ lang }: EP) {
  const isNL = nl(lang)
  return (
    <Frame>
      <rect width="280" height="160" fill="#080808" rx="10"/>
      {/* normal edge – single clean outline */}
      <circle cx="72" cy="75" r="42" fill="none" stroke="#ddd" strokeWidth="1.5"/>
      <Tag x={72} y={148} color={G} text={isNL ? '✓ Schone rand' : '✓ Clean edge'} />
      {/* halo edge – double/thick outline (compositing artifact) */}
      <circle cx="200" cy="75" r="42" fill="none" stroke="#fff" strokeWidth="5" opacity="0.15"/>
      <circle cx="200" cy="75" r="42" fill="none" stroke="#ccc" strokeWidth="1.5"/>
      <circle cx="200" cy="75" r="37" fill="none" stroke="#888" strokeWidth="1" opacity="0.6"/>
      <circle cx="200" cy="75" r="47" fill="none" stroke="#666" strokeWidth="0.8" opacity="0.4"/>
      <rect x="150" y="28" width="100" height="96" rx="5" fill="none" stroke={R} strokeWidth="1.3" strokeDasharray="3,2"/>
      <Tag x={200} y={148} color={R} text={isNL ? '⚠ Halo = compositing' : '⚠ Halo = compositing'} />
    </Frame>
  )
}

// ── NEGATIVE ──────────────────────────────────────────────────────────────────
function NegativeExample({ lang }: EP) {
  const isNL = nl(lang)
  return (
    <Frame>
      {/* simulated inverted image */}
      <rect width="280" height="160" fill="#c8c0b0" rx="10"/>
      <ellipse cx="100" cy="70" rx="55" ry="45" fill="#b0a898"/>
      <rect x="50" y="30" width="100" height="80" rx="8" fill="#a8a090"/>
      {/* hidden patch revealed */}
      <rect x="155" y="45" width="90" height="70" rx="6" fill="#e8e0d0"/>
      <rect x="170" y="55" width="62" height="50" rx="4" fill="#f0e8d8"/>
      <rect x="153" y="43" width="94" height="74" rx="7" fill="none" stroke={R} strokeWidth="1.5" strokeDasharray="3,2"/>
      {/* arrow + label */}
      <line x1="200" y1="42" x2="200" y2="28" stroke={R} strokeWidth="1.5" markerEnd="url(#arr)"/>
      <Tag x={200} y={148} w={130} color={R} text={isNL ? '⚠ Patch zichtbaar in negatief' : '⚠ Patch revealed in negative'} />
    </Frame>
  )
}

// ── GRAYSCALE ────────────────────────────────────────────────────────────────
function GrayscaleExample({ lang }: EP) {
  const isNL = nl(lang)
  return (
    <Frame>
      {/* gradient background: lighter top-left (light source) */}
      <defs>
        <radialGradient id="gs-bg" cx="20%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#888"/>
          <stop offset="100%" stopColor="#333"/>
        </radialGradient>
        <radialGradient id="gs-obj" cx="70%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ccc"/>
          <stop offset="100%" stopColor="#888"/>
        </radialGradient>
      </defs>
      <rect width="280" height="160" fill="url(#gs-bg)" rx="10"/>
      {/* light source indicator */}
      <circle cx="28" cy="28" r="8" fill="#fff" opacity="0.6"/>
      <text x="42" y="32" fill="#ccc" fontSize="8" fontFamily="system-ui,sans-serif">{isNL ? 'Licht' : 'Light'}</text>
      {/* object with WRONG shading direction (too bright on right = wrong) */}
      <ellipse cx="175" cy="85" rx="55" ry="50" fill="url(#gs-obj)"/>
      <rect x="118" y="33" width="114" height="104" rx="8" fill="none" stroke={R} strokeWidth="1.5" strokeDasharray="3,2"/>
      <Tag x={175} y={150} w={150} color={R} text={isNL ? '⚠ Belichting ≠ achtergrond' : '⚠ Lighting ≠ background'} />
    </Frame>
  )
}

// ── HIGH CONTRAST ─────────────────────────────────────────────────────────────
function HighContrastExample({ lang }: EP) {
  const isNL = nl(lang)
  return (
    <Frame>
      <rect width="280" height="160" fill="#000" rx="10"/>
      {/* light source arrow */}
      <circle cx="30" cy="30" r="9" fill="#fff"/>
      <line x1="42" y1="42" x2="72" y2="72" stroke="#fff" strokeWidth="1.5"/>
      <polygon points="72,68 76,76 68,72" fill="#fff"/>
      <text x="50" y="22" fill="#aaa" fontSize="8" fontFamily="system-ui,sans-serif">{isNL ? 'Licht →' : 'Light →'}</text>
      {/* object */}
      <ellipse cx="150" cy="85" rx="40" ry="40" fill="#eee"/>
      {/* correct shadow would be bottom-right */}
      {/* wrong shadow – goes bottom-LEFT */}
      <ellipse cx="118" cy="112" rx="35" ry="9" fill="#fff" opacity="0.3"/>
      <rect x="98" y="100" width="42" height="20" rx="3" fill="none" stroke={R} strokeWidth="1.5" strokeDasharray="3,2"/>
      <line x1="119" y1="99" x2="100" y2="78" stroke={R} strokeWidth="1" strokeDasharray="2,2"/>
      <Tag x={150} y={150} w={160} color={R} text={isNL ? '⚠ Schaduw verkeerde richting' : '⚠ Shadow wrong direction'} />
    </Frame>
  )
}

// ── HUE ───────────────────────────────────────────────────────────────────────
function HueExample({ lang }: EP) {
  const isNL = nl(lang)
  return (
    <Frame>
      {/* uniform hue = mid-grey */}
      <rect width="280" height="160" fill="#707070" rx="10"/>
      {/* uniform natural variation */}
      <ellipse cx="80" cy="65" rx="40" ry="30" fill="#6a6a6a"/>
      <ellipse cx="60" cy="110" rx="30" ry="22" fill="#787878"/>
      <ellipse cx="220" cy="50" rx="25" ry="20" fill="#686868"/>
      {/* suspicious block with clearly different hue value */}
      <rect x="140" y="70" width="100" height="65" rx="6" fill="#3a4a3a"/>
      <rect x="138" y="68" width="104" height="69" rx="7" fill="none" stroke={T} strokeWidth="1.5"/>
      <rect x="138" y="68" width="104" height="69" rx="7" fill="none" stroke={R} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.7"/>
      <Tag x={190} y={150} w={130} color={R} text={isNL ? '⚠ Hue-blok = kleurbewerking' : '⚠ Hue block = color edit'} />
    </Frame>
  )
}

// ── SATURATION ────────────────────────────────────────────────────────────────
function SaturationExample({ lang }: EP) {
  const isNL = nl(lang)
  return (
    <Frame>
      {/* low saturation = dark grey */}
      <rect width="280" height="160" fill="#2a2a2a" rx="10"/>
      <ellipse cx="70" cy="75" rx="38" ry="28" fill="#323232"/>
      <ellipse cx="55" cy="120" rx="28" ry="18" fill="#2e2e2e"/>
      <ellipse cx="220" cy="110" rx="35" ry="22" fill="#303030"/>
      {/* high saturation = bright area */}
      <ellipse cx="175" cy="70" rx="55" ry="45" fill="#bbb"/>
      <ellipse cx="175" cy="70" rx="38" ry="30" fill="#ddd"/>
      <ellipse cx="175" cy="70" rx="22" ry="17" fill="#fff"/>
      <rect x="115" y="22" width="120" height="100" rx="7" fill="none" stroke={R} strokeWidth="1.5" strokeDasharray="3,2"/>
      <Tag x={175} y={148} w={140} color={R} text={isNL ? '⚠ Lokale saturatiepiek' : '⚠ Local saturation spike'} />
    </Frame>
  )
}

// ── CLONE DETECT ─────────────────────────────────────────────────────────────
function CloneDetectExample({ lang }: EP) {
  const isNL = nl(lang)
  // simple leaf shape via path
  const leaf = 'M0,-22 C12,-22 22,-12 22,0 C22,15 8,28 0,35 C-8,28 -22,15 -22,0 C-22,-12 -12,-22 0,-22 Z'
  return (
    <Frame>
      <rect width="280" height="160" fill="#1e2830" rx="10"/>
      {/* texture */}
      <ellipse cx="70" cy="110" rx="55" ry="30" fill="#243020" opacity="0.8"/>
      <ellipse cx="210" cy="110" rx="55" ry="30" fill="#243020" opacity="0.8"/>
      {/* clone 1 */}
      <g transform="translate(75,78)">
        <path d={leaf} fill="#2d5020" stroke="#3a6628" strokeWidth="1"/>
        <path d="M0,-8 C4,-8 7,-4 7,0 C7,5 3,9 0,12 C-3,9 -7,5 -7,0 C-7,-4 -4,-8 0,-8 Z" fill="#3a6628" opacity="0.6"/>
      </g>
      <rect x="50" y="52" width="52" height="58" rx="4" fill="none" stroke={R} strokeWidth="1.5"/>
      {/* clone 2 */}
      <g transform="translate(205,78)">
        <path d={leaf} fill="#2d5020" stroke="#3a6628" strokeWidth="1"/>
        <path d="M0,-8 C4,-8 7,-4 7,0 C7,5 3,9 0,12 C-3,9 -7,5 -7,0 C-7,-4 -4,-8 0,-8 Z" fill="#3a6628" opacity="0.6"/>
      </g>
      <rect x="180" y="52" width="52" height="58" rx="4" fill="none" stroke={R} strokeWidth="1.5"/>
      {/* curved arrow between */}
      <path d="M106,78 C140,50 170,50 178,78" fill="none" stroke={R} strokeWidth="1.5" strokeDasharray="4,2"/>
      <polygon points="178,74 182,82 174,80" fill={R}/>
      <Tag x={140} y={148} w={160} color={R} text={isNL ? '⚠ Identieke gebieden gevonden' : '⚠ Identical regions found'} />
    </Frame>
  )
}

// ── CHANNEL (red / green / blue) ──────────────────────────────────────────────
function ChannelExample({ lang, channel }: EP & { channel: 'red' | 'green' | 'blue' }) {
  const isNL = nl(lang)
  const palette = {
    red:   { bg: '#1a0808', noise: '#3a1010', smooth: '#2a0808', obj: '#501818' },
    green: { bg: '#081a08', noise: '#103a10', smooth: '#082a08', obj: '#185018' },
    blue:  { bg: '#08081a', noise: '#10103a', smooth: '#08082a', obj: '#181850' },
  }[channel]

  return (
    <Frame>
      <defs>
        <pattern id={`ch-noise-${channel}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill={palette.noise}/>
          <circle cx="1" cy="1" r="0.7" fill={palette.obj} opacity="0.7"/>
          <circle cx="3" cy="2.5" r="0.5" fill={palette.bg} opacity="0.6"/>
          <circle cx="2" cy="3.5" r="0.6" fill={palette.obj} opacity="0.8"/>
        </pattern>
      </defs>
      {/* background with consistent noise */}
      <rect width="280" height="160" fill={`url(#ch-noise-${channel})`} rx="10"/>
      {/* pasted object with DIFFERENT noise/texture */}
      <ellipse cx="185" cy="80" rx="65" ry="55" fill={palette.smooth}/>
      <rect x="118" y="22" width="132" height="112" rx="7" fill="none" stroke={T} strokeWidth="1.5"/>
      <rect x="118" y="22" width="132" height="112" rx="7" fill="none" stroke={R} strokeWidth="1.5" strokeDasharray="3,2" opacity="0.7"/>
      <Tag x={185} y={148} w={150} color={R} text={isNL ? '⚠ Afwijkend ruispatroon' : '⚠ Deviating noise pattern'} />
    </Frame>
  )
}

// ── JPEG GHOST ────────────────────────────────────────────────────────────────
function JpegGhostExample({ lang }: EP) {
  const isNL = nl(lang)
  return (
    <Frame>
      <rect width="280" height="160" fill="#050505" rx="10"/>
      {/* mostly dark = consistent JPEG quality */}
      <ellipse cx="70" cy="75" rx="45" ry="35" fill="#0f0f0f"/>
      <ellipse cx="150" cy="115" rx="60" ry="25" fill="#0d0d0d"/>
      {/* orange-red region = different JPEG quality source */}
      <defs>
        <radialGradient id="jg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4500" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="#cc3000" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#881800" stopOpacity="0.1"/>
        </radialGradient>
      </defs>
      <ellipse cx="205" cy="65" rx="55" ry="45" fill="url(#jg-glow)"/>
      <rect x="148" y="18" width="112" height="92" rx="7" fill="none" stroke="#ff4500" strokeWidth="1.5" strokeDasharray="3,2"/>
      <Tag x={205} y={148} w={155} color="#ff4500" text={isNL ? '⚠ Andere JPEG-kwaliteit = plak' : '⚠ Different JPEG quality = paste'} />
    </Frame>
  )
}

// ── FFT SPECTRUM ──────────────────────────────────────────────────────────────
function FftExample({ lang }: EP) {
  const isNL = nl(lang)
  const dots = []
  for (let x = 25; x <= 125; x += 25) {
    for (let y = 20; y <= 140; y += 25) {
      if (Math.abs(x - 75) > 5 || Math.abs(y - 80) > 5) {
        dots.push(<circle key={`${x}-${y}`} cx={140 + x} cy={y} r="2.5" fill={T} opacity="0.85"/>)
      }
    }
  }
  return (
    <Frame h={172}>
      <rect width="280" height="172" fill="#020202" rx="10"/>
      {/* divider */}
      <line x1="140" y1="0" x2="140" y2="172" stroke="#1e1e38" strokeWidth="1"/>
      {/* ── LEFT: normal spectrum ── */}
      {/* horizontal line through center */}
      <rect x="2" y="79" width="136" height="2" fill="#555" opacity="0.6"/>
      {/* vertical line through center */}
      <rect x="69" y="2" width="2" height="156" fill="#555" opacity="0.6"/>
      {/* center bright spot */}
      <circle cx="70" cy="80" r="6" fill="#fff"/>
      <circle cx="70" cy="80" r="10" fill="#fff" opacity="0.3"/>
      <rect x="4" y="156" width="132" height="14" rx="3" fill="#0009"/>
      <text x="70" y="167" textAnchor="middle" fill={G} fontSize="9" fontFamily="system-ui,sans-serif">{isNL ? '✓ Normaal' : '✓ Normal'}</text>
      {/* ── RIGHT: suspicious – grid of dots ── */}
      {/* horizontal + vertical lines */}
      <rect x="142" y="79" width="136" height="2" fill="#555" opacity="0.6"/>
      <rect x="209" y="2" width="2" height="156" fill="#555" opacity="0.6"/>
      {/* center spot */}
      <circle cx="210" cy="80" r="6" fill="#fff"/>
      <circle cx="210" cy="80" r="10" fill="#fff" opacity="0.3"/>
      {/* periodic dots = suspicious */}
      {dots}
      <rect x="144" y="156" width="132" height="14" rx="3" fill="#0009"/>
      <text x="210" y="167" textAnchor="middle" fill={R} fontSize="9" fontFamily="system-ui,sans-serif">{isNL ? '⚠ Regelmatig grid = verdacht' : '⚠ Regular grid = suspicious'}</text>
    </Frame>
  )
}

// ── EXPORT MAP ────────────────────────────────────────────────────────────────
export function getViewExample(id: string, lang: Lang): React.ReactNode | null {
  const p: EP = { lang }
  switch (id) {
    case 'original':      return <OriginalExample {...p} />
    case 'ela':           return <ElaExample {...p} />
    case 'noise-map':     return <NoiseMapExample {...p} />
    case 'sobel':         return <SobelExample {...p} />
    case 'negative':      return <NegativeExample {...p} />
    case 'grayscale':     return <GrayscaleExample {...p} />
    case 'high-contrast': return <HighContrastExample {...p} />
    case 'hue':           return <HueExample {...p} />
    case 'saturation':    return <SaturationExample {...p} />
    case 'clone-detect':  return <CloneDetectExample {...p} />
    case 'red-channel':   return <ChannelExample {...p} channel="red" />
    case 'green-channel': return <ChannelExample {...p} channel="green" />
    case 'blue-channel':  return <ChannelExample {...p} channel="blue" />
    case 'jpeg-ghost':    return <JpegGhostExample {...p} />
    case 'fft-spectrum':  return <FftExample {...p} />
    default:              return null
  }
}
