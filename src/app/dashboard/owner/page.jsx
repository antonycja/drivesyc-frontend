'use client'
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OwnerSidebar } from '@/components/layout/OwnerSidebar'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/utils/authProvider';
import { useEffect } from 'react';

import {
    Users,
    Calendar,
    Plus,
    Car,
    DollarSign,
    BarChart3,
    Clock,
    Settings,
    Eye,
    UserPlus,
    CalendarPlus
} from 'lucide-react';

export default function Page() {
    const router = useRouter();
    const auth = useAuth();


    useEffect(() => {
        console.log('OwnerDashboard - auth.loading:', auth.loading);
        console.log('OwnerDashboard - auth.isAuthenticated:', auth.isAuthenticated);
        console.log('OwnerDashboard - auth.user:', auth.user);
        console.log('OwnerDashboard - auth.error:', auth.error);

        // Wait for SWR to finish loading
        if (auth.loading) {
            console.log('Auth still loading...');
            return;
        }

        // If there's an error or not authenticated, redirect
        if (auth.error || !auth.isAuthenticated || !auth.user) {
            console.log('Not authenticated or error, redirecting to login');
            router.replace('/auth/login');
            return;
        }

        // Check if user is an owner
        if (auth.user.role !== 'owner' && !auth.user.is_owner) {
            console.log('User is not an owner, redirecting to login');
            router.replace('/auth/login');
            return;
        }

        console.log('All checks passed - dashboard ready');
    }, [auth.loading, auth.isAuthenticated, auth.user, auth.error, router]);

    // Show loading while SWR is fetching
    if (auth.loading) {
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
    if (auth.error || !auth.isAuthenticated || !auth.user && !isLoading) {
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

    return (
        <SidebarProvider className="pt-[15vh] px-2 bg-white dark:bg-gray-900">
            <AppSidebar />
            <SidebarInset>
                <header className="flex flex-col px-4 pb-6  md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Welcome back, {auth.user?.first_name}
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your driving school operations
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant={auth.user?.approval_status === 'approved' ? 'default' : 'secondary'}>
                            {auth.user?.approval_status.charAt(0).toUpperCase() + auth.user?.approval_status.slice(1)}
                        </Badge>
                        <Button>
                            <CalendarPlus className="h-4 w-4 mr-2" />
                            Create Booking
                        </Button>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">24</p>
                                        <p className="text-sm text-muted-foreground">Today's Lessons</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">8</p>
                                        <p className="text-sm text-muted-foreground">Active Instructors</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Car className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">12</p>
                                        <p className="text-sm text-muted-foreground">Vehicles</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <DollarSign className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">R15,420</p>
                                        <p className="text-sm text-muted-foreground">This Month</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Management Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Booking Management */}
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <span>Booking Management</span>
                                </CardTitle>
                                <CardDescription>Create and manage lesson bookings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New Booking
                                </Button>
                                <Button variant="outline" className="w-full" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View All Bookings
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Instructor Management */}
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-green-600" />
                                    <span>Instructor Management</span>
                                </CardTitle>
                                <CardDescription>Manage your driving instructors</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" size="sm">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Instructor
                                </Button>
                                <Button variant="outline" className="w-full" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Instructors
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Vehicle Management */}
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Car className="h-5 w-5 text-purple-600" />
                                    <span>Vehicle Management</span>
                                </CardTitle>
                                <CardDescription>Manage your fleet of vehicles</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Vehicle
                                </Button>
                                <Button variant="outline" className="w-full" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Fleet
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Schedule Overview */}
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                    <span>Schedule Overview</span>
                                </CardTitle>
                                <CardDescription>View and manage schedules</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" size="sm">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Today's Schedule
                                </Button>
                                <Button variant="outline" className="w-full" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Weekly View
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Reports & Analytics */}
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                    <span>Reports & Analytics</span>
                                </CardTitle>
                                <CardDescription>View business insights</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" size="sm">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Revenue Report
                                </Button>
                                <Button variant="outline" className="w-full" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    All Reports
                                </Button>
                            </CardContent>
                        </Card>

                        {/* School Settings */}
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5 text-gray-600" />
                                    <span>School Settings</span>
                                </CardTitle>
                                <CardDescription>Configure your driving school</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" size="sm">
                                    <Settings className="h-4 w-4 mr-2" />
                                    General Settings
                                </Button>
                                <Button variant="outline" className="w-full" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest updates from your driving school</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                        <div className="p-1 bg-green-100 rounded-full">
                                            <Calendar className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">New booking created</p>
                                            <p className="text-xs text-muted-foreground">John Smith booked a lesson for tomorrow at 10:00 AM</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">2 min ago</span>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                        <div className="p-1 bg-blue-100 rounded-full">
                                            <Users className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Instructor completed lesson</p>
                                            <p className="text-xs text-muted-foreground">Sarah completed lesson with Mary Johnson</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">15 min ago</span>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                                        <div className="p-1 bg-purple-100 rounded-full">
                                            <Car className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Vehicle maintenance reminder</p>
                                            <p className="text-xs text-muted-foreground">Honda Civic (ABC-123) due for service in 3 days</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">1 hour ago</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Debug Info - Remove in production */}
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardHeader>
                                <CardTitle className="text-yellow-800">Debug Info (Remove in production)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs text-yellow-700 overflow-auto">
                                    {JSON.stringify({
                                        loading: auth.loading,
                                        isAuthenticated: auth.isAuthenticated,
                                        userRole: auth.user?.role,
                                        error: auth.error
                                    }, null, 2)}
                                </pre>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => auth.mutate()}
                                    className="mt-2"
                                >
                                    Refresh User Data
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                    {/* <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" /> */}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
