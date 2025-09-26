'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import {
    Users,
    Calendar,
    Plus,
    Car,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertTriangle,
    UserPlus,
    CalendarPlus,
    Star,
    Target,
    CheckCircle,
    BarChart3,
    Bell,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Home,
    GraduationCap
} from 'lucide-react';

export default function OwnerDashboard({ 
    schoolStats, 
    loading, 
    auth, 
    currentTime, 
    formatDate, 
    formatTime, 
    formatCurrency, 
    formatNumber,
    refreshData,
    onNavigate 
}) {
    // Calculate completion rate for progress indicators
    const getCompletionRate = () => {
        if (!schoolStats?.total_bookings || !schoolStats?.completed_bookings) return 0;
        return Math.round((schoolStats.completed_bookings / schoolStats.total_bookings) * 100);
    };

    // Get revenue growth indicator
    const getRevenueGrowth = () => {
        if (!schoolStats) return { trend: 'neutral', percentage: 0, color: 'text-gray-500' };
        const thisMonth = schoolStats.revenue_this_month || 0;
        const last30Days = schoolStats.revenue_last_30_days || 0;
        const growth = last30Days > 0 ? ((thisMonth - last30Days) / last30Days) * 100 : 0;

        return {
            trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'neutral',
            percentage: Math.abs(Math.round(growth)),
            color: growth > 0 ? 'text-green-500' : growth < 0 ? 'text-red-500' : 'text-gray-500'
        };
    };

    // Calculate instructor utilization
    const getInstructorUtilization = () => {
        if (!schoolStats?.total_instructors || !schoolStats?.active_instructors) return 0;
        return Math.round((schoolStats.active_instructors / schoolStats.total_instructors) * 100);
    };

    // Get business health score
    const getBusinessHealthScore = () => {
        if (!schoolStats) return 0;
        let score = 0;

        // Completion rate (30%)
        if (getCompletionRate() >= 80) score += 30;
        else if (getCompletionRate() >= 60) score += 20;
        else score += 10;

        // Revenue health (25%)
        const outstanding = schoolStats.outstanding_payments || 0;
        const monthly = schoolStats.revenue_this_month || 0;
        if (outstanding < monthly * 0.1) score += 25;
        else if (outstanding < monthly * 0.2) score += 15;
        else score += 5;

        // Instructor utilization (20%)
        const utilization = getInstructorUtilization();
        if (utilization >= 80) score += 20;
        else if (utilization >= 60) score += 15;
        else score += 10;

        // Customer satisfaction (15%)
        if (schoolStats.rating >= 4.5) score += 15;
        else if (schoolStats.rating >= 4.0) score += 10;
        else if (schoolStats.rating >= 3.5) score += 5;
        else if (!schoolStats.rating) score += 15;

        // Active bookings (10%)
        if (schoolStats.upcoming_lessons_week >= 10) score += 10;
        else if (schoolStats.upcoming_lessons_week >= 5) score += 5;

        return Math.min(score, 100);
    };

    const healthScore = getBusinessHealthScore();
    const revenueGrowth = getRevenueGrowth();

    return (
        <>
            <header className="flex flex-col px-4 pb-6 md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">
                        Welcome back, {auth.user?.first_name}
                    </h1>
                    <p className="text-muted-foreground">
                        {formatDate(currentTime)} • {formatTime(currentTime)}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={healthScore >= 80 ? 'default' : healthScore >= 60 ? 'secondary' : 'destructive'}>
                            Business Health: {healthScore}%
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={refreshData} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </Button>
                    <Button onClick={() => onNavigate && onNavigate('create-booking')}>
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        New Booking
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
                {/* Key Performance Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Today's Lessons</p>
                                    <p className="text-3xl font-bold">
                                        {formatNumber(schoolStats?.upcoming_lessons_today || 0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatNumber(schoolStats?.lessons_this_week || 0)} upcoming lessons
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                                    <p className="text-3xl font-bold">
                                        {formatCurrency(schoolStats?.revenue_this_month)}
                                    </p>
                                    <div className="flex items-center space-x-1">
                                        {revenueGrowth.trend === 'up' ? (
                                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                                        ) : revenueGrowth.trend === 'down' ? (
                                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                                        ) : null}
                                        <p className={`text-xs ${revenueGrowth.color}`}>
                                            {revenueGrowth.percentage > 0 ? `${revenueGrowth.percentage}%` : 'No change'}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Instructor Utilization</p>
                                    <p className="text-3xl font-bold">{getInstructorUtilization()}%</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatNumber(schoolStats?.active_instructors)} of {formatNumber(schoolStats?.total_instructors)} active
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                                    <p className="text-3xl font-bold">{getCompletionRate()}%</p>
                                    <Progress value={getCompletionRate()} className="mt-2" />
                                </div>
                                <div className="p-3 bg-emerald-100 rounded-full">
                                    <Target className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts & Status Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Outstanding Payments Alert */}
                    <Card className={schoolStats?.outstanding_payments > 0 ? "border-red-200 bg-red-50" : ""}>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${schoolStats?.outstanding_payments > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                                    {schoolStats?.outstanding_payments > 0 ? (
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">Payments</p>
                                    <p className="text-3xl font-bold">
                                        {formatCurrency(schoolStats?.outstanding_payments || 0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {schoolStats?.outstanding_payments > 0 ? 'Outstanding' : 'All paid up'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* This Week Overview */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">This Week</p>
                                    <p className="text-3xl font-bold">
                                        {formatNumber(schoolStats?.upcoming_lessons_week || 0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Lessons scheduled</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Satisfaction */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-100 rounded-full">
                                    <Star className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Rating</p>
                                    <p className="text-3xl font-bold">
                                        {schoolStats?.rating ? `${schoolStats.rating}/5` : 'No ratings yet'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {schoolStats?.total_reviews > 0
                                            ? `${formatNumber(schoolStats.total_reviews)} reviews`
                                            : 'Start collecting reviews'
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Learners */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-100 rounded-full">
                                    <Activity className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Learners</p>
                                    <p className="text-3xl font-bold">
                                        {formatNumber(schoolStats?.active_learners || 0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        of {formatNumber(schoolStats?.total_learners || 0)} total
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions & Navigation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Manage your driving school efficiently</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <Button className="h-20 flex flex-col space-y-2" variant="outline" onClick={() => onNavigate && onNavigate('bookings')}>
                                    <CalendarPlus className="h-6 w-6" />
                                    <span>New Booking</span>
                                </Button>
                                <Button className="h-20 flex flex-col space-y-2" variant="outline" onClick={() => onNavigate && onNavigate('instructors')}>
                                    <Users className="h-6 w-6" />
                                    <span>Manage Staff</span>
                                </Button>
                                <Button className="h-20 flex flex-col space-y-2" variant="outline" onClick={() => onNavigate && onNavigate('students')}>
                                    <GraduationCap className="h-6 w-6" />
                                    <span>View Students</span>
                                </Button>
                                <Button className="h-20 flex flex-col space-y-2" variant="outline" onClick={() => onNavigate && onNavigate('reports')}>
                                    <BarChart3 className="h-6 w-6" />
                                    <span>Reports</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>School Information</CardTitle>
                            <CardDescription>Your driving school details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                                    <p className="text-2xl font-bold">{formatNumber(schoolStats?.total_learners || 0)}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                                    <p className="text-2xl font-bold">{formatNumber(schoolStats?.total_bookings || 0)}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">Total Lessons</p>
                                    <p className="text-2xl font-bold">{formatNumber(schoolStats?.total_lessons || 0)}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Business Health</span>
                                    <Badge variant={healthScore >= 80 ? 'default' : healthScore >= 60 ? 'secondary' : 'destructive'}>
                                        {healthScore}%
                                    </Badge>
                                </div>
                                <Progress value={healthScore} className="mt-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Based on completion rate, payments, and customer satisfaction
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Business Intelligence Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5" />
                                <span>Revenue Insights</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm font-medium text-green-800">Total Revenue</p>
                                    <p className="text-xl font-bold text-green-900">
                                        {formatCurrency(schoolStats?.total_revenue)}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800">Avg per Booking</p>
                                    <p className="text-xl font-bold text-blue-900">
                                        {formatCurrency(schoolStats?.avg_revenue_per_booking)}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-800">Avg per Lesson</p>
                                    <p className="text-xl font-bold text-blue-900">
                                        {formatCurrency(schoolStats?.avg_revenue_per_lesson)}
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Revenue Growth</span>
                                    <div className="flex items-center space-x-1">
                                        {revenueGrowth.trend === 'up' ? (
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                        ) : revenueGrowth.trend === 'down' ? (
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                        ) : (
                                            <Activity className="h-4 w-4 text-gray-500" />
                                        )}
                                        <span className={`text-sm font-bold ${revenueGrowth.color}`}>
                                            {revenueGrowth.percentage > 0 ? `${revenueGrowth.percentage}%` : 'Stable'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5" />
                                <span>Today's Priorities</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {schoolStats?.upcoming_lessons_today > 0 ? (
                                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="font-medium">Lessons Today</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatNumber(schoolStats.upcoming_lessons_today)} scheduled lessons
                                        </p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => onNavigate && onNavigate('bookings')}>View</Button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-600">No lessons today</p>
                                        <p className="text-sm text-muted-foreground">Perfect time for planning</p>
                                    </div>
                                </div>
                            )}

                            {schoolStats?.outstanding_payments > 0 && (
                                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <div className="flex-1">
                                        <p className="font-medium text-red-800">Payment Follow-ups</p>
                                        <p className="text-sm text-red-600">
                                            {formatCurrency(schoolStats.outstanding_payments)} to collect
                                        </p>
                                    </div>
                                    <Button size="sm" variant="outline">Contact</Button>
                                </div>
                            )}

                            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                <Users className="h-5 w-5 text-green-600" />
                                <div className="flex-1">
                                    <p className="font-medium text-green-800">Team Status</p>
                                    <p className="text-sm text-green-600">
                                        {formatNumber(schoolStats?.active_instructors)} instructors available
                                    </p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => onNavigate && onNavigate('instructors')}>Manage</Button>
                            </div>

                            {!schoolStats?.rating && (
                                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                                    <Star className="h-5 w-5 text-yellow-600" />
                                    <div className="flex-1">
                                        <p className="font-medium text-yellow-800">Collect Reviews</p>
                                        <p className="text-sm text-yellow-600">Start gathering customer feedback</p>
                                    </div>
                                    <Button size="sm" variant="outline">Setup</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}