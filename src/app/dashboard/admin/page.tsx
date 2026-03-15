'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/utils/authProvider';
import ApiProxy from '@/app/api/lib/proxy';

import OwnerDashboard from '@/components/pages/OwnerDashboard';
import BookingsView from '@/components/pages/BookingsView';
import CreateBookingView from '@/components/pages/CreateBookingView';
import AnalyticsDashboard from '@/components/pages/AnalyticsDashboard';
import FinanceView from '@/components/pages/FinanceView';

// Views only mounted after first visit (lazy)
const LAZY_VIEWS = new Set(['edit-booking']);

export default function AdminDashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auth = useAuth();

    const [schoolStats, setSchoolStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [navParams, setNavParams] = useState<Record<string, any>>({});
    const [visitedViews, setVisitedViews] = useState(new Set<string>(['dashboard']));

    const formatCurrency = (val: number) => {
        if (val === null || val === undefined || isNaN(val)) return 'R0';
        return `R${new Intl.NumberFormat('en-ZA').format(val)}`;
    };

    const formatNumber = (val: number) => {
        if (val === null || val === undefined || isNaN(val)) return '0';
        return new Intl.NumberFormat('en-ZA').format(val);
    };

    const formatTime = (date: Date) =>
        date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });

    const formatDate = (date: Date) =>
        date.toLocaleDateString('en-ZA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    // Restore view from URL or localStorage
    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam) {
            setCurrentView(viewParam);
            setVisitedViews(prev => new Set([...prev, viewParam]));
            return;
        }
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.substring(1);
            if (hash) {
                setCurrentView(hash);
                setVisitedViews(prev => new Set([...prev, hash]));
                return;
            }
            const stored = localStorage.getItem('adminCurrentView');
            if (stored) {
                setCurrentView(stored);
                setVisitedViews(prev => new Set([...prev, stored]));
            }
        }
    }, [searchParams]);

    const handleNavigation = (view: string, params: Record<string, any> = {}) => {
        setCurrentView(view);
        setNavParams(params);
        setVisitedViews(prev => new Set([...prev, view]));
        if (typeof window !== 'undefined') {
            localStorage.setItem('adminCurrentView', view);
            const newUrl = new URL(window.location.href);
            if (view !== 'dashboard') {
                newUrl.searchParams.set('view', view);
            } else {
                newUrl.searchParams.delete('view');
            }
            window.history.replaceState(null, '', newUrl.toString());
        }
    };

    // Clock
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    // Auth guard + stats fetch
    useEffect(() => {
        if (!auth || auth.loading) return;
        if (!auth.isAuthenticated || !auth.user) {
            router.replace('/auth/login');
            return;
        }
        if (auth.user.role !== 'admin' && !auth.user.is_admin) {
            router.replace('/auth/login');
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            try {
                const { data, status } = await ApiProxy.get('/api/stats');
                if (status === 200) setSchoolStats(data);
            } catch {
                // Non-fatal — dashboard still renders without stats
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [auth, router]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const { data, status } = await ApiProxy.get('/api/stats');
            if (status === 200) setSchoolStats(data);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    if (auth.loading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading dashboard...</p>
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

    const commonProps = { onNavigate: handleNavigation, formatNumber, formatCurrency };

    const show = (view: string) => (currentView === view ? '' : 'hidden');
    const shouldMount = (view: string) => !LAZY_VIEWS.has(view) || visitedViews.has(view);

    return (
        <SidebarProvider className="pt-[15vh] px-2 bg-white dark:bg-gray-900">
            <AppSidebar onNavigate={handleNavigation} currentView={currentView} />
            <SidebarInset className="overflow-auto">

                {/* Dashboard */}
                <div className={show('dashboard')}>
                    <OwnerDashboard
                        schoolStats={schoolStats}
                        loading={loading}
                        auth={auth}
                        currentTime={currentTime}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        formatCurrency={formatCurrency}
                        formatNumber={formatNumber}
                        refreshData={refreshData}
                        onNavigate={handleNavigation}
                    />
                </div>

                {/* Bookings */}
                <div className={show('bookings')}>
                    <BookingsView {...commonProps} />
                </div>

                {/* Create booking */}
                <div className={show('create-booking')}>
                    <CreateBookingView {...commonProps} />
                </div>

                {/* Edit booking — lazy */}
                {shouldMount('edit-booking') && (
                    <div className={show('edit-booking')}>
                        <CreateBookingView {...commonProps} bookingId={navParams.bookingId || null} />
                    </div>
                )}

                {/* Reports / Analytics */}
                {(['reports', 'analytics'] as const).map((view) => (
                    <div key={view} className={show(view)}>
                        <AnalyticsDashboard {...commonProps} />
                    </div>
                ))}

                {/* Finance */}
                <div className={show('finance')}>
                    <FinanceView {...commonProps} />
                </div>

            </SidebarInset>
        </SidebarProvider>
    );
}
