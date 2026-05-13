// src/data/pitch.js

export const PROBLEMS = [
  { id: 1, stat: '40%',  label: 'of restaurant food waste goes unmeasured' },
  { id: 2, stat: '$5K+',  label: 'monthly financial loss per restaurant' },
  { id: 3, stat: 'Zero', label: 'audit trail for compliance verification' },
  { id: 4, stat: '↑12%', label: 'waste growth without tracking' },
]

export const SOLUTIONS = [
  {
    id: 1,
    color: 'green',
    accent: '#22c55e',
    tag: 'Waste Tracking',
    title: 'RFID Waste Identification',
    subtitle: 'Automatically categorize waste types in real-time',
    icon: '📡',
    problem: 'Manual waste categorization is prone to error and takes valuable staff time.',
    solution: 'RFID sensors automatically identify waste types (FOOD, PLASTIC, ORGANIC) and log each entry instantly to the immutable ledger.',
    metrics: [
      { label: 'Detection Accuracy', value: '99.2%' },
      { label: 'Time Saved Daily',   value: '↓ 2 hrs' },
      { label: 'Error Reduction',    value: '↓ 95%' },
    ],
    tech: ['RFID Sensors', 'ESP32 Microcontroller', 'Real-time Processing'],
  },
  {
    id: 2,
    color: 'blue',
    accent: '#3b82f6',
    tag: 'Financial Audit',
    title: 'Load Cell Weight Tracking',
    subtitle: 'Measure financial loss with precision',
    icon: '⚖️',
    problem: 'Restaurant managers have no real-time data on the cost of waste they generate.',
    solution: 'Load Cells measure every gram of waste collected and calculate financial loss instantly based on restaurant margins.',
    metrics: [
      { label: 'Cost Visibility',    value: '✅ Real-time' },
      { label: 'Margin Analysis',    value: 'Per waste type' },
      { label: 'Monthly Reporting',  value: 'Automated' },
    ],
    tech: ['Load Cell Sensors', 'Weight Integration', 'Cost Calculations'],
  },
  {
    id: 3,
    color: 'purple',
    accent: '#a855f7',
    tag: 'Bin Management',
    title: 'Ultrasonic Capacity Monitoring',
    subtitle: 'Optimize sanitization and collection schedules',
    icon: '📊',
    problem: 'Manual bin checks lead to overflow waste and inefficient disposal scheduling.',
    solution: 'Ultrasonic sensors monitor bin capacity in real-time and trigger UV-C/Mist sanitization cycles at optimal thresholds.',
    metrics: [
      { label: 'Overflow Prevention', value: '100%' },
      { label: 'Hygiene Score',      value: '↑ 87%' },
      { label: 'Collection Opt.',    value: '↓ 30%' },
    ],
    tech: ['Ultrasonic Sensor', 'UV-C Control', 'Mist Dispensing'],
  },
  {
    id: 4,
    color: 'orange',
    accent: '#f59e0b',
    tag: 'Compliance',
    title: 'Immutable Ledger',
    subtitle: 'Blockchain-style audit trail for accountability',
    icon: '🔐',
    problem: 'No verifiable proof of waste handling for health inspectors and sustainability reporting.',
    solution: 'Every waste entry is cryptographically hashed and stored in AWS DynamoDB with read-only access — full compliance auditability.',
    metrics: [
      { label: 'Audit Trail',        value: '✅ Complete' },
      { label: 'Regulatory Ready',   value: 'GDPR/HIPAA' },
      { label: 'Data Integrity',     value: '100%' },
    ],
    tech: ['DynamoDB', 'AWS IoT Core', 'Cryptographic Hashing'],
  },
]

export const TECH_STACK = [
  { layer: 'Sensors',    color: '#22c55e', items: ['RFID Tags', 'Load Cells', 'Ultrasonic'] },
  { layer: 'Hardware',   color: '#3b82f6', items: ['ESP32-WROOM-32', 'UV-C LEDs', 'Mist Pump'] },
  { layer: 'Cloud',      color: '#a855f7', items: ['AWS IoT Core', 'DynamoDB', 'Lambda'] },
  { layer: 'Dashboard',  color: '#f59e0b', items: ['React Frontend', 'WebSocket Feed', 'Real-time Analytics'] },
]

export const PERSONAS = {
  manager: {
    label: 'Manager View',
    emoji: '👨‍💼',
    bg: 'from-green-900/40 to-blue-900/30',
    accent: '#22c55e',
    greeting: "Dashboard Overview 📈",
    subtext: 'Track waste and savings today.',
    badge: 'MANAGER MODE',
    items: [
      { name: 'Total Waste', price: '45.3 kg', trend: '↑12%', saving: 'Cost: $385' },
      { name: 'Food Waste', price: '28.5 kg', trend: '62%', saving: 'Highest' },
      { name: 'Hygiene Score', price: '87%', trend: '✅ Good', saving: 'Safe' },
    ],
    cta: 'View Full Ledger →',
    font: 'text-lg font-bold tracking-tight',
  },
  operator: {
    label: 'Operator Mode',
    emoji: '🔧',
    bg: 'from-blue-900/40 to-purple-900/30',
    accent: '#a855f7',
    greeting: 'System Status 🟢',
    subtext: 'Monitor sensors and alerts.',
    badge: 'DIAGNOSTIC MODE',
    items: [
      { name: 'RFID Signal',       price: '-45 dBm', trend: '✅ Active', saving: 'Connected' },
      { name: 'Load Cell',         price: '2.3 kg',  trend: '📊 Stable', saving: 'Calibrated' },
      { name: 'Next Sanitization', price: '34 min',  trend: '⏱️ Scheduled', saving: 'Ready' },
    ],
    cta: '⚙️ Advanced Settings  |  Calibrate',
    font: 'text-lg font-semibold tracking-wider',
  },
}

