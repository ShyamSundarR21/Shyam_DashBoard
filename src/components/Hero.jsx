// src/components/Hero.jsx
import { Trash2, Zap, ArrowDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg px-6">

      {/* Radial glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* Top badge */}
      <div className="animate-fade-up flex items-center gap-2 border border-green-500/30 rounded-full px-4 py-1.5 mb-8 glass">
        <Trash2 size={12} className="text-green-400" />
        <span className="text-xs font-mono text-green-400 tracking-widest uppercase">Automated Waste Audit Platform</span>
      </div>

      {/* Main headline */}
      <h1 className="animate-fade-up delay-100 font-display text-center leading-none mb-6"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 7rem)', fontWeight: 800 }}>
        <span className="text-white">End Food Waste </span>
        <span style={{ color: '#22c55e' }}>with Precision.</span>
        <br />
        <span className="text-white">Meet </span>
        <span style={{ color: '#22c55e' }}>DineWave.</span>
      </h1>

      {/* Subheadline */}
      <p className="animate-fade-up delay-200 text-center text-zinc-400 max-w-2xl text-lg leading-relaxed mb-10 font-body">
        IoT-powered sensor fusion tracks <span className="text-white font-medium">every gram of food waste</span>,
        measures <span className="text-white font-medium">financial loss in real-time</span>,
        and maintains <span className="text-white font-medium">an immutable audit trail</span> for full restaurant accountability.
      </p>

      {/* Stat pills */}
      <div className="animate-fade-up delay-300 flex flex-wrap gap-3 justify-center mb-12">
        {[
          { label: 'Waste Reduction', val: '↓40%', c: '#22c55e' },
          { label: 'Cost Savings',    val: 'USD 5K/mo',  c: '#3b82f6' },
          { label: 'Accuracy',        val: '99.2%',  c: '#f59e0b' },
          { label: 'Compliance',      val: '✅ GDPR', c: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="border border-ink-border rounded-xl px-4 py-2 glass flex items-center gap-2">
            <span className="font-mono font-semibold text-sm" style={{ color: s.c }}>{s.val}</span>
            <span className="text-xs text-zinc-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="animate-fade-up delay-400 flex gap-4">
        <a href="#dashboard"
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-display font-semibold text-sm text-ink-900 transition-all hover:scale-105"
          style={{ background: '#22c55e', boxShadow: '0 0 30px rgba(34,197,94,0.4)' }}>
          <Zap size={16} /> View Dashboard
        </a>
        <a href="#waste"
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-display font-semibold text-sm text-white border border-ink-border glass transition-all hover:border-green-500/50">
          Learn More
        </a>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-pulse-glow">
        <span className="text-xs text-zinc-600 font-mono tracking-widest uppercase">Scroll</span>
        <ArrowDown size={14} className="text-zinc-600" />
      </div>
    </section>
  )
}
