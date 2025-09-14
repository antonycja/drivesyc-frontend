'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth/utils/authProvider"
export default function AuthButton() {
    // Make this async since getToken might be async
    const auth = useAuth()
    const isLoggedIn = auth.isAuthenticated;

    if (isLoggedIn) {
        return (
            <Link href="/auth/logout">
                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
            </Link>
        );
    }

    return (<>
        <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 cursor-pointer">
                <LogIn className="h-4 w-4 mr-2" />
                Login
            </Button>
        </Link>
        <Link href="/auth/register">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
            </Button>
        </Link>

    </>
    );
}