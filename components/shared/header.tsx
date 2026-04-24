"use client"

import Link from "next/link"
import Image from "next/image"
import { FC, useState } from "react"
import { Menu, X, Search, User, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
<<<<<<< HEAD
import { useFavorites } from "@/lib/context/favorites-context"
=======
import { useCart } from "@/lib/context/cart-context"
import { useAuth } from "@/lib/context/auth-context"
import UserMenu from "../auth/user-menu"
>>>>>>> d785179fef0256701e4716f7cc2c24e75284244c

const navigation = [
  { name: "Shop", href: "#shop" },
  { name: "Collections", href: "#collections" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
]

const Header: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(true)
<<<<<<< HEAD
  const { favorites, openFavorites } = useFavorites()
=======
  const { cart, openCart } = useCart()
  const { user, openAuth } = useAuth()
>>>>>>> d785179fef0256701e4716f7cc2c24e75284244c

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
<<<<<<< HEAD
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
=======
          <UserMenu/>
>>>>>>> d785179fef0256701e4716f7cc2c24e75284244c
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

            <div className="pt-4 mt-4 border-t border-border">
              {user ? (
                <div className="flex items-center gap-3 py-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    openAuth("login")
                  }}
                  className="flex items-center gap-3 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <User className="h-5 w-5" />
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header