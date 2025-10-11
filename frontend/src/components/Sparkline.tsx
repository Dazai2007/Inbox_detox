import React from 'react'

type Point = { date: string; count: number }

interface Props {
  points: Point[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
}

export default function Sparkline({ points, width = 200, height = 40, color = '#ef4444', strokeWidth = 2 }: Props) {
  const values = points?.map(p => p.count) || []
  const max = Math.max(1, ...values, 1)
  const min = Math.min(0, ...values, 0)
  const range = Math.max(1, max - min)
  const n = values.length || 1

  const xFor = (i: number) => (i / Math.max(1, n - 1)) * (width - 4) + 2
  const yFor = (v: number) => height - 2 - ((v - min) / range) * (height - 4)

  const d = values.length
    ? values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(v).toFixed(1)}`).join(' ')
    : `M 2 ${height - 2} L ${width - 2} ${height - 2}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-10">
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {/* subtle baseline */}
      <line x1={2} y1={height - 2} x2={width - 2} y2={height - 2} stroke="#e5e7eb" strokeWidth={1} />
    </svg>
  )
}
