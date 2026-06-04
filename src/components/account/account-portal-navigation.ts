import {
  CalendarCheck2,
  CreditCard,
  Heart,
  Home,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import type { PortalNavItem } from "@/components/portal/portal-shell";

export function getCustomerPortalNavigation(
  activeHref: string,
): PortalNavItem[] {
  return [
    { href: "/account", label: "Overview", icon: Home },
    { href: "/", label: "Explore", icon: Search },
    { href: "/account/profile", label: "Profile", icon: UserRound },
    { href: "/account", label: "Bookings", icon: CalendarCheck2 },
    { href: "/account", label: "Favorites", icon: Heart },
    { href: "/account", label: "Payments", icon: CreditCard },
    { href: "/account", label: "Settings", icon: Settings },
  ].map((item) => ({
    ...item,
    active: item.href === activeHref,
  }));
}
