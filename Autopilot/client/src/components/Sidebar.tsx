import { useState, useEffect, useMemo } from 'react';
import { useAuth } from "@/lib/auth";
import { Lock, Settings, Home, BarChart, LineChart, History, Youtube, Instagram, MessageCircle, LogOut, ChartNoAxesCombined, UserRoundCog, Shield, Layers, ChartColumnDecreasing } from "lucide-react";
import { clearLocalStorage, clearSessionStorage } from "@/lib/sessionStorageUtils";
import { apiRequest } from "@/lib/queryClient";
import AutoPilotLogoWhite from "@/assets/8-02.png";
import AutoPilotLogoBlack from "@/assets/autopilotx-black.png";

// Create a custom hook for theme detection
const useThemeDetector = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    // Function to get current theme
    const getCurrentTheme = (): 'dark' | 'light' => {
      if (typeof window === 'undefined') return 'light';

      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme as 'dark' | 'light';
      }

      return window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light';
    };

    // Set initial theme
    setTheme(getCurrentTheme());

    // Function to handle theme changes
    const handleThemeChange = () => {
      setTheme(getCurrentTheme());
    };

    // Set up event listeners
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleThemeChange);

    // Listen for storage events (theme changes in other tabs/windows)
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme') {
        handleThemeChange();
      }
    });

    // Listen for theme changes in the current tab
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains('dark') !== (theme === 'dark')) {
        handleThemeChange();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
      observer.disconnect();
    };
  }, [theme]); // Add theme as a dependency

  return theme;
};

export default function Sidebar() {
  const { user, signout } = useAuth();
  const [role, setRole] = useState<string>("user");
  const location = window.location.pathname;
  const currentTheme = useThemeDetector();

  // Memoize the logo to prevent unnecessary re-renders
  const logo = useMemo(() => {
    return currentTheme === 'dark' ? AutoPilotLogoWhite : AutoPilotLogoBlack;
  }, [currentTheme]);

  // Check User role
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        try {
          const response = await apiRequest<{ success: boolean; email: string; role: string; }>(
            "GET",
            `/api/get-role?email=${encodeURIComponent(user.email)}`
          );

          console.log("User role response:", response);
          if (response?.role === "superadmin" || response?.role === "admin") {
            setRole(response.role);
          } else {
            setRole("user");
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          setRole("user");
        }
      }
    };
    checkAdminStatus();
  }, [user]);


  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await signout();
      localStorage.removeItem('broker_name');
      localStorage.removeItem('api_verified');
      clearSessionStorage();
      clearLocalStorage();
      window.location.href = '/signin';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  const navItems = [
    { name: "Home", path: "/home", icon: <Home className="w-5 h-5 mr-2" /> },
    { name: "Strategies", path: "/strategies", icon: <ChartColumnDecreasing className="w-5 h-5 mr-2" /> },
    { name: "Positions", path: "/positions", icon: <Layers className="w-5 h-5 mr-2" /> },
    { name: "History", path: "/history", icon: <History className="w-5 h-5 mr-2" /> },

    ...(role === "admin" || role === "superadmin" ? [{ name: "Notifications", path: "/admin/notifications", icon: <Settings className="w-5 h-5 mr-2" /> }] : []),
    ...(role === "admin" || role === "superadmin" ? [{ name: "Approvals", path: "/admin/approvals", icon: <UserRoundCog className="w-5 h-5 mr-2" /> }] : []),
    ...(role === "admin" || role === "superadmin" ? [{ name: "Analytics", path: "/admin/analytics", icon: <ChartNoAxesCombined className="w-5 h-5 mr-2" /> }] : []),

    ...(role === "superadmin" ? [{ name: "Access Control", path: "/superadmin/roles", icon: <Shield className="w-5 h-5 mr-2" /> }] : []),
  ];

  const socialLinks = [
    { name: "YouTube Channel", icon: <Youtube className="w-5 h-5 mr-2 text-[#06a57f]" />, url: "https://m.youtube.com/@TheCryptoSnipers" },
    { name: "Join Telegram", icon: <MessageCircle className="w-5 h-5 mr-2 text-[#06a57f]" />, url: "https://t.me/infocryptosnipers" },
    { name: "Follow on Instagram", icon: <Instagram className="w-5 h-5 mr-2 text-[#06a57f]" />, url: "https://www.instagram.com/thecryptosnipers?igsh=dmg1Z3Vlb2xjbjNx" },
  ];

  const footerLinks = [
    { name: "Terms & Conditions", icon: <Lock className="w-5 h-5 mr-2" />, path: "/terms" },
    // { name: "Privacy Policy", icon: <Lock className="w-5 h-5 mr-2" />, path: "/privacy" },
    { name: "LogOut", icon: <LogOut className="w-5 h-5 mr-2" /> },
  ];

  return (
    <aside className="w-[14rem] fixed inset-y-0 bg-background text-foreground hidden md:flex flex-col z-10">
      <div className="p-4">
        <img src={logo} className="h-20 ml-2" alt="AutoPilotX Logo" />
      </div>
      <div className="mt-6 px-4 text-medium text-foreground font-bold">Overview</div>
      <nav className="mt-2 space-y-1 px-2 text-foreground text-sm">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            // onClick={(e) => {
            //   if (item.name === "History") {
            //     e.preventDefault();
            //     const brokerName = sessionStorage.getItem("broker_name");
            //     if (brokerName === "coindcx") {
            //       window.open("https://coindcx.com/stats/futures/positions", "_blank");
            //       return;
            //     }
            //   }
            //   window.location.href = item.path;
            // }}
            className={`flex items-center px-3 py-2 rounded-full ${location === item.path
              ? "bg-[#06a57f] text-primary-foreground"
              : "text-foreground hover:bg-muted"
              }`}
          >
            {item.icon}
            {item.name}
          </a>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="px-4 text-medium text-foreground font-bold mb-2">Join Us</div>
        <div className="bg-muted rounded-lg mx-2 p-4 space-y-3">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-foreground hover:text-gray-400"
            >
              {link.icon}
              {link.name}
            </a>
          ))}
        </div>

        <div className="mt-4 px-4 space-y-3 mb-4">
          {footerLinks.map((link) => (
            <a
              key={link.name}
              href={link.path || "#"}
              onClick={link.name === "LogOut" ? (e) => {
                e.preventDefault();
                handleLogout();
              } : undefined}
              className="flex items-center text-sm text-foreground hover:text-gray-400"
            >
              {link.icon}
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}