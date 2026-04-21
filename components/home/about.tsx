import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FC } from "react"

const stats = [
  { value: "20+", label: "Original Pieces" },
  { value: "5", label: "Months Experience" },
  { value: "2", label: "Satisfied Customers" },
  { value: "100%", label: "Handcrafted" },
]

const About: FC = () => {
     return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative aspect-4/5 rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=1000&fit=crop"
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
              My Story
            </p>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-6">
              Art Born From <br />
              <span className="italic font-medium">Passion & Heart</span>
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed mb-8">
              <p>
                By Lé Handcrafted Art began in a small studio filled with the scent of 
                oil paints and the quiet rhythm of creation. Every piece we create is 
                an invitation to pause, feel, and connect.
              </p>
              <p>
                We believe that art should evoke emotion, tell stories, and transform 
                the spaces it inhabits. Each brushstroke is intentional, each texture 
                meaningful—crafted with the same care I&apos;d give to a piece destined 
                for our own walls.
              </p>
            </div>

            <Button 
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-sans font-medium tracking-wide mb-12"
            >
              Learn More About Me
            </Button>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="text-3xl sm:text-4xl font-light text-foreground mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm font-sans text-muted-foreground tracking-wide">
                    {stat.label}
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