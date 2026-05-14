'use client'

import { ArrowRight, Check, Mail, MapPin } from "lucide-react";
import { FC, useState } from "react";
import { FaInstagram } from "react-icons/fa"
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

const ContactComponent: FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        try {
            const form = e.currentTarget;
            const formData = new FormData(form);

            const data = {
                name: formData.get("name"),
                email: formData.get("email"),
                subject: subject,
                message: formData.get("message"),
            };

            const res = await fetch("/api/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Failed to send");
            }

            setSubmitted(true);
            form.reset();
            setSubject("");

        } catch (error) {
            console.error(error);
            alert("Er ging iets mis bij het verzenden.");
        }

        setLoading(false);
    }

    return (
        <>
            <section className="relative overflow-hidden h-56 flex items-center justify-center">
                <div className="relative text-center">
                    <p className="tracking-[0.3em] text-xs uppercase mb-3">
                        Get in touch!
                    </p>
                    <h1 className="text-5xl md:text-6xl mt-20">
                        Contact
                    </h1>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-[1fr_1.6fr] gap-16 mt-2">

                {/* LEFT SIDE */}

                <aside className="space-y-10">
                    <div>
                        <h2 className="text-2xl mb-4">
                            Heb je een vraag?
                        </h2>
                        <p className="leading-relaxed text-sm">
                            Heb je een vraag, spreekt een werk je aan of droom je van een creatie op maat? Neem gerust contact op, samen bekijken we de mogelijkheden.
                        </p>
                    </div>

                    <div className="space-y-5 text-sm">

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <Mail size={14} />
                            </div>
                            <div>
                                <p className="font-medium">
                                    E-mail
                                </p>
                                <a href="mailto:byle.art@outlook.com">
                                    byle.art@outlook.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <MapPin size={14} />
                            </div>
                            <div>
                                <p className="font-medium">
                                    Studio
                                </p>
                                <span>Belgium</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <FaInstagram size={14} />
                            </div>
                            <div>
                                <p className="font-medium">
                                    Instagram
                                </p>
                                <a
                                    href="https://instagram.com/byle_art"
                                    target="_blank"
                                >
                                    @byle_art
                                </a>
                            </div>
                        </div>

                    </div>

                    <blockquote className="border-l-2 pl-5 italic text-sm">
                        "Art is not what you see, but what you make others see"
                        <br/>
                        - Edgar Degas
                    </blockquote>

                    <p className="text-xs">
                        Ik reageer doorgaans binnen 1–2 werkdagen.
                    </p>

                </aside>

                {/* FORM */}

                <div className="backdrop-blur-sm rounded-2xl border p-8 md:p-10 shadow-sm">

                    {submitted ? (

                        <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-5">

                            <div className="w-16 h-16 flex items-center justify-center">
                                <Check size={28} />
                            </div>

                            <h3 className="text-2xl">
                                Bericht verzonden!
                            </h3>

                            <p className="text-sm max-w-xs">
                                Bedankt voor je berichtje. Ik neem zo snel mogelijk contact met je op.
                            </p>

                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-xs underline"
                            >
                                Nog een bericht sturen
                            </button>

                        </div>

                    ) : (

                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid sm:grid-cols-2 gap-5">

                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Naam
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="Jouw naam"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        E-mailadres
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="you@email.com"
                                    />
                                </div>

                            </div>

                            <div className="space-y-2">

                                <Label htmlFor="subject">
                                    Onderwerp
                                </Label>

                                <Select
                                    value={subject}
                                    onValueChange={setSubject}
                                >
                                    <SelectTrigger id="subject">
                                        <SelectValue placeholder="Kies een onderwerp" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="order">
                                            Vraag over een bestelling
                                        </SelectItem>
                                        <SelectItem value="artwork">
                                            Vraag over een kunstwerk
                                        </SelectItem>
                                        <SelectItem value="commission">
                                            Doorverwijzen / Origineel werk
                                        </SelectItem>
                                        <SelectItem value="collaboration">
                                            Samenwerking
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Iets anders
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>

                            <div className="space-y-2">

                                <Label htmlFor="message">
                                    Bericht
                                </Label>

                                <Textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={5}
                                    placeholder="Vertel me meer..."
                                />

                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? "Versturen…"
                                    : <>
                                        Bericht versturen
                                        <ArrowRight size={16} />
                                    </>
                                }
                            </Button>

                            <p className="text-center text-xs">
                                Je gegevens worden nooit gedeeld met derden.
                            </p>

                        </form>

                    )}

                </div>

            </section>
        </>
    )
}

export default ContactComponent