// src/components/Footer.jsx
import { Cpu } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-ink-border">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)' }}>
            <Cpu size={18} className="text-neon-cyan" />
          </div>
          <span className="font-display text-xl font-bold text-white">SmartKiosk AI</span>
        </div>

        <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto">
          Built with YOLOv8 · Sensor Fusion · 50-Archetype Intelligence · React + Tailwind
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-xs font-mono text-zinc-600">
          {['Revenue Recovery', 'Zero-Touch Vision', 'Persona Switching', 'Loyalty Engine'].map(t => (
            <span key={t} className="hover:text-zinc-400 transition-colors cursor-default">{t}</span>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-ink-border text-xs text-zinc-700 font-mono">
          © 2025 SmartKiosk AI Platform · Business Solution Architecture
        </div>
      </div>
    </footer>
  )
}
