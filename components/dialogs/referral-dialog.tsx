"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"

const ReferralDialog = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 mt-3 text-base font-sans font-medium tracking-wide mb-12"
                >
                    Iemand doorverwijzen
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Bedankt voor je steun 🤝
                    </DialogTitle>

                    <DialogDescription asChild>
                        <div className="text-sm leading-relaxed text-muted-foreground space-y-3 pt-2">
                            <p>
                                Als dank ontvang je{" "}
                                <span className="font-medium">10% commissie</span> wanneer jouw
                                doorverwijzing leidt tot een aankoop. De commissie wordt uitbetaald
                                zodra de koper volledig heeft betaald.
                            </p>

                            <p>
                                Neem vooraf even contact met me op, zodat ik weet dat de klant via
                                jou komt.
                            </p>

                            <p className="font-medium text-foreground">
                                Dankjewel voor je vertrouwen en steun, dat betekent echt veel voor mij.
                            </p>
                            <Button variant="outline"
                                size="lg"
                                className="px-8 py-6 text-base font-sans font-medium tracking-wide border-foreground/20 hover:bg-foreground/5"
                                asChild>
                                <Link href={'/contact'}>
                                    Contacteer mij
                                </Link>
                            </Button>
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default ReferralDialog