import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

export default function WasteSummary() {
  const [wasteData, setWasteData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWaste = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/waste')
        const data = await response.json()
        setWasteData(data.data || {
          totalWaste: 45.3,
          foodWaste: 28.5,
          plasticWaste: 10.2,
          organicWaste: 6.6,
          financialLoss: 385.05,
          trend: 'up',
          percentChange: 12.5,
          wasteByType: [
            { type: 'FOOD', count: 1245, weight: 28.5, cost: 242.25 },
            { type: 'PLASTIC', count: 423, weight: 10.2, cost: 86.7 },
            { type: 'ORGANIC', count: 189, weight: 6.6, cost: 56.1 },
          ]
        })
        setLoading(false)
      } catch (error) {
        console.error('Error fetching waste data:', error)
        // Use mock data
        setWasteData({
          totalWaste: 45.3,
          foodWaste: 28.5,
          plasticWaste: 10.2,
          organicWaste: 6.6,
          financialLoss: 385.05,
          trend: 'up',
          percentChange: 12.5,
          wasteByType: [
            { type: 'FOOD', count: 1245, weight: 28.5, cost: 242.25 },
            { type: 'PLASTIC', count: 423, weight: 10.2, cost: 86.7 },
            { type: 'ORGANIC', count: 189, weight: 6.6, cost: 56.1 },
          ]
        })
        setLoading(false)
      }
    }

    fetchWaste()
  }, [])

  if (loading) return null

  return (
    <section id="waste" className="min-h-screen pt-20 pb-20 px-6 bg-ink-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-4xl font-display font-bold mb-4">
            Waste <span style={{ color: '#22c55e' }}>Statistics</span>
          </h2>
          <p className="text-zinc-400 text-lg">Daily audit summary and waste composition breakdown</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Total Waste */}
          <div className="p-6 rounded-xl border border-blue-900/30 bg-gradient-to-br from-blue-950/40 to-blue-950/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">Total Waste</span>
              <BarChart3 size={18} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400 mb-2">{wasteData.totalWaste} kg</p>
            <p className="text-xs text-zinc-500">Today's collection</p>
          </div>

          {/* Food Waste */}
          <div className="p-6 rounded-xl border border-red-900/30 bg-gradient-to-br from-red-950/40 to-red-950/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">Food Waste</span>
              <TrendingUp size={18} className="text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-400 mb-2">{wasteData.foodWaste} kg</p>
            <p className="text-xs text-zinc-500">{((wasteData.foodWaste/wasteData.totalWaste)*100).toFixed(1)}% of total</p>
          </div>

          {/* Financial Loss */}
          <div className="p-6 rounded-xl border border-green-900/30 bg-gradient-to-br from-green-950/40 to-green-950/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">Financial Loss</span>
              <TrendingDown size={18} className="text-red-500" />
            </div>
            <p className="text-3xl font-bold text-green-400 mb-2">${wasteData.financialLoss}</p>
            <p className="text-xs text-zinc-500">Today's impact</p>
          </div>

          {/* Trend */}
          <div className="p-6 rounded-xl border border-yellow-900/30 bg-gradient-to-br from-yellow-950/40 to-yellow-950/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">Weekly Trend</span>
              <TrendingUp size={18} className="text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400 mb-2">{wasteData.percentChange}%</p>
            <p className="text-xs text-yellow-300">↑ Increase vs last week</p>
          </div>
        </div>

        {/* Waste Composition Table */}
        <div className="rounded-xl border border-ink-border bg-ink-800/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-ink-border bg-ink-700/50">
            <h3 className="text-lg font-semibold">Waste Type Breakdown</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-border">
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">Count</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">Est. Cost</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {wasteData.wasteByType.map((item, idx) => (
                <tr key={idx} className="border-b border-ink-border hover:bg-ink-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        background: item.type === 'FOOD' ? 'rgba(239,68,68,0.1)' : 
                                   item.type === 'PLASTIC' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)',
                        color: item.type === 'FOOD' ? '#ef4444' : 
                               item.type === 'PLASTIC' ? '#3b82f6' : '#22c55e',
                      }}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{item.count}</td>
                  <td className="px-6 py-4 text-zinc-300 font-semibold">{item.weight} kg</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">${item.cost.toFixed(2)}</td>
                  <td className="px-6 py-4 text-zinc-400">{((item.weight/wasteData.totalWaste)*100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
