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
import EditBookingView from '@/components/pages/EditBookingView';
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

// Views that are lazy-mounted: only rendered after the user first visits them.
// This avoids mounting heavy or rarely-used components on initial page load.
const LAZY_VIEWS = new Set([
    'training-grounds',
    'trailers',
    'settings',
    'create-instructor',
    'instructor-schedules',
    'vehicle-maintenance',
    'student-progress',
    'finance-invoices',
    'finance-expenses',
    'edit-booking',
]);

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const auth = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentView, setCurrentView] = useState('dashboard');

    // navParams carries extra context when navigating programmatically,
    // e.g. { bookingId: 42 } when jumping to edit-booking.
    const [navParams, setNavParams] = useState({});

    // Tracks which lazy views have been visited at least once so they stay
    // mounted (and thus keep their state) after the first visit.
    const [visitedViews, setVisitedViews] = useState(new Set(['dashboard']));

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
            setVisitedViews(prev => new Set([...prev, viewParam]));
            localStorage.setItem('currentView', viewParam);
            return;
        }

        if (typeof window !== 'undefined') {
            const hash = window.location.hash.substring(1);
            if (hash) {
                setCurrentView(hash);
                setVisitedViews(prev => new Set([...prev, hash]));
                localStorage.setItem('currentView', hash);
                return;
            }

            const storedView = localStorage.getItem('currentView');
            if (storedView) {
                setCurrentView(storedView);
                setVisitedViews(prev => new Set([...prev, storedView]));
            }
        }
    }, [searchParams]);

    /**
     * Central navigation handler.
     * @param {string} view - The view key to navigate to.
     * @param {Object} params - Optional extra params (e.g. { bookingId } for edit-booking).
     */
    const handleNavigation = (view, params = {}) => {
        setCurrentView(view);
        setNavParams(params);
        setVisitedViews(prev => new Set([...prev, view]));

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

    // Returns '' (visible) when this is the active view, 'hidden' otherwise.
    const show = (view) => (currentView === view ? '' : 'hidden');

    // Returns true when a view should be rendered into the DOM.
    // Lazy views are only mounted after the user has visited them once.
    const shouldMount = (view) => !LAZY_VIEWS.has(view) || visitedViews.has(view);

    return (
        <SidebarProvider className="pt-20 px-2 bg-white dark:bg-gray-900">
            <AppSidebar onNavigate={handleNavigation} currentView={currentView} />
            <SidebarInset>

                {/* ── Always-mounted views ──────────────────────────────────── */}

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

                {/* Bookings list */}
                <div className={show('bookings')}>
                    <BookingsView {...commonProps} />
                </div>

                {/* Create booking */}
                <div className={show('create-booking')}>
                    <CreateBookingView {...commonProps} />
                </div>

                {/* Edit booking — lazy, carries bookingId via navParams */}
                {shouldMount('edit-booking') && (
                    <div className={show('edit-booking')}>
                        <EditBookingView
                            bookingId={navParams.bookingId || null}
                            onNavigate={handleNavigation}
                        />
                    </div>
                )}

                {/* Calendar */}
                <div className={show('bookings-calendar')}>
                    <CalendarView {...commonProps} />
                </div>

                {/* Instructors */}
                <div className={show('instructors')}>
                    <InstructorsView {...commonProps} />
                </div>

                {/* Vehicles — create-vehicle reuses VehiclesView (matches old behaviour) */}
                <div className={show('vehicles')}>
                    <VehiclesView {...commonProps} />
                </div>
                <div className={show('create-vehicle')}>
                    <VehiclesView {...commonProps} />
                </div>

                {/* Students */}
                <div className={show('students')}>
                    <StudentsView {...commonProps} />
                </div>

                {/* Reports / Analytics — multiple nav keys map to the same component */}
                {['reports', 'analytics', 'revenue-reports', 'instructor-reports', 'student-reports', 'vehicle-reports'].map((view) => (
                    <div key={view} className={show(view)}>
                        <AnalyticsDashboard {...commonProps} />
                    </div>
                ))}

                {/* Finance */}
                <div className={show('finance')}>
                    <FinanceView {...commonProps} />
                </div>
                <div className={show('finance-payments')}>
                    <FinanceView {...commonProps} />
                </div>

                {/* ── Lazy-mounted views ────────────────────────────────────── */}

                {shouldMount('training-grounds') && (
                    <div className={show('training-grounds')}>
                        <TrainingGroundsView {...commonProps} />
                    </div>
                )}

                {shouldMount('trailers') && (
                    <div className={show('trailers')}>
                        <TrailersView {...commonProps} />
                    </div>
                )}

                {shouldMount('settings') && (
                    <div className={show('settings')}>
                        <SettingsView {...commonProps} auth={auth} />
                    </div>
                )}

                {/* Coming-soon lazy views */}
                {shouldMount('create-instructor') && (
                    <div className={show('create-instructor')}>
                        <ComingSoonView title="Add Instructor" onNavigate={handleNavigation} />
                    </div>
                )}

                {shouldMount('instructor-schedules') && (
                    <div className={show('instructor-schedules')}>
                        <ComingSoonView title="Instructor Schedules" onNavigate={handleNavigation} />
                    </div>
                )}

                {shouldMount('vehicle-maintenance') && (
                    <div className={show('vehicle-maintenance')}>
                        <ComingSoonView title="Vehicle Maintenance" onNavigate={handleNavigation} />
                    </div>
                )}

                {shouldMount('student-progress') && (
                    <div className={show('student-progress')}>
                        <ComingSoonView title="Student Progress" onNavigate={handleNavigation} />
                    </div>
                )}

                {shouldMount('finance-invoices') && (
                    <div className={show('finance-invoices')}>
                        <ComingSoonView title="Invoices" onNavigate={handleNavigation} />
                    </div>
                )}

                {shouldMount('finance-expenses') && (
                    <div className={show('finance-expenses')}>
                        <ComingSoonView title="Expenses" onNavigate={handleNavigation} />
                    </div>
                )}

            </SidebarInset>
        </SidebarProvider>
    )
}
