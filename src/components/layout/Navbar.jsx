"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth/utils/authProvider"
import NavLinks, { NonUserLinks } from './NavLinks'
import BrandLink from "./BrandLink"
import MobileNavbar from "./MobileNavbar"
import AccountDropdown from "./AccountDropdown"

export default function Navbar({ className }) {
    const auth = useAuth()

    const defaultClasses = "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm"
    const finalClass = className || defaultClasses

    return (
        <header className={finalClass}>
            <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-16">
                <div className="flex h-20 items-center justify-between">
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex md:items-center md:gap-8">
                        <BrandLink displayName={true} />

                        {/* Navigation Links */}
                        <div className="flex items-center gap-6 lg:gap-8">
                            {NavLinks.map((navLinkItem, idx) => {
                                const shouldHide = !auth.isAuthenticated && navLinkItem.authRequired

                                return shouldHide ? null : (
                                    <Link
                                        href={navLinkItem.href}
                                        key={`desktop-nav-${idx}`}
                                        className="relative text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground focus:text-foreground focus:outline-none group"
                                    >
                                        {navLinkItem.label}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full rounded-full" />
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>

                    {/* Mobile Navigation */}
                    <div className="flex md:hidden items-center gap-4">
                        <MobileNavbar />
                        <BrandLink displayName={true} />
                    </div>

                    {/* Right Side - Auth Section */}
                    <div className="flex items-center gap-4">
                        {auth.isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                {/* User greeting with notification indicator */}
                                {auth.user?.name && (
                                    <div className="hidden sm:flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            Welcome back, <span className="font-medium text-foreground">{auth.user.name.split(' ')[0]}</span>
                                        </span>
                                        {/* Optional: Notification indicator */}
                                        <div className="relative">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <span className="sr-only">You have new notifications</span>
                                        </div>
                                    </div>
                                )}
                                <AccountDropdown />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3">
                                {NonUserLinks.map((navLinkItem, idx) => {
                                    const shouldHide = !auth.isAuthenticated && navLinkItem.authRequired
                                    const isPrimary = navLinkItem.variant === 'primary'

                                    return shouldHide ? null : (
                                        <Link
                                            href={navLinkItem.href}
                                            key={`auth-link-${idx}`}
                                            className={`
                        inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
                        ${isPrimary
                                                    ? 'bg-blue-600 text-primary-foreground hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                                    : ' bg-green-400 text-primary-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground'
                                                }
                      `}
                                        >
                                            {navLinkItem.label}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}