import { useState, useCallback, useMemo } from 'react'

const DEFAULTS = { speed: 50, cost: 50, sustainability: 50 }

export const SLIDER_META = {
  speed: {
    label: 'Delivery Speed',
    color: '#6366f1',
    rgb: [99, 102, 241],
    icon: 'speed',
    low: 'Slow fulfilment',
    mid: 'Standard pace',
    high: 'Express delivery',
  },
  cost: {
    label: 'Cost Efficiency',
    color: '#a855f7',
    rgb: [168, 85, 247],
    icon: 'cost',
    low: 'High spend',
    mid: 'Balanced budget',
    high: 'Lean & efficient',
  },
  sustainability: {
    label: 'Sustainability',
    color: '#10b981',
    rgb: [16, 185, 129],
    icon: 'leaf',
    low: 'High emissions',
    mid: 'Neutral footprint',
    high: 'Carbon positive',
  },
}

// ── Score formulas ────────────────────────────────────────────────────────────
// All outputs are 0-100. Verified at 50/50/50 → each returns 50.
//
//  Customer Satisfaction: speed drives happiness; cost lowers barrier to access;
//  sustainability adds brand trust.
//
//  Cost Health: high cost-efficiency and eco practices reduce operational waste;
//  high speed demands more resource spend (express logistics cost more).
//
//  Eco Score: sustainability is the primary lever; high speed means more
//  energy/fuel burn; lean cost operations tend to be more efficient.

function clamp(v) { return Math.min(100, Math.max(0, Math.round(v))) }

function deriveScores({ speed, cost, sustainability }) {
  return {
    satisfaction: clamp(speed * 0.55 + cost * 0.30 + sustainability * 0.15),
    costHealth:   clamp((100 - speed) * 0.45 + cost * 0.45 + sustainability * 0.10),
    envImpact:    clamp(sustainability * 0.60 + (100 - speed) * 0.30 + cost * 0.10),
  }
}

// ── Insight sentence ──────────────────────────────────────────────────────────
function deriveInsight(values, scores) {
  const { speed, cost, sustainability } = values
  const { satisfaction, costHealth, envImpact } = scores

  const spread = Math.max(speed, cost, sustainability) - Math.min(speed, cost, sustainability)
  if (spread < 12) {
    return 'Balanced configuration — steady performance across all metrics with no single dimension dominating.'
  }

  const sorted = [
    { key: 'speed',          val: speed },
    { key: 'cost',           val: cost },
    { key: 'sustainability', val: sustainability },
  ].sort((a, b) => b.val - a.val)

  const top    = sorted[0].key
  const bottom = sorted[2].key

  const map = {
    speed_cost: `You optimised for speed — customer satisfaction reaches ${satisfaction}, but cost health drops to ${costHealth}. Express logistics are expensive.`,
    speed_sustainability: `High-speed delivery lifts satisfaction to ${satisfaction}, but the eco score falls to ${envImpact}. Faster fulfilment means higher emissions.`,
    cost_speed: `Cost-first approach keeps operations lean at ${costHealth}, but slower fulfilment limits customer satisfaction to ${satisfaction}.`,
    cost_sustainability: `Lean operations score ${costHealth} on cost health. Sustainability is deprioritised — eco score sits at ${envImpact}.`,
    sustainability_speed: `Sustainability-first reduces environmental impact to ${envImpact}, but delivery pace keeps satisfaction at ${satisfaction}.`,
    sustainability_cost: `Eco-conscious model scores ${envImpact} on sustainability — operational cost health is moderate at ${costHealth}.`,
  }

  return map[`${top}_${bottom}`] ?? `Optimised for ${top} — review the scores below for trade-offs.`
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useSimulator() {
  const [values, setValues] = useState(DEFAULTS)

  const update = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: Number(val) }))
  }, [])

  const reset = useCallback(() => setValues(DEFAULTS), [])

  const scores = useMemo(() => deriveScores(values), [values])

  const insight = useMemo(() => deriveInsight(values, scores), [values, scores])

  // Overall score: weighted average
  const score = useMemo(
    () => Math.round((values.speed + values.cost + values.sustainability) / 3),
    [values],
  )

  const dominant = useMemo(
    () => Object.entries(values).reduce((a, b) => (a[1] > b[1] ? a : b))[0],
    [values],
  )

  const ambientRgb = useMemo(() => {
    const total = values.speed + values.cost + values.sustainability || 1
    return ['speed', 'cost', 'sustainability'].reduce(
      (acc, key) => {
        const w = values[key] / total
        const [r, g, b] = SLIDER_META[key].rgb
        return [acc[0] + r * w, acc[1] + g * w, acc[2] + b * w]
      },
      [0, 0, 0],
    ).map(Math.round)
  }, [values])

  return { values, update, reset, score, dominant, ambientRgb, scores, insight }
}
