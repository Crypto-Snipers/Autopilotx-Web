"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  Lock,
  Settings,
  Home,
  History,
  Youtube,
  Instagram,
  MessageCircle,
  LogOut,
  ChartNoAxesCombined,
  UserRoundCog,
  Shield,
  Layers,
  ChartColumnDecreasing,
  Menu,
  X
} from "lucide-react";

import { clearLocalStorage, clearSessionStorage } from "@/lib/sessionStorageUtils";
import { apiRequest } from "@/lib/queryClient";

import AutoPilotLogoWhite from "@/assets/8-02.png";
import AutoPilotLogoBlack from "@/assets/autopilotx-black.png";

export default function Sidebar() {
  const { user, signout } = useAuth();
  const [role, setRole] = useState<string>("user");
  const [open, setOpen] = useState(false);

  const location = window.location.pathname;
  const theme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  const logo = theme === "dark" ? AutoPilotLogoWhite : AutoPilotLogoBlack;

  // Fetch admin role
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) return;

      try {
        const response = await apiRequest<{
          role: string;
        }>("GET", `/api/get-role?email=${encodeURIComponent(user.email)}`);

        setRole(response.role || "user");
      } catch {
        setRole("user");
      }
    };

    checkAdminStatus();
  }, [user]);

  // Logout logic
  const handleLogout = async () => {
    try {
      await signout();
      localStorage.removeItem("broker_name");
      localStorage.removeItem("api_verified");
      clearSessionStorage();
      clearLocalStorage();
      window.location.href = "/signin";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Sidebar items
  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5 mr-2" /> },
    { name: "Strategies", path: "/strategies", icon: <ChartColumnDecreasing className="w-5 h-5 mr-2" /> },
    { name: "Positions", path: "/positions", icon: <Layers className="w-5 h-5 mr-2" /> },
    { name: "History", path: "/history", icon: <History className="w-5 h-5 mr-2" /> },

    ...(role === "admin" || role === "superadmin"
      ? [{ name: "Notifications", path: "/admin/notifications", icon: <Settings className="w-5 h-5 mr-2" /> }]
      : []),

    ...(role === "admin" || role === "superadmin"
      ? [{ name: "Approvals", path: "/admin/approvals", icon: <UserRoundCog className="w-5 h-5 mr-2" /> }]
      : []),

    ...(role === "admin" || role === "superadmin"
      ? [{ name: "Analytics", path: "/admin/analytics", icon: <ChartNoAxesCombined className="w-5 h-5 mr-2" /> }]
      : []),

    ...(role === "superadmin"
      ? [{ name: "Access Control", path: "/superadmin/roles", icon: <Shield className="w-5 h-5 mr-2" /> }]
      : []),
  ];

  const socialLinks = [
    { name: "YouTube Channel", icon: <Youtube className="w-5 h-5 mr-2 text-red-500" />, url: "https://m.youtube.com/@TheCryptoSnipers" },
    { name: "Join Telegram", icon: <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />, url: "https://t.me/infocryptosnipers" },
    { name: "Instagram", icon: <Instagram className="w-5 h-5 mr-2 text-pink-500" />, url: "https://www.instagram.com/thecryptosnipers" },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-background shadow">
        <img src={logo} alt="logo" className="h-12" />
        <button onClick={() => setOpen(true)}>
          <Menu className="w-8 h-8" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed z-40 inset-y-0 left-0 w-[14rem] bg-background text-foreground
          flex-col transform duration-300 shadow-lg
          ${open ? "translate-x-0 flex" : "-translate-x-full hidden"}
          md:flex md:translate-x-0
        `}
      >
        {/* Close button (mobile) */}
        <div className="md:hidden flex justify-end p-4">
          <button onClick={() => setOpen(false)}>
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="p-4">
          <img src={logo} className="h-20 ml-2" alt="AutoPilotX Logo" />
        </div>

        <div className="mt-6 px-4 text-sm font-bold">Overview</div>

        <nav className="mt-2 space-y-1 px-2 font-medium">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              onClick={(e) => {
                if (item.name === "History") {
                  e.preventDefault();
                  const brokerName = sessionStorage.getItem("broker_name");
                  if (brokerName === "coindcx") {
                    window.open(
                      "https://coindcx.com/stats/futures/positions",
                      "_blank"
                    );
                    return;
                  }
                }
                window.location.href = item.path;
                setOpen(false);
              }}
              className={`flex items-center px-3 py-2 rounded-full ${
                location === item.path
                  ? "bg-[#06a57f] text-white"
                  : "hover:bg-muted"
              }`}
            >
              {item.icon}
              {item.name}
            </a>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="px-4 text-sm font-bold mb-2">Join Us</div>

          <div className="bg-muted rounded-lg mx-2 p-4 space-y-3">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                className="flex items-center text-sm hover:text-[#02b589]"
              >
                {link.icon}
                {link.name}
              </a>
            ))}
          </div>

          <div className="mt-4 px-4 mb-4">
            <button
              className="flex items-center text-sm font-medium hover:text-[#02b589]"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Log Out
            </button>
          </div>
        </div>
      </aside>


      {/* Mobile black overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
