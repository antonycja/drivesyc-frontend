"use client"

import Navbar from './Navbar'

export default function BaseLayout({ children, className }) {
    const mainClassName = className || "flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-gradient-to-br from-background via-background to-accent/10 p-4 md:gap-8 md:p-10"

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Navbar />
            <main className={mainClassName}>
                {children}
            </main>
        </div>
    )
}