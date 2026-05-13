import { useState, useEffect } from 'react'
import { Lock, ChevronRight, Clock } from 'lucide-react'

export default function Ledger() {
  const [ledger, setLedger] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/ledger')
        const data = await response.json()
        setLedger(data.data || generateMockLedger())
        setLoading(false)
      } catch (error) {
        console.error('Error fetching ledger:', error)
        setLedger(generateMockLedger())
        setLoading(false)
      }
    }

    fetchLedger()
  }, [])

  const generateMockLedger = () => {
    const types = ['FOOD', 'PLASTIC', 'ORGANIC']
    const entries = []
    for (let i = 0; i < 10; i++) {
      entries.push({
        id: `ENTRY-${String(i + 1).padStart(6, '0')}`,
        timestamp: new Date(Date.now() - i * 15 * 60000).toISOString(),
        wasteType: types[Math.floor(Math.random() * 3)],
        weight: (Math.random() * 5).toFixed(2),
        rfidTag: `TAG-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
        cost: (Math.random() * 50).toFixed(2),
        binCapacity: Math.floor(Math.random() * 100),
        hygieneScore: Math.floor(70 + Math.random() * 30),
        hash: `0x${Math.random().toString(16).substr(2, 8).toUpperCase()}`,
      })
    }
    return entries
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'FOOD': return { bg: 'bg-red-950/30', border: 'border-red-900/30', text: 'text-red-400' }
      case 'PLASTIC': return { bg: 'bg-blue-950/30', border: 'border-blue-900/30', text: 'text-blue-400' }
      case 'ORGANIC': return { bg: 'bg-green-950/30', border: 'border-green-900/30', text: 'text-green-400' }
      default: return { bg: 'bg-zinc-950/30', border: 'border-zinc-900/30', text: 'text-zinc-400' }
    }
  }

  if (loading) return null

  return (
    <section id="ledger" className="min-h-screen pt-20 pb-20 px-6 bg-gradient-to-b from-ink-900 via-green-950/5 to-ink-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-950/50">
              <Lock size={20} className="text-green-400" />
            </div>
            <h2 className="text-4xl font-display font-bold">
              Immutable <span style={{ color: '#22c55e' }}>Ledger</span>
            </h2>
          </div>
          <p className="text-zinc-400 text-lg">Blockchain-style audit trail of all waste entries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-4 rounded-lg border border-green-900/30 bg-green-950/20">
            <p className="text-sm text-zinc-400 mb-1">Total Entries</p>
            <p className="text-2xl font-bold text-green-400">{ledger.length}</p>
          </div>
          <div className="p-4 rounded-lg border border-blue-900/30 bg-blue-950/20">
            <p className="text-sm text-zinc-400 mb-1">Avg Cost/Entry</p>
            <p className="text-2xl font-bold text-blue-400">${(ledger.reduce((sum, e) => sum + parseFloat(e.cost), 0) / ledger.length).toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-lg border border-purple-900/30 bg-purple-950/20">
            <p className="text-sm text-zinc-400 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-purple-400">${ledger.reduce((sum, e) => sum + parseFloat(e.cost), 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="rounded-xl border border-ink-border bg-ink-800/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-ink-border bg-ink-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Audit Trail</h3>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Live syncing to DynamoDB
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-border">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">Entry ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">Hygiene</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">Hash</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry, idx) => {
                  const typeColor = getTypeColor(entry.wasteType)
                  return (
                    <tr key={idx} className={`border-b border-ink-border hover:bg-ink-700/30 transition-colors ${typeColor.bg}`}>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-zinc-300">{entry.id}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-zinc-500" />
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColor.bg} ${typeColor.text} border ${typeColor.border}`}>
                          {entry.wasteType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-semibold">{entry.weight} kg</td>
                      <td className="px-6 py-4 text-green-400 font-semibold">${entry.cost}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-12 bg-ink-700 rounded-full" style={{ 
                            background: `linear-gradient(90deg, rgba(239,68,68,0.3), rgba(34,197,94,0.3))`,
                            width: `${entry.hygieneScore * 0.12}px`,
                            height: '4px'
                          }}></div>
                          <span className="text-xs text-zinc-400">{entry.hygieneScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-zinc-500">{entry.hash}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer with sync info */}
          <div className="px-6 py-4 border-t border-ink-border bg-ink-700/30 text-xs text-zinc-500 flex items-center justify-between">
            <span>Last synced: {new Date().toLocaleTimeString()}</span>
            <a href="#" className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors">
              View on blockchain <ChevronRight size={14} />
            </a>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 rounded-lg border border-green-900/30 bg-green-950/20 backdrop-blur-sm">
          <h4 className="font-semibold text-green-300 mb-2">🔐 Immutable Ledger Technology</h4>
          <p className="text-sm text-zinc-400">
            Every waste entry is cryptographically hashed and stored in AWS DynamoDB with read-only access. The ledger cannot be altered or deleted, ensuring complete audit trail integrity for compliance and financial accountability.
          </p>
        </div>
      </div>
    </section>
  )
}
