"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Lowheader from "@/components/Lowheader";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { apiRequest } from "@/lib/queryClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TradeData {
  CreatedAt: string;
  Side: string;
  Size: number;
  State: string;
  AverageFillPrice: string;
  PaidCommission: string;
  Symbol: string;
}

export default function History() {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [symbol, setSymbol] = useState("all");
  const [side, setSide] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const { user } = useAuth();
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [prevPage, setPrevPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientTrades = async () => {
    if (!user?.email) return [];

    setLoading(true);
    try {
      const res = await apiRequest<{
        status: string;
        count: number;
        data: TradeData[];
        page: number;
        next_page: number | null;
        previous_page: number | null;
        page_size: number;
      }>(
        "GET",
        `/api/user/client-history?email=${encodeURIComponent(
          user.email
        )}&page=${page}&page_size=${pageSize}`
      );

      if (res.status !== "success") throw new Error("Failed to fetch trades");

      setNextPage(res.next_page);
      setPrevPage(res.previous_page);
      setPage(res.page);
      return res.data;
    } catch (error) {
      console.error("Error fetching trade history:", error);
      setNextPage(null);
      setPrevPage(null);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientTrades().then(setTrades);
  }, [page, user?.email, pageSize]);

  const filteredTrades = trades.filter((trade) => {
    const tradeDate = new Date(trade.CreatedAt);
    return (
      (symbol === "all" || trade.Symbol.toLowerCase() === symbol) &&
      (side === "all" || trade.Side.toLowerCase() === side) &&
      (!startDate || tradeDate >= startDate) &&
      (!endDate || tradeDate <= endDate)
    );
  });

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSymbol("all");
    setSide("all");
  };

return (
  <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50 dark:bg-[#2d3139]">
    <Sidebar />

    {/* MAIN CONTENT */}
    <div className="flex-1 flex flex-col ml-0 md:ml-[14rem]">
      {/* ml-0 = no gap on mobile */}
      {/* md:ml-[14rem] = desktop sidebar space */}

      <Header />

      <div className="mt-0 md:mt-2">
        {/* Remove top gap on mobile */}
        <Lowheader /></div>

        <div className="min-h-screen bg-gray-50 dark:bg-[#2d3139] p-4 sm:p-6 flex-1">
          <div className="max-w-8xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-6">
              History
            </h1>

            {/* ---------- FILTERS GRID (RESPONSIVE) ---------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">

              {/* Start Date */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600 dark:text-gray-200">
                  Start Date
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-center bg-card text-foreground"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "MMM d, yyyy")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(date) => setStartDate(date ?? null)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600 dark:text-gray-200">
                  End Date
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-center bg-card text-foreground"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={(date) => setEndDate(date ?? null)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Symbol */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600 dark:text-gray-200">
                  Symbol
                </span>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="ethusd">ETHUSD</SelectItem>
                    <SelectItem value="btcusd">BTCUSD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Side */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600 dark:text-gray-200">
                  Side
                </span>
                <Select value={side} onValueChange={setSide}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex flex-col justify-end">
                <Button
                  className="bg-[#1a785f] hover:bg-[#1e896d] text-white font-semibold w-full"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* ---------- TABLE (MOBILE SCROLLABLE) ---------- */}
            <div className="overflow-x-auto rounded-2xl border border-[#06a57f]">
              <table className="w-full text-xs sm:text-sm md:text-md table-auto">
                <thead className="bg-[#00B894] text-white">
                  <tr className="text-xs">

                    <th className="px-2 py-2 font-semibold border-r border-white/20">Order Time</th>

                    <th className="px-2 py-2 font-semibold border-r border-white/20">Position</th>

                    <th className="px-2 py-2 font-semibold border-r border-white/20">
                      <div className="flex items-center gap-1">
                        Lot Size
                        <Info className="h-3 w-3" />
                      </div>
                    </th>

                    <th className="px-2 py-2 font-semibold border-r border-white/20">Executed Price</th>

                    <th className="px-2 py-2 font-semibold border-r border-white/20">Status</th>

                    <th className="px-2 py-2 font-semibold">Fee</th>

                  </tr>
                </thead>



                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-4 text-center text-gray-500 dark:text-gray-300"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : filteredTrades.length > 0 ? (
                    filteredTrades.map((trade, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-muted"
                      >
                        <td className="py-2 px-2 font-medium">
                          {format(new Date(trade.CreatedAt), "yyyy-MM-dd")}
                          <br />
                          <span className="text-gray-500 text-[12px]">
                            {format(new Date(trade.CreatedAt), "HH:mm:ss")}
                          </span>
                        </td>

                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1 h-6 rounded-full ${
                                trade.Side === "buy"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <div>
                              <div className="font-medium truncate max-w-[90px]">
                                {trade.Symbol}
                              </div>
                              <div
                                className={`text-[12px] ${
                                  trade.Side === "buy"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {trade.Side}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-2 font-medium">
                          {trade.Size.toFixed(2)}{" "}
                          <span className="text-gray-500">
                            {trade.Symbol.replace("USD", "")}
                          </span>
                        </td>

                        <td className="py-2 px-2 font-medium">
                          {parseFloat(trade.AverageFillPrice).toLocaleString()}
                        </td>

                        <td className="py-2 px-2">
                          <span
                            className={`px-2 py-1 text-[12px] rounded-full border ${
                              trade.State === "filled"
                                ? "bg-green-100 border-green-300 text-green-700"
                                : "bg-red-100 border-red-300 text-red-700"
                            }`}
                          >
                            {trade.State}
                          </span>
                        </td>

                        <td className="py-2 px-2 font-medium text-right">
                          {parseFloat(trade.PaidCommission).toFixed(2)}{" "}
                          <span className="text-gray-500">USDT</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-4 text-center text-gray-500 dark:text-gray-300"
                      >
                        No trades found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ---------- PAGINATION ---------- */}
            <div className="flex items-center justify-end pt-4 gap-2">
              <Button
                size="sm"
                disabled={!prevPage}
                onClick={() => prevPage && setPage(prevPage)}
                className="bg-[#1a785f] hover:bg-[#1e896d] text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <span className="mx-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {page}
              </span>

              <Button
                size="sm"
                disabled={!nextPage}
                onClick={() => nextPage && setPage(nextPage)}
                className="bg-[#1a785f] hover:bg-[#1e896d] text-white"
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
