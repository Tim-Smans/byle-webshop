"use client"

import { useState } from "react"
import type { MollieBucket } from "@/lib/mollie/dashboard-data"
import { formatPrice } from "@/lib/utils"

// Received amount per day or month. One series, so one hue (the site's oker),
// thin bars with a 2px gap, rounded data-end, a recessive grid and a tooltip
// per bar. Empty buckets stay on the axis so time reads honestly.

const BAR_COLOR = "#ac4e16"
const CHART_HEIGHT = 180

function niceMax(value: number): number {
  if (value <= 0) return 100
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const steps = [1, 2, 2.5, 5, 10]
  const step = steps.find((s) => s * magnitude >= value) ?? 10
  return step * magnitude
}

export default function RevenueChart({ buckets, unit }: { buckets: MollieBucket[]; unit: "day" | "month" }) {
  const [active, setActive] = useState<number | null>(null)
  const max = niceMax(Math.max(...buckets.map((b) => b.paid), 0))
  const gridValues = [0, max / 2, max]
  // Show at most ~8 axis labels
  const labelEvery = Math.max(1, Math.ceil(buckets.length / 8))
  const total = buckets.reduce((sum, b) => sum + b.paid, 0)

  return (
    <figure className="m-0">
      <div className="flex gap-3">
        {/* Y axis labels */}
        <div className="relative w-14 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums" style={{ height: CHART_HEIGHT }}>
          {gridValues.map((value) => (
            <span key={value} className="absolute right-0 -translate-y-1/2" style={{ top: CHART_HEIGHT - (value / max) * CHART_HEIGHT }}>
              {formatPrice(value)}
            </span>
          ))}
        </div>

        <div className="relative flex-1 min-w-0" style={{ height: CHART_HEIGHT }}>
          {/* Grid */}
          {gridValues.map((value) => (
            <div
              key={value}
              aria-hidden
              className={`absolute inset-x-0 border-t ${value === 0 ? "border-border" : "border-dashed border-border/60"}`}
              style={{ top: CHART_HEIGHT - (value / max) * CHART_HEIGHT }}
            />
          ))}

          {/* Bars: the whole column is the hover target */}
          <div className="absolute inset-0 flex items-end gap-[2px]" onMouseLeave={() => setActive(null)}>
            {buckets.map((bucket, index) => (
              <button
                key={bucket.key}
                type="button"
                className="relative h-full flex-1 min-w-0 flex items-end focus:outline-none"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                aria-label={`${bucket.label}: ${formatPrice(bucket.paid)}, ${bucket.count} betaling${bucket.count === 1 ? "" : "en"}`}
              >
                <span
                  className="block w-full rounded-t-[4px] transition-opacity"
                  style={{
                    height: bucket.paid > 0 ? Math.max(2, (bucket.paid / max) * CHART_HEIGHT) : 0,
                    backgroundColor: BAR_COLOR,
                    opacity: active === null || active === index ? 1 : 0.45,
                  }}
                />
              </button>
            ))}
          </div>

          {/* Tooltip */}
          {active !== null && (
            <div
              role="status"
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-background px-3 py-2 text-xs shadow-sm whitespace-nowrap"
              style={{ left: `${((active + 0.5) / buckets.length) * 100}%` }}
            >
              <p className="font-medium text-foreground">{buckets[active].label}</p>
              <p className="tabular-nums">{formatPrice(buckets[active].paid)}</p>
              <p className="text-muted-foreground">
                {buckets[active].count} betaling{buckets[active].count === 1 ? "" : "en"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* X axis */}
      <div className="flex gap-3 mt-1">
        <div className="w-14 shrink-0" />
        <div className="flex-1 min-w-0 flex gap-[2px] text-[11px] text-muted-foreground">
          {buckets.map((bucket, index) => (
            <span key={bucket.key} className="flex-1 min-w-0 text-center whitespace-nowrap overflow-visible">
              {index % labelEvery === 0 ? bucket.label : ""}
            </span>
          ))}
        </div>
      </div>

      <figcaption className="sr-only">
        Ontvangen bedrag per {unit === "day" ? "dag" : "maand"}, in totaal {formatPrice(total)}.
      </figcaption>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Toon als tabel</summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="py-1 pr-4 font-semibold">{unit === "day" ? "Dag" : "Maand"}</th>
                <th className="py-1 pr-4 font-semibold text-right">Betalingen</th>
                <th className="py-1 font-semibold text-right">Ontvangen</th>
              </tr>
            </thead>
            <tbody>
              {buckets.filter((b) => b.count > 0).map((bucket) => (
                <tr key={bucket.key} className="border-t border-border">
                  <td className="py-1 pr-4">{bucket.label}</td>
                  <td className="py-1 pr-4 text-right tabular-nums">{bucket.count}</td>
                  <td className="py-1 text-right tabular-nums">{formatPrice(bucket.paid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
