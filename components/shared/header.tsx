"use client"

import Link from "next/link"
import Image from "next/image"
import { FC, useState } from "react"
import { Menu, X, Search, User, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/lib/context/favorites-context"
import { useAdmin } from "@/lib/hooks/use-admin"
import AdminModeButton from "../admin/admin-mode-button"

const navigation = [
  { name: "Shop", href: "#shop" },
  { name: "Collections", href: "#collections" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
]

const Header: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(true)
  const { favorites, openFavorites } = useFavorites()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-15 w-15">
            <Image
              src="/images/logo.jpg"
              alt="By Lé Handcrafted Art"
              fill
              className="object-cover rounded"
            />
          </div>
          <span className="hidden text-oker sm:block text-xl font-heading tracking-wide text-foreground">
            Art by Lé
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-10">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-xl font-heading text-muted-foreground hover:text-foreground transition-colors tracking-wide"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openFavorites}
          >
            <Star className="h-5 w-5" />
            {favorites.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-sans font-medium text-accent-foreground flex items-center justify-center">
                {favorites.itemCount > 9 ? "9+" : favorites.itemCount}
              </span>
            )}
            <span className="sr-only">Cart</span>
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
          <AdminModeButton/>
        <div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="space-y-1 px-6 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header