"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth/utils/authProvider"
import { useTestContext } from "@/context/TestContext"
import NavLinks, { NonUserLinks } from './NavLinks'
import BrandLink from "./BrandLink"
import MobileNavbar from "./MobileNavbar"
import AccountDropdown from "./AccountDropdown"

export default function Navbar({ className }) {
    const auth = useAuth()
    const { isTestActive } = useTestContext()

    const handleTestActiveClick = (e) => {
        e.preventDefault()
        alert("⚠️ Test in Progress\n\nYou cannot navigate away while taking a test. Please complete the test first.")
    }

    const defaultClasses = "fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm"
    const finalClass = className || defaultClasses

    return (
        <header className={finalClass}>
            <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-16">
                <div className="flex h-20 items-center justify-between">
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex md:items-center md:gap-8">
                        {isTestActive ? (
                            <button
                                onClick={handleTestActiveClick}
                                className="flex items-center gap-2 text-lg font-bold opacity-50 cursor-not-allowed"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                    DriveSync
                                </span>
                            </button>
                        ) : (
                            <BrandLink displayName={true} />
                        )}

                        {/* Navigation Links */}
                        <div className="flex items-center gap-6 lg:gap-8">
                            {NavLinks.map((navLinkItem, idx) => {
                                const shouldHide = !auth.isAuthenticated && navLinkItem.authRequired

                                return shouldHide ? null : isTestActive ? (
                                    <button
                                        key={`desktop-nav-${idx}`}
                                        onClick={handleTestActiveClick}
                                        className="relative text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
                                    >
                                        {navLinkItem.label}
                                    </button>
                                ) : (
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
                        <MobileNavbar isTestActive={isTestActive} />
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

                                    return shouldHide ? null : isTestActive ? (
                                        <button
                                            key={`auth-link-${idx}`}
                                            onClick={handleTestActiveClick}
                                            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed"
                                        >
                                            {navLinkItem.label}
                                        </button>
                                    ) : (
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