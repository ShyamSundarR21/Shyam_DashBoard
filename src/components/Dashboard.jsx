import { useState, useEffect } from 'react'
import { Activity, Zap, Droplets, Wind, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const [sensorData, setSensorData] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket('ws://localhost:8080')
    
    ws.onopen = () => {
      setConnected(true)
      console.log('✅ Connected to DineWave Live Feed')
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'SENSOR_UPDATE') {
          setSensorData(data.payload)
        }
      } catch (e) {
        console.error('WebSocket parse error:', e)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnected(false)
    }
    
    ws.onclose = () => {
      setConnected(false)
      setTimeout(() => {
        console.log('Attempting reconnection...')
      }, 3000)
    }
    
    return () => ws.close()
  }, [])

  if (!sensorData) {
    return (
      <section id="dashboard" className="min-h-screen pt-20 pb-20 px-6 bg-gradient-to-b from-ink-900 via-green-950/5 to-ink-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-display font-bold mb-4">
              Real-Time <span style={{ color: '#22c55e' }}>Waste Audit</span> Dashboard
            </h1>
            <p className="text-lg text-zinc-400">Connecting to live sensor feed...</p>
            <div className="mt-8 inline-block">
              <div className="w-12 h-12 rounded-full border-4 border-green-600 border-t-transparent animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const { rfid, loadCell, ultrasonic, environment } = sensorData
  const costPerKg = 8.5 // USD
  const estimatedCost = (loadCell.weightKg * costPerKg).toFixed(2)

  return (
    <section id="dashboard" className="min-h-screen pt-20 pb-20 px-6 bg-gradient-to-b from-ink-900 via-green-950/5 to-ink-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-5xl font-display font-bold mb-4">
              Real-Time <span style={{ color: '#22c55e' }}>Waste Audit</span>
            </h1>
            <p className="text-zinc-400">Station: {sensorData.stationId} • Last update: {new Date(sensorData.timestamp).toLocaleTimeString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-zinc-400">{connected ? 'Live' : 'Offline'}</span>
          </div>
        </div>

        {/* Sensor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

          {/* RFID Waste Type */}
          <div className="p-6 rounded-xl border border-green-900/30 bg-green-950/20 backdrop-blur-sm hover:border-green-700/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-950/50">
                <Activity size={20} className="text-green-400" />
              </div>
              <span className="text-sm text-zinc-400">Waste Type</span>
            </div>
            <p className="text-3xl font-bold text-green-400 mb-2">{rfid.wasteType}</p>
            <p className="text-xs text-zinc-500">Signal: {rfid.signalStrength} dBm</p>
            <div className="mt-3 h-1 bg-green-950/50 rounded-full" style={{ width: `${(rfid.signalStrength + 80) * 1.25}%` }}></div>
          </div>

          {/* Load Cell Weight */}
          <div className="p-6 rounded-xl border border-blue-900/30 bg-blue-950/20 backdrop-blur-sm hover:border-blue-700/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-950/50">
                <Zap size={20} className="text-blue-400" />
              </div>
              <span className="text-sm text-zinc-400">Total Weight</span>
            </div>
            <p className="text-3xl font-bold text-blue-400 mb-2">{loadCell.weightKg} kg</p>
            <p className="text-xs text-zinc-500">Est. Cost: 💰 ${estimatedCost}</p>
            <div className="mt-3 text-xs text-zinc-400">{loadCell.weightGrams}g collected</div>
          </div>

          {/* Ultrasonic Bin Capacity */}
          <div className="p-6 rounded-xl border border-purple-900/30 bg-purple-950/20 backdrop-blur-sm hover:border-purple-700/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-950/50">
                <Droplets size={20} className="text-purple-400" />
              </div>
              <span className="text-sm text-zinc-400">Bin Capacity</span>
            </div>
            <p className="text-3xl font-bold text-purple-400 mb-2">{ultrasonic.binCapacityPercent}%</p>
            <p className="text-xs text-zinc-500">Status: {ultrasonic.binStatus}</p>
            <div className="mt-3 h-2 bg-purple-950/50 rounded-full" style={{ width: `${ultrasonic.binCapacityPercent}%` }}></div>
          </div>

          {/* Environment */}
          <div className="p-6 rounded-xl border border-orange-900/30 bg-orange-950/20 backdrop-blur-sm hover:border-orange-700/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-950/50">
                <Wind size={20} className="text-orange-400" />
              </div>
              <span className="text-sm text-zinc-400">Hygiene Score</span>
            </div>
            <p className="text-3xl font-bold text-orange-400 mb-2">{environment.hygieneScore}%</p>
            <p className="text-xs text-zinc-500">{environment.temperature}°C • {environment.humidity}% RH</p>
            <div className="mt-3 h-2 bg-orange-950/50 rounded-full" style={{ width: `${environment.hygieneScore}%` }}></div>
          </div>
        </div>

        {/* Alerts Section */}
        {ultrasonic.binCapacityPercent > 80 && (
          <div className="p-4 rounded-lg border border-yellow-900/50 bg-yellow-950/30 flex items-center gap-3 mb-8">
            <AlertCircle size={20} className="text-yellow-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-300">Bin Nearly Full</p>
              <p className="text-sm text-yellow-200">Waste bin is {ultrasonic.binCapacityPercent}% full. Sanitization cycle recommended.</p>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-ink-border bg-ink-800/50 backdrop-blur-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-border">
              <tr className="bg-ink-700/50">
                <th className="px-6 py-3 text-left text-zinc-400">Parameter</th>
                <th className="px-6 py-3 text-left text-zinc-400">Value</th>
                <th className="px-6 py-3 text-left text-zinc-400">Unit</th>
                <th className="px-6 py-3 text-left text-zinc-400">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ink-border hover:bg-ink-700/30">
                <td className="px-6 py-3">Waste Type Detected</td>
                <td className="px-6 py-3 text-green-400 font-semibold">{rfid.wasteType}</td>
                <td className="px-6 py-3 text-zinc-500">RFID</td>
                <td className="px-6 py-3"><span className="text-xs px-2 py-1 rounded bg-green-950/50 text-green-400">Active</span></td>
              </tr>
              <tr className="border-b border-ink-border hover:bg-ink-700/30">
                <td className="px-6 py-3">Weight Accumulation</td>
                <td className="px-6 py-3 text-blue-400 font-semibold">{loadCell.weightKg}</td>
                <td className="px-6 py-3 text-zinc-500">kg</td>
                <td className="px-6 py-3"><span className="text-xs px-2 py-1 rounded bg-blue-950/50 text-blue-400">Tracking</span></td>
              </tr>
              <tr className="border-b border-ink-border hover:bg-ink-700/30">
                <td className="px-6 py-3">Financial Loss</td>
                <td className="px-6 py-3 text-red-400 font-semibold">${estimatedCost}</td>
                <td className="px-6 py-3 text-zinc-500">USD</td>
                <td className="px-6 py-3"><span className="text-xs px-2 py-1 rounded bg-red-950/50 text-red-400">Logged</span></td>
              </tr>
              <tr className="hover:bg-ink-700/30">
                <td className="px-6 py-3">Bin Usage</td>
                <td className="px-6 py-3 text-purple-400 font-semibold">{ultrasonic.binCapacityPercent}%</td>
                <td className="px-6 py-3 text-zinc-500">%</td>
                <td className="px-6 py-3"><span className={`text-xs px-2 py-1 rounded ${ultrasonic.binCapacityPercent > 80 ? 'bg-yellow-950/50 text-yellow-400' : 'bg-green-950/50 text-green-400'}`}>{ultrasonic.binStatus}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
