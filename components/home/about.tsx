"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FC, useEffect, useState } from "react"
import { getStats, saveStatistics } from "@/lib/services/stats-service"
import { useAdmin } from "@/lib/hooks/use-admin"
import { EditStatisticsDialog, Statistic } from "../dialogs/edit-statistics"

const About: FC = () => {
  const [stats, setStats] = useState<Statistic[]>([])
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const isAdmin = useAdmin();

  useEffect(() => {
    const getStatsFromDb = async () => {
      const stats = await getStats();

      if (stats) {
        setStats(stats)
      }
    }

    getStatsFromDb();
  }, [])

  const handleSaveStats = async (newStats: Statistic[]) => {
    await saveStatistics(newStats)

    var stats = await getStats()

    setStats(stats ?? [])
  }

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative aspect-3/4 rounded-lg overflow-hidden">
              <Image
                src="/images/about_me_image_newer.jpg"
                alt="Artist at work"
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary/20 rounded-lg -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/20 rounded-lg -z-10" />
          </div>

          {/* Content Side */}
          <div>
            <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
              Achter Art by Lé
            </p>
            <h2 className="text-4xl text-oker sm:text-5xl font-light tracking-tight text-foreground mb-6">
              Kunst ontstaan vanuit <br />
              <span className="italic font-medium">gevoel</span>
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed mb-8">
              <p>
                Els is de maker achter Art by Lé. Ze werkt intuïtief en bouwt haar schilderijen en sculpturen langzaam en organisch op, laag voor laag, tot kleur, textuur en gevoel samenkomen in een evenwichtig geheel.
              </p>
              <p>
                Van nature voelt ze zich aangetrokken tot zachte aardetinten, subtiele metallic accenten en tactiele oppervlakken die rust en verstilling oproepen. Tegelijk laat ze tijdens het creëren ruimte voor spontaniteit en intuïtie, waardoor elk werk op zijn eigen manier groeit en een uniek karakter krijgt.
              </p>
              <p>
                Voor Els is creëren veel meer dan esthetiek alleen. Als mama die om medische redenen thuis is, vormt kunst een waardevolle manier om rust, zachtheid en mentale ademruimte te vinden. Het creatieve proces geeft haar de ruimte om te vertragen, los te laten en volledig op te gaan in het maken.
              </p>
              <p className="italic">
                Elk kunstwerk ontstaat met tijd, zorg en aandacht. Geen enkel stuk is hetzelfde.
              </p>
            </div>

            <div className="mb-12">
              <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                Wist je dat
              </p>
              <p>
                Draag je mijn kunst een warm hart toe, en ken je iemand die een uniek werk zoekt?
                Laat het me gerust weten. Ik denk graag mee over stijl, kleuren en wat mogelijk is.
              </p>
            </div>

            {
              isAdmin ?
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-sans font-medium tracking-wide mb-12"
                  onClick={() => setIsEditOpen(true)}
                >
                  Admin: Edit Statistics
                </Button>
                : null
            }

            <EditStatisticsDialog
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              statistics={stats}
              onSave={handleSaveStats}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.id} className="text-center sm:text-left">
                  <p className="text-3xl sm:text-4xl font-light text-foreground mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm font-sans text-muted-foreground tracking-wide">
                    {stat.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About