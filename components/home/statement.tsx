import { FC } from "react";


const Statement: FC = () => {

    return (
        <>
            <section id="statement" className="py-24 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-20 left-10 w-56 h-56 bg-secondary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

                <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                            Artist Statement
                        </p>

                        <h2 className="text-4xl sm:text-5xl text-oker font-light tracking-tight mb-6">
                            Creating Through <br />
                            <span className="italic font-medium">Intuition & Stillness</span>
                        </h2>

                        <div className="w-24 h-[1px] bg-secondary/40 mx-auto" />
                    </div>

                    <div className="relative">
                        {/* Card */}
                        <div className="relative bg-muted/40 backdrop-blur-sm border border-border/40 rounded-[2rem] p-8 sm:p-12 lg:p-16 shadow-sm">
                            {/* Decorative Corners */}
                            <div className="absolute top-0 left-0 w-24 h-24 border-t border-l border-secondary/20 rounded-tl-[2rem]" />
                            <div className="absolute bottom-0 right-0 w-24 h-24 border-b border-r border-secondary/20 rounded-br-[2rem]" />

                            <div className="space-y-8 text-lg leading-relaxed text-muted-foreground">
                                <p>
                                    My work begins with intuition, a sense of stillness, and the gradual building of layers. By allowing materials to evolve layer by layer, I create sculptural and mixed media works in which texture, light, and form are constantly in dialogue.
                                </p>

                                <p>
                                    Alongside my sculptural work with textile hardener, I create paintings that range from richly textured surfaces to fluid pouring techniques. Some pieces remain purely painterly, while others evolve spontaneously into mixed media works. I feel equally drawn to the sculptural and painterly process, allowing both worlds to naturally complement and influence one another within my practice.
                                </p>

                                <p>
                                    My palette often combines soft, earthy tones with subtle metallic accents, creating a balance between vulnerability and strength, simplicity and refinement. The creative process itself is an essential part of my work: each piece develops slowly and organically, without a fully predetermined outcome.
                                </p>

                                <p>
                                    Through my art, I hope to create a sense of calm and stillness within the rhythm of everyday life. My work invites the viewer to slow down, look closer, and feel, rather than immediately understand.
                                </p>
                            </div>

                            {/* Quote Accent */}
                            <div className="mt-12 pt-8 border-t border-border/40">
                                <p className="text-xl sm:text-2xl italic text-foreground font-light leading-relaxed max-w-3xl">
                                    “Art can speak softly and still be deeply felt.”
                                </p>
                            </div>
                        </div>

                        {/* Floating Decorative Blocks */}
                        <div className="hidden lg:block absolute -top-6 -right-6 w-32 h-32 bg-secondary/15 rounded-2xl -z-10" />
                        <div className="hidden lg:block absolute -bottom-6 -left-6 w-40 h-40 bg-accent/15 rounded-2xl -z-10" />
                    </div>
                </div>
            </section>
        </>
    )
}

export default Statement