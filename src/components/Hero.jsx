// src/components/Hero.jsx
import { Cpu, Zap, ArrowDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg px-6">

      {/* Radial glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,255,20,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* Top badge */}
      <div className="animate-fade-up flex items-center gap-2 border border-neon-cyan/30 rounded-full px-4 py-1.5 mb-8 glass">
        <Cpu size={12} className="text-neon-cyan" />
        <span className="text-xs font-mono text-neon-cyan tracking-widest uppercase">AI Retail Intelligence Platform</span>
      </div>

      {/* Main headline */}
      <h1 className="animate-fade-up delay-100 font-display text-center leading-none mb-6"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 7rem)', fontWeight: 800 }}>
        <span className="text-white">The Checkout </span>
        <span className="text-glow-cyan" style={{ color: '#00f5ff' }}>Revolution</span>
        <br />
        <span className="text-white">Starts </span>
        <span className="text-glow-green" style={{ color: '#39ff14' }}>Here.</span>
      </h1>

      {/* Subheadline */}
      <p className="animate-fade-up delay-200 text-center text-zinc-400 max-w-2xl text-lg leading-relaxed mb-10 font-body">
        One intelligent kiosk that converts <span className="text-white font-medium">expiry waste into revenue</span>,
        eliminates queue friction with <span className="text-white font-medium">YOLOv8 vision</span>,
        and adapts its entire personality to every customer demographic.
      </p>

      {/* Stat pills */}
      <div className="animate-fade-up delay-300 flex flex-wrap gap-3 justify-center mb-12">
        {[
          { label: 'Revenue Recovery', val: '↑100%', c: '#00f5ff' },
          { label: 'Checkout Speed',   val: '↑40%',  c: '#39ff14' },
          { label: 'Repeat Visits',    val: '↑38%',  c: '#ffb800' },
          { label: 'NPS Score',        val: '+67',   c: '#ff2d78' },
        ].map(s => (
          <div key={s.label} className="border border-ink-border rounded-xl px-4 py-2 glass flex items-center gap-2">
            <span className="font-mono font-semibold text-sm" style={{ color: s.c }}>{s.val}</span>
            <span className="text-xs text-zinc-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="animate-fade-up delay-400 flex gap-4">
        <a href="#solutions"
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-display font-semibold text-sm text-ink-900 transition-all hover:scale-105"
          style={{ background: '#00f5ff', boxShadow: '0 0 30px rgba(0,245,255,0.4)' }}>
          <Zap size={16} /> Explore Solution
        </a>
        <a href="#kiosk-demo"
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-display font-semibold text-sm text-white border border-ink-border glass transition-all hover:border-neon-cyan/50">
          Live Demo
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
