import { formatCentsToUsd } from '../../services/money'

interface SummaryTileProps {
  totalCents: number
}

export function SummaryTile({ totalCents }: SummaryTileProps) {
  return (
    <div className="bg-primary-500 rounded-xl p-4 text-white">
      <p className="text-sm opacity-80">Total Spent</p>
      <p className="text-3xl font-bold">{formatCentsToUsd(totalCents)}</p>
    </div>
  )
}
