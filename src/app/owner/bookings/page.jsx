'use client'
import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/utils/authProvider';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import ApiProxy from '@/app/api/lib/proxy'

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
  Eye,
  UserPlus,
  CalendarPlus,
  Star,
  Target,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  BarChart3,
  FileText,
  Settings,
  Bell,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Home,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  GraduationCap
} from 'lucide-react';

// Mock data for demonstration - replace with your API calls
const mockBookings = [
  { id: 1, student: "John Smith", instructor: "Sarah Wilson", date: "2024-01-15", time: "10:00", status: "confirmed", lesson: "Highway Driving", amount: "R450" },
  { id: 2, student: "Emma Johnson", instructor: "Mike Brown", date: "2024-01-15", time: "14:00", status: "completed", lesson: "Parallel Parking", amount: "R400" },
  { id: 3, student: "David Lee", instructor: "Sarah Wilson", date: "2024-01-16", time: "09:00", status: "pending", lesson: "Basic Control", amount: "R350" },
  { id: 4, student: "Lisa Chen", instructor: "Tom Davis", date: "2024-01-16", time: "11:30", status: "confirmed", lesson: "City Driving", amount: "R400" },
  { id: 5, student: "Robert Taylor", instructor: "Mike Brown", date: "2024-01-17", time: "15:00", status: "cancelled", lesson: "Night Driving", amount: "R500" },
];

const mockInstructors = [
  { id: 1, name: "Sarah Wilson", email: "sarah@school.com", phone: "+27 82 123 4567", status: "active", lessons: 245, rating: 4.8, joined: "2023-01-15" },
  { id: 2, name: "Mike Brown", email: "mike@school.com", phone: "+27 83 234 5678", status: "active", lessons: 189, rating: 4.6, joined: "2023-03-20" },
  { id: 3, name: "Tom Davis", email: "tom@school.com", phone: "+27 84 345 6789", status: "inactive", lessons: 156, rating: 4.5, joined: "2023-02-10" },
  { id: 4, name: "Jane Cooper", email: "jane@school.com", phone: "+27 85 456 7890", status: "active", lessons: 203, rating: 4.9, joined: "2023-04-05" },
];

const mockStudents = [
  { id: 1, name: "John Smith", email: "john@email.com", phone: "+27 81 111 1111", instructor: "Sarah Wilson", lessonsCompleted: 12, totalLessons: 20, progress: 60, status: "active" },
  { id: 2, name: "Emma Johnson", email: "emma@email.com", phone: "+27 81 222 2222", instructor: "Mike Brown", lessonsCompleted: 8, totalLessons: 15, progress: 53, status: "active" },
  { id: 3, name: "David Lee", email: "david@email.com", phone: "+27 81 333 3333", instructor: "Sarah Wilson", lessonsCompleted: 5, totalLessons: 12, progress: 42, status: "active" },
  { id: 4, name: "Lisa Chen", email: "lisa@email.com", phone: "+27 81 444 4444", instructor: "Tom Davis", lessonsCompleted: 18, totalLessons: 20, progress: 90, status: "ready_for_test" },
];

// Dashboard Home View
const DashboardView = ({ schoolStats, formatCurrency, formatNumber, getCompletionRate, getRevenueGrowth, getInstructorUtilization, getBusinessHealthScore, refreshData, loading, auth, currentTime, formatDate, formatTime }) => {
  const healthScore = getBusinessHealthScore();
  const revenueGrowth = getRevenueGrowth();

  return (
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col space-y-2" variant="outline">
              <CalendarPlus className="h-6 w-6" />
              <span>New Booking</span>
            </Button>
            <Button className="h-20 flex flex-col space-y-2" variant="outline">
              <Users className="h-6 w-6" />
              <span>Add Instructor</span>
            </Button>
            <Button className="h-20 flex flex-col space-y-2" variant="outline">
              <GraduationCap className="h-6 w-6" />
              <span>Add Student</span>
            </Button>
            <Button className="h-20 flex flex-col space-y-2" variant="outline">
              <BarChart3 className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center p-8 text-muted-foreground">
        <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Use the sidebar to navigate to different sections of your driving school management system.</p>
      </div>
    </div>
  );
};

// Bookings List View
const BookingsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      confirmed: 'default',
      completed: 'secondary',
      pending: 'outline',
      cancelled: 'destructive'
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">All Bookings</h2>
          <p className="text-muted-foreground">Manage all driving lesson bookings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-input rounded-md bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredBookings.length} of {mockBookings.length} bookings
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Student</th>
                  <th className="text-left p-4 font-medium">Instructor</th>
                  <th className="text-left p-4 font-medium">Date & Time</th>
                  <th className="text-left p-4 font-medium">Lesson Type</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-medium">{booking.student}</div>
                    </td>
                    <td className="p-4">{booking.instructor}</td>
                    <td className="p-4">
                      <div>{booking.date}</div>
                      <div className="text-sm text-muted-foreground">{booking.time}</div>
                    </td>
                    <td className="p-4">{booking.lesson}</td>
                    <td className="p-4 font-medium">{booking.amount}</td>
                    <td className="p-4">
                      <Badge variant={getStatusBadge(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Instructors List View
const InstructorsView = ({ formatNumber }) => {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">All Instructors</h2>
          <p className="text-muted-foreground">Manage your driving instructor team</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Instructor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockInstructors.map((instructor) => (
          <Card key={instructor.id}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{instructor.name}</h3>
                  <p className="text-sm text-muted-foreground">{instructor.email}</p>
                </div>
                <Badge variant={instructor.status === 'active' ? 'default' : 'secondary'}>
                  {instructor.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Lessons:</span>
                  <span className="font-medium">{formatNumber(instructor.lessons)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rating:</span>
                  <span className="font-medium flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                    {instructor.rating}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phone:</span>
                  <span className="font-medium">{instructor.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Joined:</span>
                  <span className="font-medium">{instructor.joined}</span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Students List View
const StudentsView = ({ formatNumber }) => {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">All Students</h2>
          <p className="text-muted-foreground">Manage your driving school students</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStudents.map((student) => (
          <Card key={student.id}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
                <Badge variant={student.status === 'ready_for_test' ? 'default' : 'secondary'}>
                  {student.status === 'ready_for_test' ? 'Ready for Test' : 'Active'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Instructor:</span>
                  <span className="font-medium">{student.instructor}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Progress:</span>
                  <span className="font-medium">{student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Lessons:</span>
                  <span className="font-medium">{student.lessonsCompleted}/{student.totalLessons}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phone:</span>
                  <span className="font-medium">{student.phone}</span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
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

  // Navigation handler - this will be called from sidebar
  const handleNavigation = (view) => {
    setCurrentView(view);
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
        const { data, status } = await ApiProxy.get('/api/stats', true);
        if (status === 200) {
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
      const { data, status } = await ApiProxy.get('/api/stats', true);
      if (status === 200) {
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

  const healthScore = getBusinessHealthScore();

  // Render different views based on currentView state
  const renderCurrentView = () => {
    switch (currentView) {
      case 'bookings':
        return <BookingsView />;
      case 'instructors':
        return <InstructorsView formatNumber={formatNumber} />;
      case 'students':
        return <StudentsView formatNumber={formatNumber} />;
      case 'dashboard':
      default:
        return (
          <DashboardView
            schoolStats={schoolStats}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            getCompletionRate={getCompletionRate}
            getRevenueGrowth={getRevenueGrowth}
            getInstructorUtilization={getInstructorUtilization}
            getBusinessHealthScore={getBusinessHealthScore}
            refreshData={refreshData}
            loading={loading}
            auth={auth}
            currentTime={currentTime}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        );
    }
  };

  return (
    <SidebarProvider className="pt-[15vh] px-2 bg-white dark:bg-gray-900">
      {/* Pass navigation handler to sidebar */}
      <AppSidebar onNavigate={handleNavigation} currentView={currentView} />
      <SidebarInset>
        <header className="flex flex-col px-4 pb-6 md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">
              {currentView === 'dashboard' && `Welcome back, ${auth.user?.first_name}`}
            </h1>
            <p className="text-muted-foreground">
              {currentView === 'dashboard' && `${formatDate(currentTime)} • ${formatTime(currentTime)}`}
            </p>
            {currentView === 'dashboard' && (
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={healthScore >= 80 ? 'default' : healthScore >= 60 ? 'secondary' : 'destructive'}>
                  Business Health: {healthScore}%
                </Badge>
                <Button variant="ghost" size="sm" onClick={refreshData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {currentView === 'dashboard' && (
              <>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button onClick={() => handleNavigation('bookings')}>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  New Booking
                </Button>
              </>
            )}

          </div>
        </header>

        {/* Dynamic content based on current view */}
        {renderCurrentView()}
      </SidebarInset>
    </SidebarProvider>
  )
}