// src/App.jsx
import { useState, useEffect } from 'react'
import { Cpu, Menu, X } from 'lucide-react'
import Hero            from './components/Hero'
import ProblemSection  from './components/ProblemSection'
import SolutionsSection from './components/SolutionsSection'
import TechStack       from './components/TechStack'
import KioskDemo       from './components/KioskDemo'
import Footer          from './components/Footer'

const NAV = [
  { label: 'Problems',  href: '#solutions' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Tech',      href: '#solutions' },
  { label: 'Demo',      href: '#kiosk-demo' },
]

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen bg-ink-900 text-white">

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4
        ${scrolled ? 'glass border-b border-ink-border' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)' }}>
              <Cpu size={15} className="text-neon-cyan" />
            </div>
            <span className="font-display font-bold text-white">SmartKiosk<span style={{ color: '#00f5ff' }}>.ai</span></span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV.map(n => (
              <a key={n.label} href={n.href}
                className="text-sm text-zinc-400 hover:text-white transition-colors font-body">
                {n.label}
              </a>
            ))}
            <a href="#kiosk-demo"
              className="text-xs font-mono font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ background: '#00f5ff', color: '#050508' }}>
              Live Demo
            </a>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-zinc-400" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-4 p-4 rounded-xl border border-ink-border glass space-y-3">
            {NAV.map(n => (
              <a key={n.label} href={n.href} onClick={() => setOpen(false)}
                className="block text-sm text-zinc-300 py-2 border-b border-ink-border last:border-0">
                {n.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Sections */}
      <Hero />
      <ProblemSection />
      <SolutionsSection />
      <TechStack />
      <KioskDemo />
      <Footer />
    </div>
  )
}
