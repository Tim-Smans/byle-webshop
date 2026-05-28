"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FC, useEffect, useState } from "react"
import { getStats, saveStatistics } from "@/lib/services/stats-service"
import { useAdmin } from "@/lib/hooks/use-admin"
import { EditStatisticsDialog, Statistic } from "../dialogs/edit-statistics"
import ReferralDialog from "../dialogs/referral-dialog"

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
            <div className="relative aspect-4/5 rounded-lg overflow-hidden">
              <Image
                src="/images/about_me_image.jpg"
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
              About Lé
            </p>
            <h2 className="text-4xl text-oker sm:text-5xl font-light tracking-tight text-foreground mb-6">
              Art Born From <br />
              <span className="italic font-medium">Passion & Heart</span>
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed mb-8">
              <p>
                Lé is de maker achter Art by Lé, een intuïtieve mixed media praktijk waarin rust, textuur en gelaagdheid centraal staan.
              </p>
              <p>
                Haar werken ontstaan langzaam en organisch, vaak verspreid over meerdere dagen, waarbij vormen, kleuren en materialen zich laag voor laag ontwikkelen tot een evenwichtig geheel.
              </p>
              <p>
                Van nature voelt ze zich aangetrokken tot zachte aardetinten, subtiele metallic accenten en tactiele oppervlakken die een gevoel van verstilling oproepen. Tegelijk laat ze ruimte voor spontaniteit en intuïtie, waardoor soms onverwachte contrasten of expressieve details ontstaan.
              </p>
              <p>
                Voor Lé is creëren meer dan esthetiek alleen; het is een trage en aandachtige manier van werken die ruimte maakt voor rust, zachtheid en verbinding.
              </p>
              <p className="font-bold">
                Elk kunstwerk wordt met tijd, zorg en aandacht opgebouwd. Geen enkel stuk is hetzelfde.
              </p>
            </div>

            <div>
              <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                Wist je dat
              </p>
              <p>
                Draag je mijn kunst een warm hart toe, en ken je iemand die een uniek werk zoekt?
                Laat het me gerust weten. Ik denk graag mee over stijl, kleuren en wat mogelijk is.
              </p>
            </div>

            <ReferralDialog />
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