"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowLeftRight,
  BadgeIndianRupee,
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  Gauge,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  Settings2,
  Target,
  TrendingDown,
  WalletCards,
} from "lucide-react";
import { logoutAction } from "@/app/actions";
import type { AlertTone, FinancialAlert } from "@/lib/financial-alerts";

const links = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/transactions", "Transactions", ArrowLeftRight],
  ["/goals", "Savings goals", Target],
  ["/budget", "Budget planner", WalletCards],
  ["/learn", "Money guides", BookOpen],
] as const;

function initials(name?: string | null) {
  return (
    name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST"
  );
}

export function Sidebar({
  name,
  email,
  alerts = [],
  alertPeriod,
}: {
  name?: string | null;
  email?: string | null;
  alerts?: FinancialAlert[];
  alertPeriod: string;
}) {
  const pathname = usePathname();
  const activeLabel = pathname.startsWith("/learn")
    ? "Money guides"
    : pathname === "/recurring"
      ? "Recurring entries"
      : pathname === "/reports"
        ? "Money reports"
        : pathname === "/settings"
          ? "Account & data"
          : (links.find(([href]) => pathname === href)?.[1] ?? "Overview");
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  const alertStorageKey = `rags-to-riches:read-alerts:${email ?? "account"}:${alertPeriod}`;
  const readAlertIdsRaw = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("rags-to-riches:alerts-read", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("rags-to-riches:alerts-read", onChange);
      };
    },
    () => localStorage.getItem(alertStorageKey) || "[]",
    () => "[]",
  );
  let readAlertIds: string[] = [];
  try {
    const stored = JSON.parse(readAlertIdsRaw);
    readAlertIds = Array.isArray(stored) ? stored : [];
  } catch {
    readAlertIds = [];
  }

  const unreadAlerts = alerts.filter(
    (alert) => !readAlertIds.includes(alert.id),
  );
  const unreadTone = unreadAlerts.some((alert) => alert.tone === "danger")
    ? "danger"
    : unreadAlerts.some((alert) => alert.tone === "warning")
      ? "warning"
      : "info";

  function openNotifications() {
    const willOpen = !notificationsOpen;
    setNotificationsOpen(willOpen);
    setAccountOpen(false);
    if (!willOpen || alerts.length === 0) return;

    const nextReadIds = [
      ...new Set([...readAlertIds, ...alerts.map((alert) => alert.id)]),
    ];
    localStorage.setItem(alertStorageKey, JSON.stringify(nextReadIds));
    window.dispatchEvent(new Event("rags-to-riches:alerts-read"));
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[232px] border-r border-white/10 bg-[#103f2c] text-white lg:flex lg:flex-col">
        <Link
          href="/dashboard"
          className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5"
        >
          <span className="brand-mark !bg-[#d9ed70] !text-[#103f2c]">₹</span>
          <span className="text-sm font-semibold tracking-[-.02em] text-white">
            Rags to <span className="text-[#d9ed70]">Riches</span>
          </span>
        </Link>
        <nav className="px-3 py-4" aria-label="Finance navigation">
          <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[.08em] text-white/85">
            Workspace
          </p>
          <div className="grid gap-1">
            {links.map(([href, label, Icon]) => {
              const isActive =
                pathname === href ||
                (href === "/learn" && pathname.startsWith("/learn/"));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors ${isActive ? "bg-white text-[#103f2c]" : "text-white/85 hover:bg-white/10 hover:text-white"}`}
                >
                  <Icon
                    className="size-[18px]"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      <header className="app-topbar fixed inset-x-0 top-0 h-16 border-b border-[#d7ded8] bg-[#fbfaf6] lg:left-[232px]">
        <div className="flex h-full items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard" className="brand-mark lg:hidden">
              ₹
            </Link>
            <div>
              <p className="text-sm font-medium text-[#16271f]">
                {activeLabel}
              </p>
              <p className="hidden text-[10px] text-[#526158] sm:block">
                Student finance workspace
              </p>
            </div>
          </div>
          <div ref={accountRef} className="relative flex items-center gap-1.5">
            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                aria-label={`Notifications${unreadAlerts.length ? `, ${unreadAlerts.length} unread` : ""}`}
                aria-haspopup="dialog"
                aria-expanded={notificationsOpen}
                onClick={openNotifications}
                className={`relative grid size-9 place-items-center rounded-lg border transition-colors ${notificationsOpen ? "border-[#cbd6cd] bg-[#edf2ec] text-[#174b35]" : "border-transparent text-[#5d6b62] hover:border-[#d9e0da] hover:bg-[#f5f3e9]"}`}
              >
                <Bell className="size-[18px]" strokeWidth={1.8} />
                {unreadAlerts.length > 0 && (
                  <span
                    className={`absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full text-[8px] font-bold text-white ring-2 ring-[#fbfaf6] ${unreadTone === "danger" ? "bg-[#9d4039]" : unreadTone === "warning" ? "bg-[#a77622]" : "bg-[#426f7d]"}`}
                  >
                    {unreadAlerts.length}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div
                  role="dialog"
                  aria-label="Financial notifications"
                  className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[#ccd6ce] bg-[#fbfaf6] shadow-[0_12px_28px_rgba(24,45,34,.14)]"
                >
                  <div className="border-b border-[#dce2dd] px-3.5 py-3">
                    <div>
                      <b className="block text-xs font-semibold text-[#16271f]">
                        Notifications
                      </b>
                      <span className="mt-0.5 block text-[9px] text-[#6d7972]">
                        Based on spending, budget and savings goals
                      </span>
                    </div>
                  </div>
                  <div className="max-h-72 divide-y divide-[#e4e8e4] overflow-y-auto px-1.5">
                    {alerts.length ? (
                      alerts.map((alert) => (
                        <NotificationItem
                          key={alert.id}
                          alert={alert}
                          onOpen={() => setNotificationsOpen(false)}
                        />
                      ))
                    ) : (
                      <div className="px-4 py-5 text-center">
                        <b className="block text-xs text-[#26372e]">
                          Everything looks healthy
                        </b>
                        <p className="mt-1 text-[10px] text-[#526158]">
                          No spending or savings warnings right now.
                        </p>
                      </div>
                    )}
                  </div>
                  {alerts.length > 0 && (
                    <p className="border-t border-[#dce2dd] px-3.5 py-2 text-[9px] leading-4 text-[#526158]">
                      Alerts clear automatically when your numbers improve.
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              onClick={() => {
                setAccountOpen((current) => !current);
                setNotificationsOpen(false);
              }}
              className={`flex items-center gap-2 rounded-lg border px-1.5 py-1 transition-colors ${accountOpen ? "border-[#cbd6cd] bg-[#edf2ec]" : "border-transparent hover:border-[#d9e0da] hover:bg-[#f5f3e9]"}`}
            >
              <span className="grid size-8 place-items-center rounded-full bg-[#103f2c] text-[10px] font-semibold text-[#d9ed70]">
                {initials(name)}
              </span>
              <span className="hidden text-left sm:block">
                <b className="block max-w-32 truncate text-[11px] font-medium text-[#34453b]">
                  {name}
                </b>
                <small className="block text-[9px] text-[#526158]">
                  Student account
                </small>
              </span>
              <ChevronDown
                className={`size-3.5 text-[#526158] transition-transform ${accountOpen ? "rotate-180" : ""}`}
              />
            </button>
            {accountOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-[#ccd6ce] bg-[#fbfaf6] shadow-[0_14px_34px_rgba(24,45,34,.18)]"
              >
                <div className="bg-[#edf2ec] p-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#174b35] text-[10px] font-semibold text-[#d9ed70]">
                      {initials(name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#16271f]">
                        {name}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-[#4d5d52]">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-[.1em] text-[#8b958f]">
                    Account
                  </p>
                  <Link
                    role="menuitem"
                    href="/reports"
                    onClick={() => setAccountOpen(false)}
                    className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-medium text-[#34453b] hover:bg-[#edf2ec]"
                  >
                    <BarChart3 className="size-4" /> Money reports
                  </Link>
                  <Link
                    role="menuitem"
                    href="/settings"
                    onClick={() => setAccountOpen(false)}
                    className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-medium text-[#34453b] hover:bg-[#edf2ec]"
                  >
                    <Settings2 className="size-4" /> Account & data
                  </Link>
                  <form action={logoutAction}>
                    <button
                      role="menuitem"
                      className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-medium text-[#a53d35] hover:bg-[#f5e5e1]"
                    >
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-2 bottom-2 z-50 grid grid-cols-5 rounded-lg border border-[#cdd7cf] bg-[#fbfaf6] p-1 shadow-[0_4px_16px_rgba(24,45,34,.18)] lg:hidden"
        aria-label="Mobile finance navigation"
      >
        {links.map(([href, label, Icon]) => {
          const isActive =
            pathname === href ||
            (href === "/learn" && pathname.startsWith("/learn/"));
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[9px] font-medium ${isActive ? "bg-[#103f2c] text-white" : "text-[#4d5d52]"}`}
            >
              <Icon className="size-4" strokeWidth={1.8} />
              <span className="truncate">{label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

const notificationStyles: Record<AlertTone, { icon: string; surface: string }> =
  {
    info: {
      icon: "bg-[#e7eef0] text-[#426f7d]",
      surface: "hover:bg-[#edf2f3]",
    },
    success: {
      icon: "bg-[#e5eee7] text-[#35704d]",
      surface: "hover:bg-[#edf5ef]",
    },
    warning: {
      icon: "bg-[#f1e8cf] text-[#87651e]",
      surface: "hover:bg-[#f8f1df]",
    },
    danger: {
      icon: "bg-[#efe1df] text-[#963f38]",
      surface: "hover:bg-[#f5e9e7]",
    },
  };

const notificationIcons = {
  budget: Gauge,
  cashflow: TrendingDown,
  savings: PiggyBank,
  setup: BadgeIndianRupee,
};

function NotificationItem({
  alert,
  onOpen,
}: {
  alert: FinancialAlert;
  onOpen: () => void;
}) {
  const style = notificationStyles[alert.tone];
  const Icon = notificationIcons[alert.kind];

  return (
    <Link
      href={alert.href}
      onClick={onOpen}
      className={`flex gap-2.5 rounded-md px-2.5 py-3 transition-colors ${style.surface}`}
    >
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-md ${style.icon}`}
      >
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <b className="block text-[11px] font-semibold text-[#26372e]">
          {alert.title}
        </b>
        <span className="mt-1 block text-[10px] leading-4 text-[#6e7b73]">
          {alert.message}
        </span>
      </span>
    </Link>
  );
}
