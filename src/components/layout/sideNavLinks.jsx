'use client'

import {
  Home,
  Calendar,
  Users,
  Car,
  GraduationCap,
  BarChart3,
  DollarSign,
  Settings,
  Shield,
  Building,
  UserCheck,
  FileText,
  Clock,
  MapPin,
  BookOpen,
  Award,
  CreditCard,
  Bell,
  HelpCircle,
  Database,
  Activity,
  TrendingUp,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Star,
  MessageCircle,
  Phone,
  Mail,
  Globe
} from "lucide-react";

// ADMIN NAVIGATION DATA
export const adminData = {
  portal: "Admin",
  sideNav: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
      isActive: true,
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "All Users",
          url: "/admin/users",
        },
        {
          title: "Owners",
          url: "/admin/users/owners",
        },
        {
          title: "Instructors",
          url: "/admin/users/instructors",
        },
        {
          title: "Students",
          url: "/admin/users/students",
        },
        {
          title: "User Approvals",
          url: "/admin/users/approvals",
        },
      ],
    },
    {
      title: "Driving Schools",
      url: "#",
      icon: Building,
      items: [
        {
          title: "All Schools",
          url: "/admin/schools",
        },
        {
          title: "School Applications",
          url: "/admin/schools/applications",
        },
        {
          title: "School Analytics",
          url: "/admin/schools/analytics",
        },
      ],
    },
    {
      title: "System Management",
      url: "#",
      icon: Database,
      items: [
        {
          title: "System Settings",
          url: "/admin/system/settings",
        },
        {
          title: "License Management",
          url: "/admin/system/licenses",
        },
        {
          title: "Backup & Restore",
          url: "/admin/system/backup",
        },
        {
          title: "API Management",
          url: "/admin/system/api",
        },
      ],
    },
    {
      title: "Reports & Analytics",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Platform Analytics",
          url: "/admin/reports/platform",
        },
        {
          title: "Revenue Reports",
          url: "/admin/reports/revenue",
        },
        {
          title: "User Activity",
          url: "/admin/reports/activity",
        },
        {
          title: "System Performance",
          url: "/admin/reports/performance",
        },
      ],
    },
    {
      title: "Content Management",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Announcements",
          url: "/admin/content/announcements",
        },
        {
          title: "Help Articles",
          url: "/admin/content/help",
        },
        {
          title: "Email Templates",
          url: "/admin/content/emails",
        },
      ],
    },
    {
      title: "Support",
      url: "#",
      icon: HelpCircle,
      items: [
        {
          title: "Support Tickets",
          url: "/admin/support/tickets",
        },
        {
          title: "Live Chat",
          url: "/admin/support/chat",
        },
        {
          title: "Knowledge Base",
          url: "/admin/support/kb",
        },
      ],
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
};

// INSTRUCTOR NAVIGATION DATA
export const instructorData = {
  portal: "Instructor",
  sideNav: [
    {
      title: "Dashboard",
      url: "/instructor",
      icon: Home,
      isActive: true,
    },
    {
      title: "My Schedule",
      url: "#",
      icon: Calendar,
      items: [
        {
          title: "Today's Lessons",
          url: "/instructor/schedule/today",
        },
        {
          title: "Weekly View",
          url: "/instructor/schedule/week",
        },
        {
          title: "Monthly View",
          url: "/instructor/schedule/month",
        },
        {
          title: "Availability",
          url: "/instructor/schedule/availability",
        },
      ],
    },
    {
      title: "Students",
      url: "#",
      icon: GraduationCap,
      items: [
        {
          title: "My Students",
          url: "/instructor/students",
        },
        {
          title: "Student Progress",
          url: "/instructor/students/progress",
        },
        {
          title: "Lesson Reports",
          url: "/instructor/students/reports",
        },
        {
          title: "Test Results",
          url: "/instructor/students/tests",
        },
      ],
    },
    {
      title: "Lessons",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Upcoming Lessons",
          url: "/instructor/lessons/upcoming",
        },
        {
          title: "Completed Lessons",
          url: "/instructor/lessons/completed",
        },
        {
          title: "Cancelled Lessons",
          url: "/instructor/lessons/cancelled",
        },
        {
          title: "Lesson Templates",
          url: "/instructor/lessons/templates",
        },
      ],
    },
    {
      title: "Vehicles",
      url: "#",
      icon: Car,
      items: [
        {
          title: "My Assigned Vehicles",
          url: "/instructor/vehicles",
        },
        {
          title: "Vehicle Inspections",
          url: "/instructor/vehicles/inspections",
        },
        {
          title: "Maintenance Requests",
          url: "/instructor/vehicles/maintenance",
        },
      ],
    },
    {
      title: "Performance",
      url: "#",
      icon: TrendingUp,
      items: [
        {
          title: "My Statistics",
          url: "/instructor/performance/stats",
        },
        {
          title: "Student Feedback",
          url: "/instructor/performance/feedback",
        },
        {
          title: "Earnings",
          url: "/instructor/performance/earnings",
        },
      ],
    },
    {
      title: "Communication",
      url: "#",
      icon: MessageCircle,
      items: [
        {
          title: "Messages",
          url: "/instructor/communication/messages",
        },
        {
          title: "Notifications",
          url: "/instructor/communication/notifications",
        },
        {
          title: "Support",
          url: "/instructor/communication/support",
        },
      ],
    },
    {
      title: "Profile & Settings",
      url: "/instructor/settings",
      icon: Settings,
    },
  ],
};

// LEARNER/STUDENT NAVIGATION DATA
export const learnerData = {
  portal: "Student",
  sideNav: [
    {
      title: "Dashboard",
      url: "/student",
      icon: Home,
      isActive: true,
    },
    {
      title: "My Lessons",
      url: "#",
      icon: Calendar,
      items: [
        {
          title: "Upcoming Lessons",
          url: "/student/lessons/upcoming",
        },
        {
          title: "Lesson History",
          url: "/student/lessons/history",
        },
        {
          title: "Book a Lesson",
          url: "/student/lessons/book",
        },
        {
          title: "Reschedule/Cancel",
          url: "/student/lessons/manage",
        },
      ],
    },
    {
      title: "My Progress",
      url: "#",
      icon: TrendingUp,
      items: [
        {
          title: "Learning Progress",
          url: "/student/progress/overview",
        },
        {
          title: "Skills Assessment",
          url: "/student/progress/skills",
        },
        {
          title: "Lesson Reports",
          url: "/student/progress/reports",
        },
        {
          title: "Achievements",
          url: "/student/progress/achievements",
        },
      ],
    },
    {
      title: "Theory & Tests",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Theory Material",
          url: "/student/theory/material",
        },
        {
          title: "Practice Tests",
          url: "/student/theory/practice",
        },
        {
          title: "Mock Exams",
          url: "/student/theory/mocks",
        },
        {
          title: "Test Results",
          url: "/student/theory/results",
        },
      ],
    },
    {
      title: "My Instructor",
      url: "#",
      icon: UserCheck,
      items: [
        {
          title: "Instructor Profile",
          url: "/student/instructor/profile",
        },
        {
          title: "Send Message",
          url: "/student/instructor/message",
        },
        {
          title: "Rate & Review",
          url: "/student/instructor/review",
        },
      ],
    },
    {
      title: "Payments & Billing",
      url: "#",
      icon: CreditCard,
      items: [
        {
          title: "Payment History",
          url: "/student/payments/history",
        },
        {
          title: "Outstanding Payments",
          url: "/student/payments/outstanding",
        },
        {
          title: "Payment Methods",
          url: "/student/payments/methods",
        },
        {
          title: "Invoices",
          url: "/student/payments/invoices",
        },
      ],
    },
    {
      title: "Test Booking",
      url: "#",
      icon: Award,
      items: [
        {
          title: "Book Theory Test",
          url: "/student/tests/theory",
        },
        {
          title: "Book Practical Test",
          url: "/student/tests/practical",
        },
        {
          title: "Test History",
          url: "/student/tests/history",
        },
        {
          title: "Test Preparation",
          url: "/student/tests/preparation",
        },
      ],
    },
    {
      title: "Support & Help",
      url: "#",
      icon: HelpCircle,
      items: [
        {
          title: "FAQ",
          url: "/student/support/faq",
        },
        {
          title: "Contact Support",
          url: "/student/support/contact",
        },
        {
          title: "User Guide",
          url: "/student/support/guide",
        },
      ],
    },
    {
      title: "Profile & Settings",
      url: "/student/settings",
      icon: Settings,
    },
  ],
};

// OWNER DATA (from previous implementation)
export const ownerData = {
  portal: "Owner",
  sideNav: [
    {
      title: "Dashboard",
      url: "/owner",
      icon: Home,
      isActive: true,
    },
    {
      title: "Bookings",
      url: "#",
      icon: Calendar,
      items: [
        {
          title: "All Bookings",
          url: "/owner/bookings",
        },
        {
          title: "Create Booking",
          url: "/owner/bookings/create",
        },
        {
          title: "Calendar View",
          url: "/owner/bookings/calendar",
        },
      ],
    },
    {
      title: "Instructors",
      url: "#",
      icon: Users,
      items: [
        {
          title: "All Instructors",
          url: "/owner/instructors",
        },
        {
          title: "Add Instructor",
          url: "/owner/instructors/create",
        },
        {
          title: "Schedules",
          url: "/owner/instructors/schedules",
        },
      ],
    },
    {
      title: "Vehicles",
      url: "#",
      icon: Car,
      items: [
        {
          title: "Fleet Overview",
          url: "/owner/vehicles",
        },
        {
          title: "Add Vehicle",
          url: "/owner/vehicles/create",
        },
        {
          title: "Maintenance",
          url: "/owner/vehicles/maintenance",
        },
      ],
    },
    {
      title: "Students",
      url: "#",
      icon: GraduationCap,
      items: [
        {
          title: "All Students",
          url: "/owner/students",
        },
        {
          title: "Progress Tracking",
          url: "/owner/students/progress",
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Revenue Reports",
          url: "/owner/reports/revenue",
        },
        {
          title: "Instructor Performance",
          url: "/owner/reports/instructors",
        },
        {
          title: "Student Progress",
          url: "/owner/reports/students",
        },
        {
          title: "Vehicle Usage",
          url: "/owner/reports/vehicles",
        },
      ],
    },
    {
      title: "Finance",
      url: "#",
      icon: DollarSign,
      items: [
        {
          title: "Payments",
          url: "/owner/finance/payments",
        },
        {
          title: "Invoices",
          url: "/owner/finance/invoices",
        },
        {
          title: "Expenses",
          url: "/owner/finance/expenses",
        },
      ],
    },
    {
      title: "Settings",
      url: "/owner/settings",
      icon: Settings,
    },
  ],
};

// UTILITY FUNCTION TO GET NAVIGATION DATA BASED ON USER ROLE
export const getNavigationData = (userRole) => {
  switch (userRole?.toLowerCase()) {
    case 'admin':
      return adminData;
    case 'owner':
      return ownerData;
    case 'instructor':
      return instructorData;
    case 'student':
    case 'learner':
      return learnerData;
    default:
      return learnerData; // Default fallback
  }
};

// EXPORT ALL DATA
export { adminData, ownerData, instructorData, learnerData };