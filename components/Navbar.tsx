"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    function updateCartCount() {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(cart.length);
      } catch {
        setCartCount(0);
      }
    }
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  const navItems = [
    { name: "Products", href: "/products" },
    { name: "Remedies", href: "/remedies" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-gray-900 shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/preview.png"
                alt="Papa Web2 Logo"
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <span className="text-2xl font-bold text-primary-400">
                Papa Web2
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary-400 bg-gray-800"
                    : "text-gray-300 hover:text-primary-400 hover:bg-gray-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/cart"
              className="p-2 text-gray-300 hover:text-primary-400 transition-colors relative"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-300 hover:text-primary-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-800">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-primary-400 bg-gray-800"
                      : "text-gray-300 hover:text-primary-400 hover:bg-gray-800"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
