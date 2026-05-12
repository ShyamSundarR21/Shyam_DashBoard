// src/components/ProblemSection.jsx
import { PROBLEMS } from '../data/pitch'
import { AlertTriangle } from 'lucide-react'

export default function ProblemSection() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-red-500/30 rounded-full px-4 py-1.5 mb-6 bg-red-500/5">
            <AlertTriangle size={12} className="text-red-400" />
            <span className="text-xs font-mono text-red-400 tracking-widest uppercase">The Retail Crisis</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Four Broken Promises<br />
            <span style={{ color: '#ff2d78' }}>Every Retailer Makes</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Traditional self-checkout is bleeding stores dry. These aren't edge cases — they're daily operational failures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROBLEMS.map((p, i) => (
            <div key={p.id}
              className="border border-red-500/20 rounded-2xl p-6 bg-red-500/5 flex flex-col gap-3 hover:border-red-500/40 transition-colors"
              style={{ animationDelay: `${i * 100}ms` }}>
              <span className="font-mono font-bold text-3xl text-red-400">{p.stat}</span>
              <p className="text-sm text-zinc-400 leading-relaxed">{p.label}</p>
            </div>
          ))}
        </div>

        {/* Divider quote */}
        <div className="mt-16 text-center border-t border-ink-border pt-12">
          <p className="font-display text-xl md:text-2xl font-semibold text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            "The checkout is not just a <span style={{ color: '#ff2d78' }}>cost center</span> —
            it's a <span style={{ color: '#00f5ff' }}>missed opportunity</span> for revenue,
            loyalty, and brand differentiation."
          </p>
        </div>
      </div>
    </section>
  )
}
