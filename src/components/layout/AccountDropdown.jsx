"use client"

import Link from "next/link"
import {
    CircleUser,
    User,
    Settings,
    CreditCard,
    Bell,
    HelpCircle,
    LogOut,
    Shield,
    Calendar
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/utils/authProvider"
import { useRouter } from "next/navigation"

export default function AccountDropdown({ className }) {
    const auth = useAuth()
    const router = useRouter()

    const userInitials = auth.user?.name
        ? auth.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U'

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' })
            auth.logout()
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
            router.push('/api/logout')
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200"
                >
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={auth.user?.avatar} alt={auth.user?.name || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-semibold">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Open user menu</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64 p-2">
                {/* User Info Header */}
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">
                                {auth.user?.name || auth.username || "User"}
                            </p>
                            {auth.user?.role && (
                                <Badge variant="secondary" className="text-xs px-2 py-0">
                                    {auth.user.role}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                            {auth.user?.email || "user@example.com"}
                        </p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Navigation Items */}
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/bookings" className="flex items-center gap-2 cursor-pointer">
                        <Calendar className="h-4 w-4" />
                        <span>My Bookings</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/billing" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="h-4 w-4" />
                        <span>Billing & Plans</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/notifications" className="flex items-center gap-2 cursor-pointer">
                        <Bell className="h-4 w-4" />
                        <span>Notifications</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/help" className="flex items-center gap-2 cursor-pointer">
                        <HelpCircle className="h-4 w-4" />
                        <span>Help & Support</span>
                    </Link>
                </DropdownMenuItem>

                {auth.user?.role === 'admin' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-orange-600">
                                <Shield className="h-4 w-4" />
                                <span>Admin Panel</span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}