// src/components/SolutionsSection.jsx
import { SOLUTIONS } from '../data/pitch'
import SolutionCard from './SolutionCard'

export default function SolutionsSection() {
  return (
    <section id="solutions" className="py-24 px-6 relative">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-neon-cyan/30 rounded-full px-4 py-1.5 mb-6 bg-neon-cyan/5">
            <span className="text-xs font-mono text-neon-cyan tracking-widest uppercase">The Architecture</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Four AI Systems.<br />
            <span style={{ color: '#00f5ff' }}>One Unified Solution.</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Each module targets a distinct business problem. Together, they transform the checkout from a liability into a competitive weapon.
          </p>
        </div>

        <div className="space-y-12">
          {SOLUTIONS.map((sol, i) => (
            <SolutionCard key={sol.id} sol={sol} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
