// components/CvComponent.tsx
"use client"

import { FC } from "react"
import { Palette, Layers3, Sparkles, Shapes, Leaf, BrushCleaning, Plus, Trash2 } from "lucide-react"
import { useAdmin } from "@/lib/hooks/use-admin" 
import { useCvContent } from "@/lib/hooks/use-cv-content"
import { EditableText } from "../shared/editable-text"
import { EditableList } from "../shared/editable-list"
import { CvData } from "@/lib/types" 

const CvComponent: FC = () => {
  const isAdmin = useAdmin()
  const { data, update, saving } = useCvContent()

  if (!data) return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
    </main>
  )

  const patch = (updater: (d: CvData) => CvData) =>
    update(updater(structuredClone(data)))

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative py-32" style={isAdmin ? { marginTop: '2.5rem' } : {}}>
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="mx-auto max-w-6xl px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.35em] text-secondary font-medium mb-6">
              Artist CV
            </p>
            <h1 className="text-5xl sm:text-7xl text-oker font-light tracking-tight leading-tight mb-6">
              Art by Lé
            </h1>
            <p className="text-2xl italic text-foreground/80 font-light mb-10">
              Mixed Media Artist — Belgium
            </p>
            <div className="w-32 h-[1px] bg-secondary/40 mb-10" />
            <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-2xl">
              Een intuïtieve artistieke praktijk waarin textuur, verstilling en
              gelaagdheid samenkomen in sculpturale mixed media werken met een
              organische en tactiele uitstraling.
            </p>
          </div>
        </div>
      </section>

      {/* Artist Practice + Mediums */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Artistic Approach — statisch */}
            <div className="relative bg-muted/30 border border-border/40 rounded-[2rem] p-10">
              <div className="absolute -top-5 -left-5 w-20 h-20 bg-secondary/15 rounded-2xl" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-secondary font-medium">
                    Artist Practice
                  </p>
                  <h2 className="text-3xl text-foreground font-light">Artistic Approach</h2>
                </div>
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Intuïtieve mixed media kunst met focus op textuur,
                gelaagdheid, organische vormen en subtiele metallic afwerkingen.
              </p>
            </div>

            {/* Mediums — editeerbaar */}
            <div className="relative bg-muted/30 border border-border/40 rounded-[2rem] p-10">
              <div className="absolute -bottom-5 -right-5 w-24 h-24 bg-accent/15 rounded-2xl" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Layers3 className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-secondary font-medium">
                    Mediums
                  </p>
                  <h2 className="text-3xl text-foreground font-light">Techniques & Materials</h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <EditableList
                  items={data.mediums}
                  isAdmin={!!isAdmin}
                  onSave={v => patch(d => ({ ...d, mediums: v }))}
                  renderItem={medium => (
                    <div key={medium} className="px-4 py-2 rounded-full bg-background border border-border/50 text-muted-foreground">
                      {medium}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Themes */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-muted/20 p-10 sm:p-16">
            <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/10 blur-3xl rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-secondary font-medium">Themes</p>
                  <h2 className="text-4xl text-oker font-light">Recurring Inspirations</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <EditableList
                  items={data.themes}
                  isAdmin={!!isAdmin}
                  onSave={v => patch(d => ({ ...d, themes: v }))}
                  renderItem={theme => (
                    <div key={theme} className="group rounded-2xl border border-border/40 bg-background/70 p-6 transition-all duration-300 hover:-translate-y-1">
                      <p className="text-lg font-light text-foreground">{theme}</p>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commissions + Events + Collections */}
      <section className="pb-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Commissions — getal editeerbaar */}
            <div className="rounded-[2rem] border border-border/40 bg-muted/20 p-10">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8">
                <BrushCleaning className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-sm uppercase tracking-[0.25em] text-secondary font-medium mb-3">
                Selected Work
              </p>
              <h3 className="text-3xl font-light text-foreground mb-8">Commissions</h3>
              <div className="space-y-4 text-muted-foreground text-lg">
                <p>Commissioned artworks</p>
                <div className="pt-4 border-t border-border/40">
                  <EditableText
                    value={String(data.commissions)}
                    isAdmin={!!isAdmin}
                    onSave={v => patch(d => ({ ...d, commissions: Number(v) || d.commissions }))}
                    className="text-5xl text-oker font-light mb-2 block"
                  />
                  <p>Private commissions finished</p>
                </div>
              </div>
            </div>

            {/* Events — naam & datum editeerbaar, items toevoegen/verwijderen */}
            <div className="rounded-[2rem] border border-border/40 bg-muted/20 p-10">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8">
                <Shapes className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-sm uppercase tracking-[0.25em] text-secondary font-medium mb-3">
                Exhibitions & Markets
              </p>
              <h3 className="text-3xl font-light text-foreground mb-8">Events</h3>
              <div className="space-y-5">
                {data.events.map((event, i) => (
                  <div key={i} className="border-l border-secondary/40 pl-5 group/event relative">
                    <EditableText
                      value={event.name}
                      isAdmin={!!isAdmin}
                      onSave={v => patch(d => {
                        d.events[i].name = v
                        return d
                      })}
                      className="text-lg text-foreground block"
                    />
                    <EditableText
                      value={event.date}
                      isAdmin={!!isAdmin}
                      onSave={v => patch(d => {
                        d.events[i].date = v
                        return d
                      })}
                      className="text-muted-foreground block"
                    />
                    {isAdmin && (
                      <button
                        onClick={() => patch(d => ({
                          ...d,
                          events: d.events.filter((_, idx) => idx !== i)
                        }))}
                        className="absolute -right-2 top-0 opacity-0 group-hover/event:opacity-100 transition-opacity text-destructive hover:text-destructive/70"
                        title="Event verwijderen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Nieuw event toevoegen */}
                {isAdmin && (
                  <button
                    onClick={() => patch(d => ({
                      ...d,
                      events: [...d.events, { name: "Nieuw event", date: "Datum" }]
                    }))}
                    className="flex items-center gap-2 text-sm text-secondary border border-dashed border-secondary/40 rounded-xl px-4 py-2 hover:bg-secondary/10 transition-colors w-full mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    Event toevoegen
                  </button>
                )}
              </div>
            </div>

            {/* Collections — statisch */}
            <div className="rounded-[2rem] border border-border/40 bg-muted/20 p-10">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8">
                <Leaf className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-sm uppercase tracking-[0.25em] text-secondary font-medium mb-3">
                Collections
              </p>
              <h3 className="text-3xl font-light text-foreground mb-8">Private Ownership</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Private collections in Belgium
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default CvComponent