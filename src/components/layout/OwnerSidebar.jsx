'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Users,
  Car,
  BarChart3,
  Settings,
  Home,
  Clock,
  DollarSign,
  FileText,
  Bell,
  ChevronDown,
  ChevronRight,
  Plus,
  GraduationCap,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ownerNavigation = [
  {
    name: 'Dashboard',
    href: '/owner',
    icon: Home,
  },
  {
    name: 'Bookings',
    icon: Calendar,
    children: [
      { name: 'All Bookings', href: '/bookings' },
      { name: 'Create Booking', href: '/owner/bookings/create' },
      { name: 'Calendar View', href: '/owner/bookings/calendar' },
    ],
  },
  {
    name: 'Instructors',
    icon: Users,
    children: [
      { name: 'All Instructors', href: '/owner/instructors' },
      { name: 'Add Instructor', href: '/owner/instructors/create' },
      { name: 'Schedules', href: '/owner/instructors/schedules' },
    ],
  },
  {
    name: 'Vehicles',
    icon: Car,
    children: [
      { name: 'Fleet Overview', href: '/owner/vehicles' },
      { name: 'Add Vehicle', href: '/owner/vehicles/create' },
      { name: 'Maintenance', href: '/owner/vehicles/maintenance' },
    ],
  },
  {
    name: 'Students',
    icon: GraduationCap,
    children: [
      { name: 'All Students', href: '/owner/students' },
      { name: 'Progress Tracking', href: '/owner/students/progress' },
    ],
  },
  {
    name: 'Reports',
    icon: BarChart3,
    children: [
      { name: 'Revenue Reports', href: '/owner/reports/revenue' },
      { name: 'Instructor Performance', href: '/owner/reports/instructors' },
      { name: 'Student Progress', href: '/owner/reports/students' },
      { name: 'Vehicle Usage', href: '/owner/reports/vehicles' },
    ],
  },
  {
    name: 'Finance',
    icon: DollarSign,
    children: [
      { name: 'Payments', href: '/owner/finance/payments' },
      { name: 'Invoices', href: '/owner/finance/invoices' },
      { name: 'Expenses', href: '/owner/finance/expenses' },
    ],
  },
  {
    name: 'Settings',
    href: '/owner/settings',
    icon: Settings,
  },
];

export function OwnerSidebar({ className }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({
    // Auto-open the current section
    Bookings: pathname.startsWith('/bookings'),
    Instructors: pathname.startsWith('/owner/instructors'),
    Vehicles: pathname.startsWith('/owner/vehicles'),
    Students: pathname.startsWith('/owner/students'),
    Reports: pathname.startsWith('/owner/reports'),
    Finance: pathname.startsWith('/owner/finance'),
  });

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const isActiveLink = (href) => {
    if (href === '/owner') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isActiveParent = (children) => {
    return children?.some(child => pathname.startsWith(child.href));
  };

  return (
    <div className={cn('hidden lg:flex bg-white border-r border-gray-200 w-64 flex-col h-max sticky top-20 left-0', className)}>
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">DriveSync</h2>
            <p className="text-xs text-gray-500">Owner Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {ownerNavigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <Collapsible
                open={openMenus[item.name]}
                onOpenChange={() => toggleMenu(item.name)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between font-normal h-10",
                      isActiveParent(item.children)
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {openMenus[item.name] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  {item.children.map((child) => (
                    <Button
                      key={child.href}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start pl-12 font-normal h-9 text-sm",
                        isActiveLink(child.href)
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                      asChild
                    >
                      <Link href={child.href}>
                        {child.name}
                      </Link>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal h-10",
                  isActiveLink(item.href)
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </Button>
            )}
          </div>
        ))}
      </nav>

      {/* Quick Action at Bottom */}
      <div className="p-4 border-t border-gray-200">
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Quick Booking
        </Button>
      </div>
    </div>
  );
}