import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FC } from "react"

const stats = [
  { value: "20+", label: "Original Pieces" },
  { value: "5", label: "Months Experience" },
  { value: "3", label: "Satisfied Customers" },
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
                src="/Images/about_me_image.jpg"
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
            <h2 className="text-4xl text-oker sm:text-5xl font-light tracking-tight text-foreground mb-6">
              Art Born From <br />
              <span className="italic font-medium">Passion & Heart</span>
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed mb-8">
              <p>
                Hi I’m Lé
                The creator behind Art by Lé. I work intuitively, letting shapes, colors, and textures guide me. 
                My pieces often evolve slowly over several days, layer by layer, until they feel balanced and complete.
                Creating is more than making art for me, it’s a moment of calm,
                 a way to gently disconnect from daily life. As a stay-at-home mom, 
                 living with chronic pain, these creative moments are deeply meaningful and help me reconnect with both peace and inner strength.
              </p>
              <p>
                I’m naturally drawn to soft, earthy tones with subtle metallic accents. But sometimes, 
                I simply follow my feeling and allow something more expressive or unexpected to emerge, and that spontaneity is part of what makes each piece unique.
                Every artwork is made with time, care, and attention. No two pieces are ever the same.
                Thank you for visiting my small creative world
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