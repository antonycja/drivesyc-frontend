"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/utils/authProvider"
import { useTestContext } from "@/context/TestContext"

import NavLinks, { NonUserLinks } from './NavLinks'
import BrandLink from "./BrandLink"

export default function MobileNavbar({ className, isTestActive }) {
    const auth = useAuth()
    const contextTest = useTestContext()
    const testActive = isTestActive || contextTest?.isTestActive

    const handleTestActiveClick = (e) => {
        e.preventDefault()
        alert("⚠️ Test in Progress\n\nYou cannot navigate away while taking a test. Please complete the test first.")
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 md:hidden hover:bg-accent"
                    disabled={testActive}
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-72">
                <nav className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between py-2 mx-3">
                        {testActive ? (
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
                            <BrandLink displayName={true} className="flex items-center gap-2 text-lg font-bold" />
                        )}
                    </div>

                    {/* User Info (if authenticated) */}
                    {auth.isAuthenticated && (
                        <>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {auth.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{auth.user?.name || "auth.username"}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground">{auth.user?.email || "user@email.com"}</p>
                                        {auth.user?.role && (
                                            <Badge variant="outline" className="text-xs px-1 py-0">
                                                {auth.user.role}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Separator className="mb-4" />
                        </>
                    )}

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-2 flex-1">
                        {NavLinks.map((navLinkItem, idx) => {
                            const shouldHide = !auth.isAuthenticated && navLinkItem.authRequired

                            return shouldHide ? null : testActive ? (
                                <button
                                    key={`mobile-nav-${idx}`}
                                    onClick={handleTestActiveClick}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
                                >
                                    <span>{navLinkItem.label}</span>
                                </button>
                            ) : (
                                <SheetClose asChild key={`mobile-nav-${idx}`}>
                                    <Link
                                        href={navLinkItem.href}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                    >
                                        <span>{navLinkItem.label}</span>
                                    </Link>
                                </SheetClose>
                            )
                        })}
                    </div>

                    <Separator className="my-4" />

                    {/* Auth Section */}
                    <div className="mt-auto space-y-2">
                        {auth.isAuthenticated ? (
                            <SheetClose asChild>
                                <Link
                                    href="/auth/logout"
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <span>Sign Out</span>
                                </Link>
                            </SheetClose>
                        ) : (
                            <>
                                {NonUserLinks.map((navLinkItem, idx) => {
                                    const isSignUp = navLinkItem.variant === 'primary'

                                    return testActive ? (
                                        <button
                                            key={`mobile-auth-${idx}`}
                                            onClick={handleTestActiveClick}
                                            className={`flex items-center justify-center gap-3 px-2 py-1 rounded-lg text-nowrap text-sm font-small opacity-50 cursor-not-allowed`}
                                        >
                                            <span className="">{navLinkItem.label}</span>
                                        </button>
                                    ) : (
                                        <SheetClose asChild key={`mobile-auth-${idx}`}>
                                            <Link
                                                href={navLinkItem.href}
                                                className={`flex items-center justify-center gap-3 px-2 py-1 rounded-lg text-nowrap text-sm font-small transition-colors ${isSignUp
                                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                                    }`}
                                            >
                                                <span className="">{navLinkItem.label}</span>
                                            </Link>
                                        </SheetClose>
                                    )
                                })}
                            </>
                        )}
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    )
}