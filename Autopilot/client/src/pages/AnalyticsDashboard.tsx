import { useEffect, useState } from "react"
import { TrendingUp, Users, Wallet, BarChart3, Activity, Calendar as CalendarIcon, Search, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Line, LineChart, ResponsiveContainer } from "recharts"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import Lowheader from "@/components/Lowheader"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { useLocation } from "wouter"
import CryptoMarketOverview from "@/components/CryptoMarketOverview"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import emptyStateImage from "@/assets/empty_state_search.svg";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Spinner for loading states
const spinner = (
    <span className="flex items-center justify-center h-6">
        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </span>
);


interface AdminUser {
    is_admin: boolean
    name: string
}

interface User {
    name: string
    email: string
}

// Fetch all users and return count and user list
const fetchAllUsers = async (startDate?: string, endDate?: string): Promise<{ users: User[], count: number }> => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const url = `/api/all-users${params.toString() ? `?${params.toString()}` : ''}`;
        
        const res = await apiRequest<{ success: boolean, count: number, users: User[] }>(
            "GET",
            url
        );

        if (!res.success || !Array.isArray(res.users)) {
            throw new Error("Invalid response format");
        }

        return { users: res.users, count: res.count };
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw new Error("Failed to fetch all users");
    }
};


// Fetch all the active users
const fetchActiveUsers = async (startDate?: string, endDate?: string): Promise<{ count: number, users: any[] }> => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const url = `/api/active-users${params.toString() ? `?${params.toString()}` : ''}`;
        
        const res = await apiRequest<{ success: boolean; count: number; users: any[] }>(
            "GET",
            url
        );

        if (!res.success) throw new Error("Failed to fetch active users");

        return { count: res.count, users: res.users };
    } catch (error) {
        console.error("Error fetching active users:", error);
        throw new Error("Failed to fetch active users");
    }
};

// Fetch total funds deployed
const fetchTotalFundsDeployed = async (startDate?: string, endDate?: string): Promise<number> => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const url = `/api/total-funds-deployed${params.toString() ? `?${params.toString()}` : ''}`;
        
        const res = await apiRequest<{ success: boolean; total_used_margin: number }>(
            "GET",
            url
        );

        if (!res.success) throw new Error("Failed to fetch total funds deployed");

        return res.total_used_margin;
    } catch (error) {
        console.error("Error fetching total funds deployed:", error);
        throw new Error("Failed to fetch total funds deployed");
    }
};

// Fetch total value of funds(futures wallets) 
const fetchtotalFunds = async (startDate?: string, endDate?: string): Promise<number> => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const url = `/api/total-funds${params.toString() ? `?${params.toString()}` : ''}`;
        
        const res = await apiRequest<{ success: boolean; total_futures_wallets_inr: number }>(
            "GET",
            url
        );

        if (!res.success) throw new Error("Failed to fetch total funds");

        return res.total_futures_wallets_inr;
    } catch (error) {
        console.error("Error fetching total funds:", error);
        throw new Error("Failed to fetch total funds");
    }
};

// Fetch total volumes generated
const fetchTotalVolumesGenerated = async (startDate?: string, endDate?: string): Promise<number> => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const url = `/api/total-volumes-generated${params.toString() ? `?${params.toString()}` : ''}`;
        
        const res = await apiRequest<{ success: boolean; total_volumes: number }>(
            "GET",
            url
        );

        if (!res.success) throw new Error("Failed to fetch total volumes generated");

        return res.total_volumes;
    } catch (error) {
        console.error("Error fetching total volumes generated:", error);
        throw new Error("Failed to fetch total volumes generated");
    }
};

// Fetch all strategies
const fetchAllStrategies = async (): Promise<number> => {
    try {
        const res = await apiRequest<{ success: boolean; total_strategies: number }>(
            "GET",
            "/api/total-strategies"
        );

        if (!res.success) throw new Error("Failed to fetch total volumes generated");
        const total = res.total_strategies;
        return total;
    } catch (error) {
        console.error("Error fetching total volumes generated:", error);
        throw new Error("Failed to fetch total volumes generated");
    }
}

// Fetch active strategies
const fetchActiveStrategies = async (): Promise<number> => {
    try {
        const res = await apiRequest<{ success: boolean; total_active_strategies: number }>(
            "GET",
            "/api/active-strategies"
        );

        if (!res.success) throw new Error("Failed to fetch active strategies");
        const total = res.total_active_strategies;
        return total;
    } catch (error) {
        console.error("Error fetching active strategies:", error);
        throw new Error("Failed to fetch active strategies");
    }
}


export default function AnalyticsDashboard() {
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true)
    const [_, navigate] = useLocation()
    const { toast } = useToast()
    // Per-metric state
    const [totalUsers, setTotalUsers] = useState<number | null>(null);
    const [totalUsersLoading, setTotalUsersLoading] = useState(true);
    const [totalUsersError, setTotalUsersError] = useState<string | null>(null);

    const [totalActiveUsers, setTotalActiveUsers] = useState<number | null>(null);
    const [totalActiveUsersLoading, setTotalActiveUsersLoading] = useState(true);
    const [totalActiveUsersError, setTotalActiveUsersError] = useState<string | null>(null);

    const [totalFunds, setTotalFunds] = useState<number | null>(null);
    const [totalFundsLoading, setTotalFundsLoading] = useState(true);
    const [totalFundsError, setTotalFundsError] = useState<string | null>(null);

    const [totalVolumes, setTotalVolumes] = useState<number | null>(null);
    const [totalVolumesLoading, setTotalVolumesLoading] = useState(true);
    const [totalVolumesError, setTotalVolumesError] = useState<string | null>(null);

    const [totalFundsDeployed, setTotalFundsDeployed] = useState<number | null>(null);
    const [totalFundsDeployedLoading, setTotalFundsDeployedLoading] = useState(true);
    const [totalFundsDeployedError, setTotalFundsDeployedError] = useState<string | null>(null);

    const [totalStrategies, setTotalStrategies] = useState<number | null>(null);
    const [totalStrategiesLoading, setTotalStrategiesLoading] = useState(true);
    const [totalStrategiesError, setTotalStrategiesError] = useState<string | null>(null);

    const [totalActiveStrategies, setTotalActiveStrategies] = useState<number | null>(null);
    const [totalActiveStrategiesLoading, setTotalActiveStrategiesLoading] = useState(true);
    const [totalActiveStrategiesError, setTotalActiveStrategiesError] = useState<string | null>(null);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [dateRangeKey, setDateRangeKey] = useState(0); // Used to force re-render when dates change

        // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    interface UserVolumeData {
        name: string;
        email: string;
        total_funds: number;
        total_volumes: number;
        users_emails: string[];
    }

    const [searchResult, setSearchResult] = useState<UserVolumeData | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [userEmails, setUserEmails] = useState<string[]>([]);
    const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);

    const handleSearch = async () => {
        if (!searchQuery) return;

        setIsSearching(true);
        setHasSearched(true);
        setSearchResult(null);

        const start = formatDateForApi(startDate);
        const end = formatDateForApi(endDate);
        const params = new URLSearchParams({ email: searchQuery });
        if (start) params.append("startDate", start);
        if (end) params.append("endDate", end);

        try {
            const res = await apiRequest<{
                success: boolean;
                name: string;
                email: string;
                total_funds: number;
                total_volumes: number;
                users_emails: string[];
            }>(
                "GET",
                `/api/user/total-volumes-generated?${params.toString()}`
            );

            if (res.success) {
                setSearchResult({
                    name: res.name,
                    email: res.email,
                    total_funds: res.total_funds,
                    total_volumes: res.total_volumes,
                    users_emails: res.users_emails
                });
                if (Array.isArray(res.users_emails) && res.users_emails.length > 0) {
                    setUserEmails(prev => Array.from(new Set([...prev, ...res.users_emails])));
                }
                setEmailSuggestions([]);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch user volume data",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error fetching user volume:", error);
            const errorMessage = error.response?.data?.detail || error.message || "Failed to fetch user volume";
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchInputChange = (value: string) => {
        setSearchQuery(value);

        if (!value.trim()) {
            setEmailSuggestions([]);
            setSearchResult(null);
            setHasSearched(false);
            return;
        }

        const normalizedValue = value.toLowerCase();
        const sourceEmails = userEmails.length > 0
            ? userEmails
            : (searchResult?.users_emails ?? []);

        if (!sourceEmails.length) {
            setEmailSuggestions([]);
            return;
        }

        const matches = sourceEmails
            .filter(email => email.toLowerCase().includes(normalizedValue))
            .slice(0, 8);

        setEmailSuggestions(matches);
    };

    const handleSuggestionSelect = (email: string) => {
        setSearchQuery(email);
        setEmailSuggestions([]);
    };


    // Check admin access if a user tried to access this page directly
    useEffect(() => {
        const checkAdminAccess = async () => {
            try {
                const email = sessionStorage.getItem('signupEmail') || '';
                const res = await apiRequest<{ success: boolean; email: string; role: string; }>(
                    "GET",
                    `/api/get-role?email=${encodeURIComponent(email)}`
                );

                if (res?.role !== "superadmin" && res?.role !== "admin") {
                    toast({
                        title: "Access Denied",
                        description: "You don't have permission to access the admin dashboard.",
                        variant: "destructive",
                    });
                    navigate("/home");
                    return;
                }

                setCurrentUser({
                    is_admin: res.role === "admin" || res.role === "superadmin",
                    name: res.email, // or use res.name if available
                });
            } catch (err) {
                console.error("Auth check failed:", err);
                setCurrentUser({ is_admin: true, name: "Admin" }); // fallback, remove if not intended
            } finally {
                setIsAuthLoading(false);
            }
        };

        checkAdminAccess();
    }, [navigate, toast]);

    // Generate sample sparkline data for each metric
    const generateSparklineData = (trend: "up" | "down" | "mixed") => {
        const baseData = []
        for (let i = 0; i < 7; i++) {
            let value
            if (trend === "up") {
                value = 50 + Math.random() * 30 + i * 5
            } else if (trend === "down") {
                value = 80 - Math.random() * 20 - i * 3
            } else {
                value = 50 + Math.random() * 40 + Math.sin(i) * 15
            }
            baseData.push({ value })
        }
        return baseData
    }

    // Helper function to format date as YYYY-MM-DD (ISO format) for API
    const formatDateForApi = (date: Date | null): string | undefined => {
        if (!date) return undefined;
        return date.toISOString().split('T')[0];
    };

    // Helper function to format date for UI display
    const formatDateForDisplay = (date: Date | null, formatStr: string = 'PPP'): string => {
        if (!date) return 'Select date';
        return format(date, formatStr);
    };

    // Fetch all users
    useEffect(() => {
        setTotalUsersLoading(true);
        const start = formatDateForApi(startDate);
        const end = formatDateForApi(endDate);
        
        fetchAllUsers(start, end)
            .then(({ users, count }) => {
                setTotalUsers(count);
                if (Array.isArray(users) && users.length > 0) {
                    const emailsFromUsers = users
                        .map(user => user.email)
                        .filter((email): email is string => Boolean(email));
                    setUserEmails(Array.from(new Set(emailsFromUsers)));
                }
                setTotalUsersLoading(false);
            })
            .catch(err => {
                setTotalUsersError(`Failed to fetch users: ${err}`);
                setTotalUsersLoading(false);
            });
    }, [dateRangeKey]);

    // Fetch approved users
    useEffect(() => {
        setTotalActiveUsersLoading(true);
        const start = formatDateForApi(startDate);
        const end = formatDateForApi(endDate);
        
        fetchActiveUsers(start, end)
            .then(({ count }) => {
                setTotalActiveUsers(count);
                setTotalActiveUsersLoading(false);
            })
            .catch(err => {
                setTotalActiveUsersError(`Failed to fetch active users: ${err}`);
                setTotalActiveUsersLoading(false);
            });
    }, [dateRangeKey]);

    // Fetch total funds deployed
    useEffect(() => {
        setTotalFundsDeployedLoading(true);
        const start = formatDateForApi(startDate);
        const end = formatDateForApi(endDate);
        
        fetchTotalFundsDeployed(start, end)
            .then(total => {
                setTotalFundsDeployed(total);
                setTotalFundsDeployedLoading(false);
            })
            .catch(err => {
                setTotalFundsDeployedError(`Failed to fetch total funds deployed: ${err}`);
                setTotalFundsDeployedLoading(false);
            });
    }, [dateRangeKey]);

    // Fetch total value of funds
    useEffect(() => {
        setTotalFundsLoading(true);
        const start = formatDateForApi(startDate);
        const end = formatDateForApi(endDate);
        
        fetchtotalFunds(start, end)
            .then(total => {
                setTotalFunds(total);
                setTotalFundsLoading(false);
            })
            .catch(err => {
                setTotalFundsError(`Failed to fetch total funds: ${err}`);
                setTotalFundsLoading(false);
            });
    }, [dateRangeKey]);

    // Fetch total volumes generated
    useEffect(() => {
        setTotalVolumesLoading(true);
        const start = formatDateForApi(startDate);
        const end = formatDateForApi(endDate);
        
        fetchTotalVolumesGenerated(start, end)
            .then(total => {
                setTotalVolumes(total);
                setTotalVolumesLoading(false);
            })
            .catch(err => {
                setTotalVolumesError(`Failed to fetch total volumes generated: ${err}`);
                setTotalVolumesLoading(false);
            });
    }, [dateRangeKey]);

    // Handle date range apply
    const handleApplyDateRange = () => {
        // If endDate is not set, use current date
        const endDateToUse = endDate || new Date();
        // Increment the key to force re-render of all effects
        setDateRangeKey(prev => prev + 1);
    };

    // Reset date range
    const handleResetDateRange = () => {
        setStartDate(null);
        setEndDate(null);
        // Don't reset the key here, the state change will trigger the reset
        setDateRangeKey(prev => prev + 1);
    };

    // Fetch all strategies (no date filter as per original implementation)
    useEffect(() => {
        setTotalStrategiesLoading(true);
        
        fetchAllStrategies()
            .then(total => {
                setTotalStrategies(total);
                setTotalStrategiesLoading(false);
            })
            .catch(err => {
                setTotalStrategiesError(`Failed to fetch total strategies: ${err}`);
                setTotalStrategiesLoading(false);
            });
    }, []);

    // Fetch active strategies
    useEffect(() => {
        fetchActiveStrategies()
            .then(total => {
                setTotalActiveStrategies(total);
                setTotalActiveStrategiesLoading(false);
            })
            .catch(err => {
                setTotalActiveStrategiesError(`Failed to fetch active strategies: ${err}`);
                setTotalActiveStrategiesLoading(false);
            });
    }, []);

    const metrics = [
        {
            title: "Total Users",
            value: totalUsersLoading
                ? spinner
                : totalUsersError
                    ? totalUsersError
                    : typeof totalUsers === "number"
                        ? totalUsers.toString()
                        : "0",
            change: "+2.8%",
            changeType: "positive" as const,
            icon: Users,
            description: "All registered users",
            sparklineData: generateSparklineData("up"),
            sparklineColor: "#00ed64", // Green
        },
        {
            title: "Total Approved Users",
            value: totalActiveUsersLoading
                ? spinner
                : totalActiveUsersError
                    ? totalActiveUsersError
                    : typeof totalActiveUsers === "number"
                        ? totalActiveUsers.toString()
                        : "0",
            change: "+4.5%",
            changeType: "positive" as const,
            icon: Activity,
            description: "Users with broker connected",
            sparklineData: generateSparklineData("up"),
            sparklineColor: "#1a1aff", // Blue
        },
        {
            title: "Total Funds",
            value: totalFundsLoading
                ? spinner
                : totalFundsError
                    ? totalFundsError
                    : typeof totalFunds === "number"
                        ? `₹${totalFunds.toLocaleString()}`
                        : "₹0",
            change: "+3.8%",
            changeType: "positive" as const,
            icon: Wallet,
            description: "Present market value",
            sparklineData: generateSparklineData("mixed"),
            sparklineColor: "#ffff00", // Yellow
        },
        {
            title: "Total Funds Deployed",
            value: totalFundsDeployedLoading
                ? spinner
                : totalFundsDeployedError
                    ? totalFundsDeployedError
                    : typeof totalFundsDeployed === "number"
                        ? `₹${totalFundsDeployed.toLocaleString()}`
                        : "₹0",
            change: "+5.7%",
            changeType: "positive" as const,
            icon: TrendingUp,
            description: "Capital allocated to strategies",
            sparklineData: generateSparklineData("up"),
            sparklineColor: "#d11aff", // Purple
        },
        {
            title: "Total Volumes Generated",
            value: totalVolumesLoading
                ? spinner
                : totalVolumesError
                    ? totalVolumesError
                    : typeof totalVolumes === "number"
                        ? `${totalVolumes.toLocaleString()}`
                        : "0",
            change: "+2.4%",
            changeType: "positive" as const,
            icon: BarChart3,
            description: "Cumulative trading volume",
            sparklineData: generateSparklineData("up"),
            sparklineColor: "#ff6600", // Orange
        },
    ];

      return (
          <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50 dark:bg-[#2d3139]">
                <Sidebar />
                <div className="flex-1 md:ml-[14rem] flex flex-col">
                  <Header />
                  <Lowheader />
                {/* Main Content */}
                <main className="container mx-auto p-6 space-y-6">
                    <div>
                        {/* Welcome Section */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h2>
                            <p className="text-gray-600 dark:text-gray-400">Monitor your platform's key performance metrics and trading strategies.</p>
                        </div>

                        {/* Date Range Picker */}
                        <div className="flex items-center justify-end gap-2 mb-6">
                            {/* start date */}
                            <div className="flex items-center gap-2">
                                <span className="text-md text-gray-600 dark:text-gray-200">From</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-60 justify-center text-center font-normal bg-card text-foreground hover:bg-muted hover:text-foreground">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            <span className="truncate">
                                                {formatDateForDisplay(startDate, 'MMM d, yyyy')}
                                            </span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate || undefined}
                                            onSelect={(date) => {
                                                setStartDate(date || null);
                                                // If end date is before new start date, clear it
                                                if (date && endDate && date > endDate) {
                                                    setEndDate(null);
                                                }
                                            }}
                                            initialFocus
                                            disabled={(date) => date > new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* end date */}
                            <div className="flex items-center gap-2">
                                <span className="text-md text-gray-600 dark:text-gray-200">To</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            className="w-60 justify-center text-center font-normal bg-card text-foreground hover:bg-muted hover:text-foreground"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            <span className="truncate">
                                                {formatDateForDisplay(endDate, 'MMM d, yyyy')}
                                            </span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0">
                                        <Calendar
                                            mode="single"
                                            selected={endDate || new Date()}
                                            onSelect={(date) => {
                                                if (startDate && date && date < startDate) {
                                                    toast({
                                                        title: "Invalid Date Range",
                                                        description: "End date must be after start date",
                                                        variant: "destructive",
                                                    });
                                                    return;
                                                }
                                                setEndDate(date || new Date());
                                            }}
                                            initialFocus
                                            disabled={(date) => (startDate ? date < startDate : false) || date > new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* clear filters */}
                            <Button
                                onClick={() => {
                                    const endDateToUse = endDate || new Date();
                                    if (startDate && endDateToUse < startDate) {
                                        toast({
                                            title: "Invalid Date Range",
                                            description: "End date must be after start date",
                                            variant: "destructive",
                                        });
                                        return;
                                    }
                                    handleApplyDateRange();
                                }}
                                disabled={!startDate}
                                className="bg-[#1a785f] hover:bg-[#1e896d] text-primary-foreground text-sm font-medium px-4 py-2"
                            >
                                Apply
                            </Button>
                            <Button
                                    onClick={handleResetDateRange}
                                    disabled={!startDate && !endDate}
                                    className="text-sm font-medium px-4 py-2 bg-black/80 hover:bg-red-600 text-primary-foreground"
                            >
                                    Clear
                            </Button>
                        </div>
                        
                        {/* Main Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                            {metrics.map((metric, index) => {
                                const Icon = metric.icon
                                return (
                                    <Card key={index} className="relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#05b289] via-[#06a07c] to-[#047158] bg-opacity-20">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-semibold text-gray-200">{metric.title}</CardTitle>
                                            <Icon className="w-4 h-4" style={{ color: metric.sparklineColor }} />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                                            <div className="flex items-center space-x-2 mb-3">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${metric.changeType === "positive" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {metric.change}
                                                </Badge>
                                                <span className="text-xs text-gray-200 font-semibold">vs last month</span>
                                            </div>

                                            {/* Sparkline Chart */}
                                            <div className="h-12 mb-2">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={metric.sparklineData}>
                                                        <Line
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke={metric.sparklineColor}
                                                            strokeWidth={2}
                                                            dot={false}
                                                            activeDot={false}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <p className="text-xs text-gray-200 font-semibold">{metric.description}</p>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                        {/* Filter Total Volumes Generated By User */}
                        <div className="mb-8">
                           <div className="bg-white dark:bg-[#17181d] p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Filter Total Volumes Generated By User</h3>
                                <div className="flex flex-col gap-6">
                                    <div className="flex w-full items-center space-x-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="email"
                                                placeholder="Enter user email..."
                                                value={searchQuery}
                                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                                className="bg-white dark:bg-[#1e222d] w-full"
                                                autoComplete="off"
                                            />
                                            {emailSuggestions.length > 0 && (
                                                <div className="absolute left-0 right-0 z-10 mt-2 max-h-56 overflow-y-auto rounded-md border border-border bg-white dark:bg-[#1e222d] shadow-lg">
                                                    {emailSuggestions.map((email) => (
                                                        <button
                                                            type="button"
                                                            key={email}
                                                            onClick={() => handleSuggestionSelect(email)}
                                                            className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                                                        >
                                                            {email}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Button onClick={handleSearch} disabled={isSearching} className="bg-[#1a785f] hover:bg-[#1e896d]">
                                            {isSearching ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <Search className="h-4 w-4" />
                                            )}
                                        </Button>
                                        
                                    </div>

                                    {searchResult ? (
                                        <div className="border rounded-lg bg-neutral-50 dark:bg-card dark:border-border">
                                            <Table className="text-center">
                                                <TableHeader className="bg-muted">
                                                    <TableRow>
                                                        <TableHead className="text-center">User Name</TableHead>
                                                        <TableHead className="text-center">User Email</TableHead>
                                                        <TableHead className="text-center">Total Funds</TableHead>
                                                        <TableHead className="text-center">Total Volumes Generated</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow key={searchResult.email}>
                                                        <TableCell className="font-medium">{searchResult.name || "—"}</TableCell>
                                                        <TableCell>{searchResult.email || "—"}</TableCell>
                                                        <TableCell>₹{searchResult.total_funds.toLocaleString()}</TableCell>
                                                        <TableCell>{searchResult.total_volumes.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : hasSearched ? (
                                        <div className="flex flex-col items-center justify-center py-8 bg-gray-100 dark:bg-[#1e222d] rounded-lg border border-gray-200 dark:border-gray-700 border-dashed">
                                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium text-foreground mb-2">No user found</h3>
                                            <p className="text-muted-foreground">Double-check the email address and try again.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 bg-gray-100 dark:bg-[#1e222d] rounded-lg border border-gray-200 dark:border-gray-700 border-dashed">
                                            <img
                                                src={emptyStateImage}
                                                alt="No results"
                                                className="w-36 h-36 object-contain mb-4 opacity-60"
                                            />
                                            <p className="text-gray-500 dark:text-gray-400 text-md ml-8">It's been quiet here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}