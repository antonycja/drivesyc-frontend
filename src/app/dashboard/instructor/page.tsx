'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/utils/authProvider';
import InstructorPerformanceView from '@/components/pages/InstructorPerformanceView';
import BookingsView from '@/components/pages/BookingsView';

export default function InstructorDashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auth = useAuth();
    const [currentView, setCurrentView] = useState('dashboard');

    // Sync view from URL
    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam) setCurrentView(viewParam);
    }, [searchParams]);

    // Auth guard
    useEffect(() => {
        if (!auth || auth.loading) return;
        if (!auth.isAuthenticated || !auth.user) {
            router.replace('/auth/login');
            return;
        }
        if (auth.user.role !== 'instructor') {
            router.replace('/dashboard');
        }
    }, [auth, router]);

    const handleNavigation = (view: string) => {
        setCurrentView(view);
        if (typeof window !== 'undefined') {
            const newUrl = new URL(window.location.href);
            if (view !== 'dashboard') {
                newUrl.searchParams.set('view', view);
            } else {
                newUrl.searchParams.delete('view');
            }
            window.history.replaceState(null, '', newUrl.toString());
        }
    };

    if (auth.loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!auth.isAuthenticated || !auth.user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Authentication required</p>
                    <Button onClick={() => router.replace('/auth/login')}>Go to Login</Button>
                </div>
            </div>
        );
    }

    const renderCurrentView = () => {
        switch (currentView) {
            case 'bookings':
                return <BookingsView onNavigate={handleNavigation} />;
            case 'dashboard':
            default:
                return (
                    <InstructorPerformanceView
                        onNavigate={handleNavigation}
                        auth={auth}
                    />
                );
        }
    };

    return (
        <SidebarProvider className="pt-20 px-2 bg-white dark:bg-gray-900">
            <AppSidebar onNavigate={handleNavigation} currentView={currentView} />
            <SidebarInset>
                {renderCurrentView()}
            </SidebarInset>
        </SidebarProvider>
    );
}
