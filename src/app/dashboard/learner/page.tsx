'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/utils/authProvider';
import LearnerProgressView from '@/components/pages/LearnerProgressView';

export default function LearnerDashboardPage() {
    const router = useRouter();
    const auth = useAuth();

    // Auth guard
    useEffect(() => {
        if (!auth || auth.loading) return;
        if (!auth.isAuthenticated || !auth.user) {
            router.replace('/auth/login');
            return;
        }
        if (auth.user.role !== 'learner') {
            // Redirect other roles to their correct dashboard
            router.replace('/dashboard');
        }
    }, [auth, router]);

    const handleNavigation = (view: string) => {
        // Learner dashboard is a single-view page; "back to dashboard" reloads this view
        if (view === 'dashboard') return;
        router.push(`/dashboard/learner?view=${view}`);
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

    return (
        <SidebarProvider className="pt-[15vh] px-2 bg-white dark:bg-gray-900">
            <AppSidebar onNavigate={handleNavigation} currentView="dashboard" />
            <SidebarInset>
                <LearnerProgressView onNavigate={handleNavigation} auth={auth} />
            </SidebarInset>
        </SidebarProvider>
    );
}
