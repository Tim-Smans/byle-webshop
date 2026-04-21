"use client"

import { FC, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check } from "lucide-react"
import { ReactFormState } from "react-dom/client"

 const NewsLetter: FC = () => {
    const [email, setEmail] = useState<string>("")
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if(email) {
            setIsSubscribed(true)
            setEmail("")
        }
    }

     return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-primary-foreground/70 mb-4">
          Stay Connected
        </p>
        <h2 className="text-4xl sm:text-5xl font-light tracking-tight mb-6">
          Join Our <span className="italic font-medium">Art Community</span>
        </h2>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
          Be the first to know about new pieces, exclusive collections, and special events. 
          We share insights into our creative process and behind-the-scenes moments.
        </p>

        {isSubscribed ? (
          <div className="flex items-center justify-center gap-3 text-lg">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Check className="h-5 w-5 text-secondary-foreground" />
            </div>
            <span>Thank you for subscribing!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-12 font-sans"
            />
            <Button 
              type="submit"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 px-6 font-sans font-medium tracking-wide"
            >
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}

        <p className="text-sm text-primary-foreground/60 mt-6 font-sans">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
 }

 export default NewsLetter