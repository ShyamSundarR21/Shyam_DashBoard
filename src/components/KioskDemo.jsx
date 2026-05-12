// src/components/KioskDemo.jsx
import { useState } from 'react'
import { PERSONAS } from '../data/pitch'
import { Ticket, Volume2, ChevronRight } from 'lucide-react'

function KioskScreen({ persona }) {
  const p = PERSONAS[persona]
  return (
    <div className={`relative rounded-2xl overflow-hidden border p-6 bg-gradient-to-br ${p.bg} transition-all duration-500`}
      style={{ borderColor: `${p.accent}40`, minHeight: '420px' }}>

      {/* Scan line animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
        <div className="absolute left-0 right-0 h-0.5 animate-scan opacity-30"
          style={{ background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)` }} />
      </div>

      {/* Corner accents */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl-md" style={{ borderColor: p.accent }} />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 rounded-tr-md" style={{ borderColor: p.accent }} />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 rounded-bl-md" style={{ borderColor: p.accent }} />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br-md" style={{ borderColor: p.accent }} />

      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-3xl">{p.emoji}</span>
        <h3 className={`${persona === 'senior' ? 'text-3xl' : 'text-xl'} font-display font-bold text-white mt-2`}>
          {p.greeting}
        </h3>
        <p className={`${persona === 'senior' ? 'text-lg' : 'text-sm'} mt-1`} style={{ color: p.accent }}>
          {p.subtext}
        </p>
      </div>

      {/* Badge */}
      <div className="flex justify-center mb-4">
        <span className="text-xs font-mono px-4 py-1.5 rounded-full border font-bold tracking-widest"
          style={{ color: p.accent, borderColor: `${p.accent}50`, background: `${p.accent}15` }}>
          {p.badge}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {p.items.map(item => (
          <div key={item.name} className="flex items-center justify-between rounded-xl px-4 py-3 border glass"
            style={{ borderColor: `${p.accent}25` }}>
            <div>
              <p className={`${persona === 'senior' ? 'text-base' : 'text-sm'} font-medium text-white`}>{item.name}</p>
              <p className="text-xs mt-0.5" style={{ color: p.accent }}>{item.trend}</p>
            </div>
            <div className="text-right">
              <p className={`${persona === 'senior' ? 'text-base' : 'text-sm'} font-mono font-semibold text-white`}>{item.price}</p>
              <p className="text-xs text-emerald-400">{item.saving}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button className="w-full py-3 rounded-xl font-display font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
        style={{ background: p.accent, color: '#050508', fontSize: persona === 'senior' ? '1rem' : '0.875rem' }}>
        {persona === 'senior' ? <Volume2 size={16} /> : <Ticket size={14} />}
        {p.cta}
      </button>
    </div>
  )
}

export default function KioskDemo() {
  const [active, setActive] = useState('genz')

  return (
    <section id="kiosk-demo" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">Live Demo</p>
          <h2 className="font-display text-4xl font-bold text-white mb-3">
            One Kiosk.<br />
            <span style={{ color: '#ffb800' }}>Two Worlds.</span>
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            The AI detects the customer's demographic archetype and instantly adapts its entire personality, language, and offers.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex rounded-xl border border-ink-border glass p-1 gap-1">
            {Object.entries(PERSONAS).map(([key, val]) => (
              <button key={key}
                onClick={() => setActive(key)}
                className="px-6 py-2.5 rounded-lg text-sm font-display font-semibold transition-all"
                style={active === key
                  ? { background: val.accent, color: '#050508' }
                  : { color: '#888', background: 'transparent' }}>
                {val.emoji} {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* Screen */}
        <div className="max-w-md mx-auto">
          <KioskScreen persona={active} key={active} />
        </div>

        {/* Explanation row */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {[
            { label: 'Detection', desc: 'Face age estimation identifies demographic in <0.3s', icon: '🎯' },
            { label: 'Adaptation', desc: 'UI theme, font size, and language instantly re-skin', icon: '🎭' },
            { label: 'Personalization', desc: 'Archetype model selects hyper-relevant offers', icon: '💡' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-5 border border-ink-border bg-ink-700/30">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-sm font-semibold text-white mt-2 mb-1">{item.label}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
