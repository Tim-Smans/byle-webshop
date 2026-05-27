import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { FC } from "react"
import Link from "next/link"

const Hero: FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/banner_new.jpg"
          alt="Textured art background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/60 via-background/40 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center lg:px-8">
        <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-muted-foreground mb-6">
          Handcrafted with passion
        </p>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-oker mb-6 text-balance">
          <span className="font-decorative">Art</span> created from feeling <br />
          <span className="font-medium italic">to be felt in silence</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10">
          Bij mijn werken vind je handgemaakte mixed media kunstwerken, 
          opgebouwd met textielverharder en intuïtieve acrylschildertechnieken.
          Je kan eenvoudig selecteren tussen de verschillende collecties, waaronder intuïtieve schilderijen en intuïtieve sculpturen.
          Elk stuk ontstaat laag voor laag en ontwikkelt zich met tijd tot een uniek, 
          textuurrijk werk met een zachte, natuurlijke uitstraling.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-sans font-medium tracking-wide"
            asChild
          >
            <Link href={'/gallery'}>
              Ontdek mijn collectie
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-base font-sans font-medium tracking-wide border-foreground/20 hover:bg-foreground/5"
            asChild
          >
            <a href="#about">Over Lé</a>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  )
}

export default Hero