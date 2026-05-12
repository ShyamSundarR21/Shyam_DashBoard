// src/data/pitch.js

export const PROBLEMS = [
  { id: 1, stat: '35%',  label: 'Revenue lost to expired inventory annually' },
  { id: 2, stat: '68%',  label: 'Customers abandon slow self-checkouts' },
  { id: 3, stat: '1-size', label: 'Fits-all UI alienates every demographic' },
  { id: 4, stat: '↓22%', label: 'Footfall drop when checkout experience fails' },
]

export const SOLUTIONS = [
  {
    id: 1,
    color: 'cyan',
    accent: '#00f5ff',
    tag: 'Revenue Engine',
    title: 'Strategic Margin Extraction',
    subtitle: 'Smart coupons that stop waste before it starts',
    icon: '💰',
    problem: 'Dumb coupons give discounts to people who would buy anyway — pure profit erosion.',
    solution: 'Predictive Association Engine scans near-expiry inventory and pushes flash-coupons to the exact shopper archetype most likely to convert.',
    metrics: [
      { label: 'Expiry Loss Recovery', value: '↑ 100%' },
      { label: 'Avg. Order Value',     value: '↑ 3×' },
      { label: 'Waste Reduction',      value: '↓ 60%' },
    ],
    tech: ['50 Archetype Model', 'Inventory API', 'Thermal Printer Output'],
  },
  {
    id: 2,
    color: 'green',
    accent: '#39ff14',
    tag: 'Frictionless UX',
    title: 'Zero-Touch Vision',
    subtitle: 'YOLOv8 identifies produce instantly — no lookups',
    icon: '👁️',
    problem: 'Manual produce lookups and barcode failures create queue friction that kills return visits.',
    solution: 'YOLOv8 computer vision identifies fruits, vegetables, and loose items the moment they touch the scale — no customer input required.',
    metrics: [
      { label: 'Time-to-Checkout',   value: '↓ 40%' },
      { label: 'Error Rate',         value: '↓ 95%' },
      { label: 'Customer Retention', value: '↑ 28%' },
    ],
    tech: ['YOLOv8 Model', 'Weight Sensor Fusion', 'Camera Array'],
  },
  {
    id: 3,
    color: 'amber',
    accent: '#ffb800',
    tag: 'Age Targeting',
    title: 'Dynamic Persona Switching',
    subtitle: 'One machine. Every generation. Zero compromise.',
    icon: '🎭',
    problem: 'A single static UI loses Gen Z (too boring) and Seniors (too complex) simultaneously.',
    solution: 'Demographic-Adaptive UI detects user archetype and instantly re-skins the experience — speed & TikTok recipes for Gen Z, high-contrast voice-guided simplicity for Seniors.',
    metrics: [
      { label: 'Gen Z Engagement',    value: '↑ 52%' },
      { label: 'Senior Satisfaction', value: '↑ 71%' },
      { label: 'Repeat Usage',        value: '↑ 44%' },
    ],
    tech: ['Face Age Estimation', 'UI Theme Engine', 'Voice Assistant'],
  },
  {
    id: 4,
    color: 'pink',
    accent: '#ff2d78',
    tag: 'Customer Magnet',
    title: 'The Magnet Effect',
    subtitle: 'Turns checkout into a loyalty machine',
    icon: '🧲',
    problem: 'Checkout is a cost center. Every transaction ends with zero loyalty signal.',
    solution: 'The Smart Hub concept transforms checkout into a discovery & retention engine — Golden Ticket coupons drive return visits, Recipe Bundling increases basket size, and trust built by error-free AI keeps customers coming back.',
    metrics: [
      { label: 'Return Visit Rate', value: '↑ 38%' },
      { label: 'Basket Size',       value: '↑ 2.4×' },
      { label: 'NPS Score',         value: '+67' },
    ],
    tech: ['Golden Ticket System', 'Recipe Bundling AI', 'Trust Score Engine'],
  },
]

export const TECH_STACK = [
  { layer: 'Input',      color: '#00f5ff', items: ['Camera Array', 'Weight Scale', 'Sensor Fusion'] },
  { layer: 'Processing', color: '#39ff14', items: ['YOLOv8 Vision', '50 Archetype Logic', 'Demographic AI'] },
  { layer: 'Output',     color: '#ffb800', items: ['15" Smart Mirror', 'Adaptive UI', 'LED Ring Feedback'] },
  { layer: 'Reward',     color: '#ff2d78', items: ['Thermal Printer', 'Golden Ticket', 'Social Coupons'] },
]

export const PERSONAS = {
  genz: {
    label: 'Gen Z Mode',
    emoji: '⚡',
    bg: 'from-purple-900/40 to-pink-900/30',
    accent: '#ff2d78',
    greeting: "What's good? 🔥",
    subtext: 'Your vibe, your cart.',
    badge: 'TRENDING TODAY',
    items: [
      { name: 'Matcha Latte Kit', price: '$8.99', trend: '🔥 TikTok', saving: 'Save $2' },
      { name: 'Acai Bowl Bundle',  price: '$12.49', trend: '📱 Viral', saving: 'Save $3' },
      { name: 'Protein Snack Pack', price: '$6.99', trend: '💪 Hot Pick', saving: 'Save $1.50' },
    ],
    cta: 'Share & Unlock Deal →',
    font: 'text-lg font-bold tracking-tight',
  },
  senior: {
    label: 'Senior Mode',
    emoji: '🌿',
    bg: 'from-blue-900/40 to-teal-900/30',
    accent: '#00f5ff',
    greeting: 'Welcome back!',
    subtext: 'Here to help with your shopping.',
    badge: 'BUDGET FRIENDLY',
    items: [
      { name: 'Whole Milk (2L)',   price: '$3.49', trend: '✅ Best Value', saving: 'Save $0.80' },
      { name: 'Multigrain Bread',  price: '$2.99', trend: '❤️ Top Pick',  saving: 'Save $0.60' },
      { name: 'Family Veg Bundle', price: '$9.99', trend: '🥗 Healthy',   saving: 'Save $2.50' },
    ],
    cta: '🔊 Read aloud  |  Large text ✓',
    font: 'text-2xl font-semibold tracking-wide',
  },
}
