const NavLinks = [
  {
    label: "Home",
    authRequired: false,
    href: "/",
    icon: "home"
  },
  {
    label: "About",
    authRequired: false,
    href: "/about",
    icon: "info"
  },
  {
    label: "Services",
    authRequired: false,
    href: "/services",
    icon: "briefcase"
  },
  {
    label: "Dashboard",
    authRequired: true,
    href: "/dashboard",
    icon: "layout-dashboard"
  },
  {
    label: "My Bookings",
    authRequired: true,
    href: "/bookings",
    icon: "calendar"
  },
  {
    label: "Support",
    authRequired: false,
    href: "/contact",
    icon: "help-circle"
  }
]

export const NonUserLinks = [
  {
    label: "Sign In",
    authRequired: false,
    href: "/auth/login",
    variant: "ghost"
  },
  {
    label: "Get Started",
    authRequired: false,
    href: "/auth/register",
    variant: "primary"
  }
]

export default NavLinks