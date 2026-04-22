import Link from "next/link"
import Image from "next/image"
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa"
import { FC } from "react"

const footerLinks = {
  shop: [
    { name: "All Pieces", href: "#" },
    { name: "New Arrivals", href: "#" },
    { name: "Best Sellers", href: "#" },
    { name: "Collections", href: "#" },
  ],
  support: [
    { name: "Shipping Info", href: "#" },
    { name: "Returns", href: "#" },
    { name: "FAQ", href: "#" },
    { name: "Care Guide", href: "#" },
  ],
  company: [
    { name: "Our Story", href: "#" },
    { name: "Press", href: "#" },
    { name: "Commissions", href: "#" },
    { name: "Contact", href: "#" },
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
              Creating unique, handcrafted art pieces that bring beauty, 
              warmth, and emotion into your living spaces.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              <Link 
                href="#" 
                className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <FaInstagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link 
                href="#" 
                className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <FaFacebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link 
                href="#" 
                className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <FaTwitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
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

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-sans font-semibold tracking-wide uppercase text-foreground mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
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