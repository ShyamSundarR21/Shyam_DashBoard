// src/components/TechStack.jsx
import { TECH_STACK } from '../data/pitch'
import { Camera, Cpu, Monitor, Printer } from 'lucide-react'

const ICONS = [Camera, Cpu, Monitor, Printer]

export default function TechStack() {
  return (
    <section className="py-24 px-6 bg-ink-800/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">Technical Blueprint</p>
          <h2 className="font-display text-4xl font-bold text-white mb-3">
            Implementation<br /><span style={{ color: '#39ff14' }}>Architecture</span>
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Sensor fusion → AI processing → adaptive output → reward loop. Four layers, one pipeline.
          </p>
        </div>

        {/* Pipeline visualization */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
            style={{ background: 'linear-gradient(90deg, #00f5ff33, #39ff1433, #ffb80033, #ff2d7833)' }} />

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
        <div className="mt-16 border border-neon-cyan/20 rounded-2xl p-8 bg-neon-cyan/5 text-center">
          <p className="font-display text-lg md:text-xl font-semibold text-white leading-relaxed max-w-3xl mx-auto">
            "This project solves the retail crisis by transforming the checkout from a{' '}
            <span style={{ color: '#ff2d78' }}>cost center</span> into a{' '}
            <span style={{ color: '#39ff14' }}>revenue engine</span>.
            By using Computer Vision to identify intent, we solve the Expiry Problem,
            the Queue Problem, and the Relevance Problem through one single,{' '}
            <span style={{ color: '#00f5ff' }}>intelligent physical kiosk.</span>"
          </p>
        </div>
      </div>
    </section>
  )
}
