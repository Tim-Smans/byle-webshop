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
                                    Mijn werk vertrekt vanuit intuïtie, vertraging en gelaagdheid. Door materialen laag per laag op te bouwen, ontstaan sculpturale en mixed media werken waarin textuur, licht en vorm voortdurend met elkaar in dialoog staan.
                                </p>

                                <p>
                                    Naast mijn werk met textielverharder creëer ik ook schilderijen die variëren van rijke structuren tot pouring-technieken, en soms spontaan verder groeien naar mixed media werken. Ik voel me zowel aangetrokken tot het sculpturale als tot het schilderende proces, waardoor beide werelden elkaar blijven aanvullen binnen mijn praktijk.
                                </p>

                                <p>
                                    Ik combineer zachte aardse kleuren met subtiele metallic nuances, waardoor een spanningsveld ontstaat tussen kwetsbaarheid en kracht, soberheid en verfijning. Het maakproces speelt hierin een centrale rol: elk werk groeit langzaam en organisch, zonder volledig vooraf bepaald eindbeeld.

                                </p>
                                <p>
                                    Met mijn werk wil ik een gevoel van rust en verstilling oproepen in de drukte van het dagelijkse leven. Mijn werken nodigen uit tot vertragen, kijken en voelen, eerder dan onmiddellijk begrijpen.
                                </p>
                            </div>

                            {/* Quote Accent */}
                            <div className="mt-12 pt-8 border-t border-border/40">
                                <p className="text-xl sm:text-2xl italic text-foreground font-light leading-relaxed max-w-3xl">
                                    “Kunst hoeft niet luid te zijn om aanwezig te voelen.”
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