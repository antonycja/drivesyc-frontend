"use client"

import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// Map URLs to view states
export const getViewFromUrl = (url) => {
  const urlToViewMap = {
    '/owner': 'dashboard',
    '/owner/bookings': 'bookings',
    '/owner/bookings/create': 'create-booking',
    '/owner/bookings/calendar': 'bookings-calendar',
    '/owner/instructors': 'instructors',
    '/owner/instructors/create': 'create-instructor',
    '/owner/instructors/schedules': 'instructor-schedules',
    '/owner/students': 'students',
    '/owner/students/progress': 'student-progress',
    '/owner/vehicles': 'vehicles',
    '/owner/vehicles/create': 'create-vehicle',
    '/owner/vehicles/maintenance': 'vehicle-maintenance',
    '/owner/reports': 'reports',
    '/owner/reports/revenue': 'revenue-reports',
    '/owner/reports/instructors': 'instructor-reports',
    '/owner/reports/students': 'student-reports',
    '/owner/reports/vehicles': 'vehicle-reports',
    '/owner/finance': 'finance',
    '/owner/finance/payments': 'finance-payments',
    '/owner/finance/invoices': 'finance-invoices',
    '/owner/finance/expenses': 'finance-expenses',
    '/owner/settings': 'settings',
  };

  return urlToViewMap[url] || 'dashboard';
};

export function NavMain({ items, onNavigate, currentView }) {
  const handleItemClick = (item, e) => {
    e.preventDefault();

    // If it's a single item with a direct URL (no children)
    if (item.url && item.url !== '#' && !item.items) {
      const view = getViewFromUrl(item.url);
      onNavigate && onNavigate(view);
      return;
    }

    // If it has children, don't navigate - just expand/collapse
    // The collapsible will handle the toggle
  };

  const handleSubItemClick = (subItem, e) => {
    e.preventDefault();

    if (subItem.url) {
      const view = getViewFromUrl(subItem.url);
      onNavigate && onNavigate(view);
    }
  };

  const isItemActive = (item) => {
    // Check if main item is active
    if (item.url && item.url !== '#') {
      return currentView === getViewFromUrl(item.url);
    }

    // Check if any sub-item is active
    if (item.items) {
      return item.items.some(subItem =>
        subItem.url && currentView === getViewFromUrl(subItem.url)
      );
    }

    return false;
  };

  const isSubItemActive = (subItem) => {
    return subItem.url && currentView === getViewFromUrl(subItem.url);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // If item has no children, render as simple menu item
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={(e) => handleItemClick(item, e)}
                  isActive={isItemActive(item)}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // If item has children, render as collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || isItemActive(item)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isItemActive(item)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubItemActive(subItem)}
                        >
                          <button
                            onClick={(e) => handleSubItemClick(subItem, e)}
                            className="w-full text-left"
                          >
                            <span>{subItem.title}</span>
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}