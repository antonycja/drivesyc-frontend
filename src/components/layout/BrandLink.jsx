"use client"

import Link from "next/link"
import { Car } from "lucide-react"

export default function BrandLink({ displayName, className }) {
    const finalClass = className || "flex items-center gap-2 text-lg font-bold transition-colors hover:text-primary"

    return (
        <Link href="/" className={finalClass}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            {displayName && (
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    DriveSync
                </span>
            )}
            {!displayName && <span className="sr-only">DriveSync</span>}
        </Link>
    )
}