import Link from "next/link"
import Image from "next/image"
import { FaEtsy, FaFacebook, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa"
import { FC } from "react"

const footerLinks = {
  shop: [
    { name: "Alle stukken", href: "/shop" },
    { name: "Collecties", href: "/#collections" },
  ],
  company: [
    { name: "Wie ben ik?", href: "/#about" },
    { name: "Doorverwijzen = 10%", href: "/#about" },
    { name: "Admin Login", href: "/admin/login" },
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
              <div className="relative h-12 w-12 rounded overflow-hidden">
                <Image
                  src="/images/logo.jpg"
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
                href="https://www.tiktok.com/@art.by.le"
                target="_blank" 
                className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <FaTiktok className="h-5 w-5" />
                <span className="sr-only">TikTok</span>
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
              Shop
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
              Company
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
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm font-sans text-muted-foreground">
            © 2026 By Lé Handcrafted Art. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-sans text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer