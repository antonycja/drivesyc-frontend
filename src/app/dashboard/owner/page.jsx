'use client'
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/utils/authProvider';
import { use, useEffect, useState } from 'react';

// Import your dashboard and other view components
import OwnerDashboard from '@/components/pages/OwnerDashboard';
import BookingsView from '@/components/pages/BookingsView';
import CreateBookingView from '@/components/pages/CreateBookingView';

// Mock components for other views - replace with your actual components

const InstructorsView = ({ onNavigate, formatNumber }) => (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <h2 className="text-2xl font-bold">All Instructors</h2>
        <p className="text-muted-foreground">Instructor management will be implemented here.</p>
        <div className="text-center p-8">
            <p>This view will show all your driving instructors.</p>
            <Button className="mt-4" onClick={() => onNavigate('dashboard')}>Back to Dashboard</Button>
        </div>
    </div>
);

const StudentsView = ({ onNavigate, formatNumber }) => (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <h2 className="text-2xl font-bold">All Students</h2>
        <p className="text-muted-foreground">Student management will be implemented here.</p>
        <div className="text-center p-8">
            <p>This view will show all your students and their progress.</p>
            <Button className="mt-4" onClick={() => onNavigate('dashboard')}>Back to Dashboard</Button>
        </div>
    </div>
);

const VehiclesView = ({ onNavigate, formatNumber }) => (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <h2 className="text-2xl font-bold">Fleet Management</h2>
        <p className="text-muted-foreground">Vehicle management will be implemented here.</p>
        <div className="text-center p-8">
            <p>This view will show your vehicle fleet and maintenance schedules.</p>
            <Button className="mt-4" onClick={() => onNavigate('dashboard')}>Back to Dashboard</Button>
        </div>
    </div>
);

const ReportsView = ({ onNavigate, formatNumber, formatCurrency }) => (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="text-muted-foreground">Business reports and analytics will be implemented here.</p>
        <div className="text-center p-8">
            <p>This view will show detailed business reports and analytics.</p>
            <Button className="mt-4" onClick={() => onNavigate('dashboard')}>Back to Dashboard</Button>
        </div>
    </div>
);

const FinanceView = ({ onNavigate, formatNumber, formatCurrency }) => (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <h2 className="text-2xl font-bold">Finance Management</h2>
        <p className="text-muted-foreground">Financial management will be implemented here.</p>
        <div className="text-center p-8">
            <p>This view will show payments, invoices, and expenses.</p>
            <Button className="mt-4" onClick={() => onNavigate('dashboard')}>Back to Dashboard</Button>
        </div>
    </div>
);

const SettingsView = ({ onNavigate, auth }) => (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <h2 className="text-2xl font-bold">School Settings</h2>
        <p className="text-muted-foreground">School configuration and settings will be implemented here.</p>
        <div className="text-center p-8">
            <p>This view will show school settings and configuration options.</p>
            <Button className="mt-4" onClick={() => onNavigate('dashboard')}>Back to Dashboard</Button>
        </div>
    </div>
);

export default function Page() {
    const router = useRouter();
    const auth = useAuth();
    const [schoolStats, setSchoolStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentView, setCurrentView] = useState('dashboard'); // Track current view

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

    // Navigation handler - this will be called from sidebar
    const handleNavigation = (view) => {
        console.log('🔥 Navigation called with view:', view);
        setCurrentView(view);
        console.log('🔥 Current view set to:', view);
    };

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!auth) return;
        if (auth.loading) return;
        if (auth.error || !auth.isAuthenticated || !auth.user) {
            router.replace('/auth/login');
            return;
        }
        if (auth.user.role !== 'owner' && !auth.user.is_owner) {
            router.replace('/auth/login');
            return;
        }

        setLoading(true);
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats', { headers: { 'Content-Type': 'application/json' } });
                const data = await response.json();
                if (response.ok) {
                    setSchoolStats(data);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [auth, router]);

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/stats', { headers: { 'Content-Type': 'application/json' } });
            const data = await response.json();
            if (response.ok) {
                setSchoolStats(data);
            }
        } catch (err) {
            console.error('Error refreshing stats:', err);
        } finally {
            setLoading(false);
        }
    };

    // Show loading while fetching
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

    // Show error state
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

    // Render different views based on currentView state
    const renderCurrentView = () => {
        const commonProps = {
            onNavigate: handleNavigation,
            formatNumber,
            formatCurrency,
            useAuth: useAuth
        };

        switch (currentView) {
            case 'bookings':
                return <BookingsView {...commonProps} />;
            case 'create-booking':
                return <CreateBookingView {...commonProps} />;
            case 'instructors':
                return <InstructorsView {...commonProps} />;
            case 'students':
                return <StudentsView {...commonProps} />;
            case 'vehicles':
                return <VehiclesView {...commonProps} />;
            case 'reports':
                return <ReportsView {...commonProps} />;
            case 'finance':
                return <FinanceView {...commonProps} />;
            case 'settings':
                return <SettingsView {...commonProps} auth={auth} />;
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
            {/* Pass navigation handler to sidebar */}
            <AppSidebar onNavigate={handleNavigation} currentView={currentView} />
            <SidebarInset>
                {renderCurrentView()}
            </SidebarInset>
        </SidebarProvider>
    )
}