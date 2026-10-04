import Link from "next/link"
import Image from "next/image"
import { FaEtsy, FaFacebook, FaInstagram } from "react-icons/fa"
import { Mail, MapPin, Phone } from "lucide-react"
import { FC } from "react"
import { OrderAndDeliveryDialog, PrivacyPolicyDialog, TermsOfServiceDialog } from "../dialogs/service-dialogs"

const footerLinks = {
  shop: [
    { name: "Werken", href: "/gallery" },
    { name: "Collecties", href: "/#collections" },
  ],
  company: [
    { name: "Achter Art by Lé", href: "/#about" },
    { name: "Artist CV", href: "/cv" },
    { name: "Artist Statement", href: "/#statement" },
  ],
}

const Footer: FC = () => {
  return (
    <footer id="contact" className="bg-muted/50 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="relative h-16 w-16 rounded overflow-hidden">
                <Image
                  src="/images/iconthree.png"
                  alt="By Lé Handcrafted Art"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-xl font-medium text-foreground block">
                  Art by Lé
                </span>
                <span className="text-xs font-sans tracking-wide text-muted-foreground">
                  Handcrafted Art
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              Unieke handgemaakte creaties die warmte, sfeer en een vleugje magie brengen in jouw interieur.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              <Link 
                href="https://www.instagram.com/byle_art/"
                target="_blank" 
                className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <FaInstagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link 
                href="https://www.facebook.com/ByLe.Art"
                target="_blank" 
                className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <FaFacebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link 
                href="https://www.etsy.com/shop/ArtByLeBE"
                target="_blank" 
                className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <FaEtsy className="h-5 w-5" />
                <span className="sr-only">Etsy</span>
              </Link>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-sans font-semibold tracking-wide uppercase text-foreground mb-4">
              Mijn werk
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/* Company Links */}
          <div>
            <h3 className="text-sm font-sans font-semibold tracking-wide uppercase text-foreground mb-4">
              About
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-sans font-semibold tracking-wide uppercase text-foreground mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <ul>
                  <li>2340 Vlimmeren</li>
                  <li>België</li>
                </ul>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 shrink-0" />
                <a href="mailto:byle.art@outlook.com" className="hover:text-foreground transition-colors break-all">
                  byle.art@outlook.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1 shrink-0" />
                <a href="tel:+32491364332" className="hover:text-foreground transition-colors">
                  +32 491 364 332
                </a>
              </li>
            </ul>
            <div className="mt-6 space-y-1 text-sm font-sans text-muted-foreground">
              <p>BTW BE1043462454</p>
              <p>Ondernemingsnummer: 1043.462.454</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm font-sans text-muted-foreground">
            © 2026 By Lé Handcrafted Art. Alle rechten voorbehouden. Website created/managed by <a className="underline" href="https://portfolio.timsmans.be" target="_blank">Tim Smans</a>
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-sans text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              <PrivacyPolicyDialog triggerText="Privacy Policy"/>
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              <TermsOfServiceDialog triggerText="Terms of Service"/>
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              <OrderAndDeliveryDialog triggerText="Bestellen & levering"/>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer