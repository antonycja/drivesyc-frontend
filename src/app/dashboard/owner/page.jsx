'use client'
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/utils/authProvider';
import { useEffect, useState } from 'react';

import ApiProxy from '@/app/api/lib/proxy'

// View components
import OwnerDashboard from '@/components/pages/OwnerDashboard';
import BookingsView from '@/components/pages/BookingsView';
import CreateBookingView from '@/components/pages/CreateBookingView';
import FinanceView from '@/components/pages/FinanceView';
import AnalyticsDashboard from '@/components/pages/AnalyticsDashboard';
import TrainingGroundsView from '@/components/pages/TrainingGroundsView';
import TrailersView from '@/components/pages/TrailersView';
import VehiclesView from '@/components/pages/VehiclesView';
import StudentsView from '@/components/pages/StudentsView';
import InstructorsView from '@/components/pages/InstructorsView';
import CalendarView from '@/components/pages/CalendarView';
import SettingsView from '@/components/pages/SettingsView';
import usePolling from '@/hooks/usePolling';

// Placeholder for views that are under construction
function ComingSoonView({ title, onNavigate }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-gray-100 p-6">
                <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground max-w-sm">
                This section is under construction and will be available in a future
                update.
            </p>
            <Button onClick={() => onNavigate('dashboard')}>Back to Dashboard</Button>
        </div>
    );
}

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auth = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentView, setCurrentView] = useState('dashboard');

    // 30-second auto-refresh for school stats
    const fetchStats = async () => {
        const { data, status } = await ApiProxy.get('/api/stats');
        if (status === 200) return data;
        throw new Error(data?.message || 'Failed to fetch stats');
    };

    const {
        data: schoolStats,
        loading,
        refresh: refreshData,
    } = usePolling(fetchStats, 30000);

    // Helper functions for formatting
    const formatCurrency = (val) => {
        if (val === null || val === undefined || isNaN(val)) return 'R0';
        return `R${new Intl.NumberFormat("en-ZA").format(val)}`;
    };

    const formatNumber = (val) => {
        if (val === null || val === undefined || isNaN(val)) return '0';
        return new Intl.NumberFormat("en-ZA").format(val);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-ZA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-ZA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Initialize view from URL params or localStorage
    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam) {
            setCurrentView(viewParam);
            localStorage.setItem('currentView', viewParam);
            return;
        }

        if (typeof window !== 'undefined') {
            const hash = window.location.hash.substring(1);
            if (hash) {
                setCurrentView(hash);
                localStorage.setItem('currentView', hash);
                return;
            }

            const storedView = localStorage.getItem('currentView');
            if (storedView) {
                setCurrentView(storedView);
            }
        }
    }, [searchParams]);

    // Navigation handler with URL + localStorage persistence
    const handleNavigation = (view) => {
        setCurrentView(view);

        if (typeof window !== 'undefined') {
            localStorage.setItem('currentView', view);

            const newUrl = new URL(window.location);
            if (view !== 'dashboard') {
                newUrl.searchParams.set('view', view);
            } else {
                newUrl.searchParams.delete('view');
            }
            window.history.replaceState(null, '', newUrl.toString());
        }
    };

    // Update clock every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Auth guard
    useEffect(() => {
        if (!auth) return;
        if (auth.loading) return;
        if (auth.error || !auth.isAuthenticated || !auth.user) {
            router.replace('/auth/login');
            return;
        }
        if (auth.user.role !== 'owner' && !auth.user.is_owner) {
            router.replace('/auth/login');
        }
    }, [auth, router]);

    if (auth.loading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (auth.error || !auth.isAuthenticated || !auth.user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">
                        {auth.error ? 'Failed to load user data' : 'Authentication required'}
                    </p>
                    <Button onClick={() => router.replace('/auth/login')}>
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    const commonProps = {
        onNavigate: handleNavigation,
        formatNumber,
        formatCurrency,
    };

    const renderCurrentView = () => {
        switch (currentView) {
            // ── Bookings ──────────────────────────────────────────────────
            case 'bookings':
                return <BookingsView {...commonProps} />;
            case 'create-booking':
                return <CreateBookingView {...commonProps} />;
            case 'bookings-calendar':
                return <CalendarView {...commonProps} />;

            // ── Instructors ───────────────────────────────────────────────
            case 'instructors':
                return <InstructorsView {...commonProps} />;
            case 'create-instructor':
                return <ComingSoonView title="Add Instructor" onNavigate={handleNavigation} />;
            case 'instructor-schedules':
                return <ComingSoonView title="Instructor Schedules" onNavigate={handleNavigation} />;

            // ── Vehicles ──────────────────────────────────────────────────
            case 'vehicles':
                return <VehiclesView {...commonProps} />;
            case 'create-vehicle':
                return <VehiclesView {...commonProps} />;
            case 'vehicle-maintenance':
                return <ComingSoonView title="Vehicle Maintenance" onNavigate={handleNavigation} />;

            // ── Students ──────────────────────────────────────────────────
            case 'students':
                return <StudentsView {...commonProps} />;
            case 'student-progress':
                return <ComingSoonView title="Student Progress" onNavigate={handleNavigation} />;

            // ── Reports & Analytics ───────────────────────────────────────
            case 'reports':
            case 'analytics':
            case 'revenue-reports':
            case 'instructor-reports':
            case 'student-reports':
            case 'vehicle-reports':
                return <AnalyticsDashboard {...commonProps} />;

            // ── Finance ───────────────────────────────────────────────────
            case 'finance':
            case 'finance-payments':
                return <FinanceView {...commonProps} />;
            case 'finance-invoices':
                return <ComingSoonView title="Invoices" onNavigate={handleNavigation} />;
            case 'finance-expenses':
                return <ComingSoonView title="Expenses" onNavigate={handleNavigation} />;

            // ── Other ─────────────────────────────────────────────────────
            case 'training-grounds':
                return <TrainingGroundsView {...commonProps} />;
            case 'trailers':
                return <TrailersView {...commonProps} />;
            case 'settings':
                return <SettingsView {...commonProps} auth={auth} />;

            // ── Default ───────────────────────────────────────────────────
            case 'dashboard':
            default:
                return (
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
                );
        }
    };

    return (
        <SidebarProvider className="pt-[15vh] px-2 bg-white dark:bg-gray-900">
            <AppSidebar onNavigate={handleNavigation} currentView={currentView} />
            <SidebarInset>
                {renderCurrentView()}
            </SidebarInset>
        </SidebarProvider>
    )
}
