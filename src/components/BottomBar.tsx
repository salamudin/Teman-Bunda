"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Baby,
  CalendarDays,
  UserCircle,
} from "lucide-react";

const TABS = [
  { href: "/home", icon: Home, label: "Beranda" },
  { href: "/bidans", icon: Users, label: "Bidan" },
  { href: "/janin", icon: Baby, label: "Janin" },
  { href: "/bookings", icon: CalendarDays, label: "Jadwal" },
  { href: "/profile", icon: UserCircle, label: "Profil" },
];

export default function BottomBar() {
  const pathname = usePathname();

  return (
    <nav className="bottom-bar" aria-label="Navigasi utama">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`tab-item${isActive ? " active" : ""}`}
            aria-label={tab.label}
          >
            <div className="tab-icon-wrap">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
            </div>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
