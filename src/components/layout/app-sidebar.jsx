"use client"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
    Plus,
    Building2,
} from "lucide-react"
import { Button } from '@/components/ui/button';

import { NavMain } from "@/components/nav-main"
import { Title } from "@/components/title"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { getNavigationData } from "@/components/layout/sideNavLinks"
import { useAuth } from "@/components/auth/utils/authProvider"

export function AppSidebar({ onNavigate, currentView, ...props }) {
    const auth = useAuth()
    const data = getNavigationData(auth?.user?.role)

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <Title portal={data.portal} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain
                    items={data.sideNav}
                    onNavigate={onNavigate}
                    currentView={currentView}
                />
            </SidebarContent>
            <SidebarFooter>
                <div className="p-4 border-t border-gray-200">
                    <Button
                        className="w-full"
                        size="sm"
                        onClick={() => onNavigate && onNavigate('create-booking')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Quick Booking
                    </Button>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}