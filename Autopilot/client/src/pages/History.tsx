"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Info, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Lowheader from "@/components/Lowheader";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { apiRequest } from "@/lib/queryClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TradeData {
  entry_time: string;
  position: string;
  qty: number;
  entry_price: number;
  exit_price: number;
  pnl: number;
  symbol: string;
  trade_id?: string;
  exit_time?: string;
  currency: string;
}

interface ApiResponse {
  status: string;
  page: number;
  page_size: number;
  total_trades: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
  data: TradeData[];
}

export default function History() {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [symbol, setSymbol] = useState("all");
  const [side, setSide] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const { user } = useAuth();
  const { toast } = useToast();
  // const [nextPage, setNextPage] = useState<number | null>(null);
  // const [prevPage, setPrevPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const fetchAllTrades = async (showLoading = true) => {
    if (!user?.email) return;

    // Check for cached data and show immediately if available
    const cachedPage1 = sessionStorage.getItem("trades_page_1");
    let hasCache = false;

    if (cachedPage1) {
      try {
        let allCachedTrades = JSON.parse(cachedPage1);
        let i = 2;
        while (true) {
          const p = sessionStorage.getItem(`trades_page_${i}`);
          if (!p) break;
          allCachedTrades = [...allCachedTrades, ...JSON.parse(p)];
          i++;
        }
        setTrades(allCachedTrades);
        hasCache = true;
      } catch (e) {
        console.error("Cache parsing error:", e);
      }
    }

    // Only show loading spinner if requested AND no cache is available
    if (showLoading && !hasCache) {
      setLoading(true);
    }

    try {
      // Fetch Page 1 to get metadata (total_pages)
      const res1 = await apiRequest<ApiResponse>(
        "GET",
        `/api/user/client-history?user_email=${encodeURIComponent(user.email)}&page=1&page_size=${pageSize}&pair=all`
      );

      if (res1.status !== "success") {
        throw new Error(res1.status || "Failed to fetch trades");
      }

      const totalPages = res1.total_pages;
      let allFetchedTrades = [...(res1.data || [])];

      // Store page 1
      sessionStorage.setItem("trades_page_1", JSON.stringify(res1.data || []));

      // Fetch remaining pages (refreshing cache)
      const promises = [];
      for (let i = 2; i <= totalPages; i++) {
        const cachedPage = sessionStorage.getItem(`trades_page_${i}`);
        if (cachedPage) {
          promises.push(Promise.resolve(JSON.parse(cachedPage)));
        } else {
          promises.push(
            apiRequest<ApiResponse>(
              "GET",
              `/api/user/client-history?user_email=${encodeURIComponent(user.email)}&page=${i}&page_size=${pageSize}&pair=all`
            ).then((res) => {
              if (res.status === 'success') {
                sessionStorage.setItem(`trades_page_${i}`, JSON.stringify(res.data || []));
                return res.data || [];
              }
              return [];
            })
          );
        }
      }

      const restData = await Promise.all(promises);
      restData.forEach((pageData) => {
        allFetchedTrades = [...allFetchedTrades, ...pageData];
      });

      setTrades(allFetchedTrades);
    } catch (error) {
      console.error("Error fetching trade history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTrades();

    // Set up 15-minute polling
    const POLLING_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
    const intervalId = setInterval(() => {
      console.log("Polling for latest trade data...");
      fetchAllTrades(false); // background refresh, don't show loading spinner
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [user?.email]);


  const filteredTrades = trades.filter((trade) => {
    try {
      const tradeDate = new Date(trade.entry_time);
      const matchesSymbol = symbol === "all" || (trade.symbol && trade.symbol.toLowerCase().includes(symbol.toLowerCase()));
      const matchesSide = side === "all" || (trade.position && trade.position.toLowerCase() === side.toLowerCase());
      const afterStartDate = !startDate || tradeDate >= new Date(new Date(startDate).setHours(0, 0, 0, 0));
      const beforeEndDate = !endDate || tradeDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999));

      return matchesSymbol && matchesSide && afterStartDate && beforeEndDate;
    } catch (error) {
      console.error("Error filtering trade:", trade, error);
      return false;
    }
  });


  // Calculate pagination
  const totalItems = filteredTrades.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedTrades = filteredTrades.slice((page - 1) * pageSize, page * pageSize);


  const formatDateForDisplay = (date: Date | null, formatStr: string = 'MMM d, yyyy'): string => {
    if (!date) return 'Pick a date';
    return format(date, formatStr);
  };

  const applyFilters = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPage(1);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setTempStartDate(null);
    setTempEndDate(null);
    setSymbol("all");
    setSide("all");
    setPage(1);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-[#2d3139]">
      <Sidebar />
      <div className="flex-1 md:ml-[14rem]">
        <Header />
        <Lowheader />

        <div className="min-h-screen bg-gray-50 dark:bg-[#2d3139] p-6">
          <div className="max-w-8xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-6">
              History
            </h1>

            {/* Filters */}
            <div className="flex flex-wrap justify-between rounded-lg gap-4 items-center mb-6">
              {/* Start Date */}
              <div className="flex items-center gap-2">
                <span className="text-md text-gray-600 dark:text-gray-200">Start Date</span>
                <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-60 justify-center text-center font-normal bg-card text-foreground hover:bg-muted hover:text-foreground">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span className="truncate">
                        {formatDateForDisplay(tempStartDate)}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={tempStartDate || undefined}
                      onSelect={(date) => {
                        setTempStartDate(date ?? null);
                        // If end date is before new start date, clear it
                        if (date && tempEndDate && date > tempEndDate) {
                          setTempEndDate(null);
                        }
                        setIsStartOpen(false);
                      }}
                      initialFocus
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="flex items-center gap-2">
                <span className="text-md text-gray-600 dark:text-gray-200">End Date</span>
                <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-60 justify-center text-center font-normal bg-card text-foreground hover:bg-muted hover:text-foreground">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span className="truncate">
                        {formatDateForDisplay(tempEndDate)}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={tempEndDate || undefined}
                      onSelect={(date) => {
                        if (tempStartDate && date && date < tempStartDate) {
                          toast({
                            title: "Invalid Date Range",
                            description: "End date must be after start date",
                            variant: "destructive",
                          });
                          return;
                        }
                        setTempEndDate(date ?? null);
                        setIsEndOpen(false);
                      }}
                      initialFocus
                      disabled={(date) => (tempStartDate ? date < tempStartDate : false) || date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Symbol */}
              <div className="flex items-center gap-2">
                <span className="text-md text-gray-600 dark:text-gray-200">Symbol</span>
                <Select value={symbol} onValueChange={(val) => {
                  setSymbol(val);
                  setPage(1);
                }}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Side not needed */}
              {/* <div className="flex items-center gap-2">
                <span className="text-md text-gray-600 dark:text-gray-200">Side</span>
                <Select value={side} onValueChange={setSide}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              <Button
                className="bg-[#1a785f] hover:bg-[#1e896d] text-primary-foreground text-md font-semibold"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>

              <Button
                className="bg-black/40 hover:bg-red-600 text-primary-foreground text-md font-semibold"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#06a57f]">
              <table className="w-full text-md text-left">
                <thead className="bg-[#06a57f] text-primary-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order Time</th>
                    <th className="py-3 px-4">Position</th>
                    <th className="py-3 px-4">
                      <div className="flex items-center">
                        Quantity
                        <span className="relative group ml-[16px] mb-1 inline-block align-middle">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 mt-1 cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  1 Quantity
                                  <br />
                                  0.01 ETH
                                  <br />
                                  0.001 BTC
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                      </div>
                    </th>
                    <th className="py-3 px-4">Entry Price</th>
                    <th className="py-3 px-4">Exit Price</th>
                    <th className="py-3 px-4 text-right">Pnl</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-muted-foreground">
                          <Loader2 className="h-8 w-8 animate-spin text-[#06a57f]" />
                          <span className="text-sm font-medium">Fetching trade history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedTrades.length > 0 ? (
                    paginatedTrades.map((trade, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-muted"
                      >
                        <td className="py-3 px-4 text-gray-700 dark:text-foreground font-medium">
                          {format(new Date(trade.entry_time), "yyyy-MM-dd")}
                          <br />
                          <span className="text-gray-500 dark:text-muted-foreground text-[14px]">
                            {format(new Date(trade.entry_time), "HH:mm:ss")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div
                              className={`w-1 h-8 rounded-full mr-3 ${trade.position === "long" ? "bg-green-500" : "bg-red-500"
                                }`}
                            ></div>
                            <div>
                              <div className="font-medium text-gray-800 dark:text-foreground">
                                {trade.symbol}
                              </div>
                              <div
                                className={`text-[14px] ${trade.position === "long" ? "text-green-600" : "text-red-600"
                                  }`}
                              >
                                {trade.position.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-foreground">
                          {trade.qty.toFixed(3)} {trade.symbol}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-foreground">
                          {trade.entry_price}
                        </td>
                        <td className="py-3 px-4">
                          {trade.exit_price}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-foreground text-right">
                          {trade.currency === "INR" ? '₹' : '$'} {trade.pnl}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-4 text-center text-gray-500 dark:text-muted-foreground"
                      >
                        No trades found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end pt-4">
              <Button
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="bg-[#1a785f] hover:bg-[#1e896d] text-primary-foreground"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <span className="mx-4 text-sm font-medium text-gray-700 dark:text-muted-foreground">
                Page {page} of {totalPages || 1}
              </span>

              <Button
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="bg-[#1a785f] hover:bg-[#1e896d] text-primary-foreground"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}