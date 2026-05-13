// src/components/TechStack.jsx
import { TECH_STACK } from '../data/pitch'
import { Radio, Zap, Cloud, MonitorPlay } from 'lucide-react'

const ICONS = [Radio, Zap, Cloud, MonitorPlay]

export default function TechStack() {
  return (
    <section id="tech" className="py-24 px-6 bg-ink-800/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">Technical Blueprint</p>
          <h2 className="font-display text-4xl font-bold text-white mb-3">
            DineWave<br /><span style={{ color: '#22c55e' }}>System Architecture</span>
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Sensor fusion → Data processing → Cloud storage → Real-time dashboard. Four layers, complete waste audit.
          </p>
        </div>

        {/* Pipeline visualization */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
            style={{ background: 'linear-gradient(90deg, #22c55e33, #3b82f633, #a855f733, #f59e0b33)' }} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {TECH_STACK.map((layer, i) => {
              const Icon = ICONS[i]
              return (
                <div key={layer.layer} className="relative flex flex-col gap-3">
                  {/* Number badge */}
                  <div className="flex items-center gap-3 lg:flex-col lg:items-center lg:gap-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border"
                      style={{
                        background: `${layer.color}15`,
                        borderColor: `${layer.color}40`,
                        boxShadow: `0 0 20px ${layer.color}20`
                      }}>
                      <Icon size={20} style={{ color: layer.color }} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-mono uppercase tracking-widest" style={{ color: layer.color }}>
                        {String(i + 1).padStart(2, '0')} — {layer.layer}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border p-4 flex flex-col gap-2"
                    style={{ background: `${layer.color}08`, borderColor: `${layer.color}25` }}>
                    {layer.items.map(item => (
                      <div key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: layer.color }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Closing pitch quote */}
        <div className="mt-16 border border-green-600/20 rounded-2xl p-8 bg-green-950/10 text-center">
          <p className="font-display text-lg md:text-xl font-semibold text-white leading-relaxed max-w-3xl mx-auto">
            "DineWave transforms waste from a <span style={{ color: '#ef4444' }}>hidden cost center</span> into a{' '}
            <span style={{ color: '#22c55e' }}>measured, auditable asset.</span>
            Using <span style={{ color: '#3b82f6' }}>sensor fusion</span> and{' '}
            <span style={{ color: '#a855f7' }}>blockchain-style immutable ledgers</span>, restaurants now have{' '}
            <span style={{ color: '#22c55e' }}>complete visibility</span> into their waste patterns, financial impact,
            and compliance obligations."
          </p>
        </div>
      </div>
    </section>
  )
}
