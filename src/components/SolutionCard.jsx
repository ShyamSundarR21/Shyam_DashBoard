// src/components/SolutionCard.jsx

const colorMap = {
  cyan:  { border: 'rgba(0,245,255,0.25)',  bg: 'rgba(0,245,255,0.04)',  tag: 'rgba(0,245,255,0.12)',  tagText: '#00f5ff' },
  green: { border: 'rgba(57,255,20,0.25)',  bg: 'rgba(57,255,20,0.04)',  tag: 'rgba(57,255,20,0.12)',  tagText: '#39ff14' },
  amber: { border: 'rgba(255,184,0,0.25)',  bg: 'rgba(255,184,0,0.04)',  tag: 'rgba(255,184,0,0.12)',  tagText: '#ffb800' },
  pink:  { border: 'rgba(255,45,120,0.25)', bg: 'rgba(255,45,120,0.04)', tag: 'rgba(255,45,120,0.12)', tagText: '#ff2d78' },
}

export default function SolutionCard({ sol, index }) {
  const c = colorMap[sol.color]
  const isEven = index % 2 === 0

  return (
    <div className={`flex flex-col lg:flex-row gap-8 items-start ${!isEven ? 'lg:flex-row-reverse' : ''}`}>

      {/* Main card */}
      <div className="flex-1 rounded-2xl p-8 border transition-all hover:scale-[1.01]"
        style={{ background: c.bg, borderColor: c.border }}>

        <div className="flex items-start gap-4 mb-6">
          <span className="text-4xl">{sol.icon}</span>
          <div>
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full mb-2 inline-block"
              style={{ background: c.tag, color: c.tagText }}>
              {sol.tag}
            </span>
            <h3 className="font-display text-2xl font-bold text-white">{sol.title}</h3>
            <p className="text-sm mt-1" style={{ color: c.tagText }}>{sol.subtitle}</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="border border-red-500/20 rounded-xl p-4 bg-red-500/5">
            <p className="text-xs text-red-400 font-mono uppercase tracking-wider mb-1">Problem</p>
            <p className="text-sm text-zinc-300">{sol.problem}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: c.tag }}>
            <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: c.tagText }}>AI Solution</p>
            <p className="text-sm text-zinc-200">{sol.solution}</p>
          </div>
        </div>

        {/* Tech chips */}
        <div className="flex flex-wrap gap-2">
          {sol.tech.map(t => (
            <span key={t} className="text-xs font-mono px-3 py-1 rounded-full border"
              style={{ borderColor: c.border, color: c.tagText }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Metrics sidebar */}
      <div className="lg:w-64 flex flex-col gap-3">
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">Impact Metrics</p>
        {sol.metrics.map(m => (
          <div key={m.label} className="rounded-xl p-4 border"
            style={{ background: c.bg, borderColor: c.border }}>
            <p className="font-mono text-2xl font-bold mb-1" style={{ color: sol.accent }}>{m.value}</p>
            <p className="text-xs text-zinc-500">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
