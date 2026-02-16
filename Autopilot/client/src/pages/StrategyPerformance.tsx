import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Lowheader from '@/components/Lowheader'
import {
  ChartColumnBig,
  Smile,
  Frown,
  TrendingUp,
  TrendingDown,
  Wallet,
  HelpCircle,
  Loader2,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { apiRequest } from '@/lib/queryClient';
import NoPositionFound from "@/assets/undraw_no_open_positions_found.svg";

interface StrategyPerformance {
  strategy_name: string;
  current_status: string;
  total_trades: number;
  profit_trades: number;
  loss_trades: number;
  max_profit: number;
  max_loss: number;
  approx_pnl: number;
}

interface ApiResponse {
  email: string;
  strategies: StrategyPerformance[];
  total_strategies: number;
  message?: string;
}

export default function StrategyPerformance() {
  const [_, navigate] = useLocation();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterActive, setFilterActive] = useState<boolean>(false);

  useEffect(() => {
    // Check if user email exists in session storage
    const userEmail = sessionStorage.getItem('signupEmail');
    if (!userEmail) {
      navigate("/visitor");
      return;
    }
    fetchStrategyPerformance();
  }, []);

  // Fetch strategy performance
  const fetchStrategyPerformance = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get user email from sessionStorage or auth context
      const userEmail = sessionStorage.getItem('signupEmail') || '';

      if (!userEmail) {
        throw new Error('User email not found in session storage. Please log in again.');
      }

      // Build query parameters
      const params = new URLSearchParams({ email: userEmail });
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);

      console.log('Fetching strategy performance for email:', userEmail, 'with dates:', { start, end });
      const result: ApiResponse = await apiRequest('GET', `/api/strategy-performance?${params.toString()}`);

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch strategy performance');
    } finally {
      setLoading(false);
    }
  };

  // Handle date filter
  const handleFilter = () => {
    if (startDate || endDate) {
      setFilterActive(true);
      fetchStrategyPerformance(startDate, endDate);
    }
  };

  // Clear date filter
  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilterActive(false);
    fetchStrategyPerformance();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(Math.abs(value));
  };

  const getStrategyColor = (strategyName: string) => {
    const colors = ['#06a57f', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
    const hash = strategyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50 dark:bg-[#2d3139]">
        <Sidebar />
        <div className="flex-1 md:ml-[14rem] flex flex-col">
          <Header />
          <Lowheader />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary-medium" />
              <span className="ml-2 text-body">Loading strategy performance...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50 dark:bg-[#2d3139]">
        <Sidebar />
        <div className="flex-1 md:ml-[14rem] flex flex-col">
          <Header />
          <Lowheader />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">Error: {error}</p>
              <button
                onClick={() => fetchStrategyPerformance()}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!data || data.strategies.length === 0) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50 dark:bg-[#2d3139]">
        <Sidebar />
        <div className="flex-1 md:ml-[14rem] flex flex-col">
          <Header />
          <Lowheader />
          <main className="flex-1 overflow-y-auto p-4">
            <div className="p-6 mt-24 flex flex-col items-center justify-center h-64 space-y-4">
              <img
                src={NoPositionFound}
                className="h-40 w-auto"
                alt="No strategy data found image"
              />
              <p className="text-gray-500 dark:text-foreground">
                No strategy data found
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50 dark:bg-[#2d3139]">
      <Sidebar />
      <div className="flex-1 md:ml-[14rem] flex flex-col">
        <Header />
        <div className="hidden md:block"><Lowheader /></div>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h1 className={`text-xl md:text-2xl font-semibold dark:text-foreground`}>
              Strategy Performance
            </h1>
            <p className="text-sm md:text-body mt-2">
              You can check your strategy's overall performance here.
            </p>
          </div>

          {data.strategies
            .filter((strategy) => strategy.strategy_name === "Bitron")
            .map((strategy) => (
              <div
                key={strategy.strategy_name}
                className="w-full max-w-4xl p-4 sm:p-6 bg-white dark:bg-[#17181d] rounded-lg shadow-md border mb-6"
              >
                <div>
                  <div
                    className={`${strategy.current_status
                      ? "bg-green-200 text-green-700"
                      : "bg-red-200 text-red-700"
                      } py-1 w-14 text-center rounded-full uppercase shadow-md text-xs md:text-sm font-semibold border`}
                  >
                    {strategy.current_status === "active" ? "Live" : "Inactive"}
                  </div>

                  <h5 className="text-xl md:text-2xl font-semibold text-heading text-center mb-1">
                    {strategy.strategy_name}
                    <span className="bg-[#06a57f] text-white text-xs md:text-sm px-2 py-1 ml-2 rounded-full tracking-wide">
                      {strategy.strategy_name == "Bitron" ? "BTC" : "ETH"}
                    </span>
                  </h5>
                </div>

                <div className="border-t-2 border-gray-200 dark:border-gray-700 my-4"></div>

                {/* Date Filter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-body mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e222d] text-heading focus:ring-2 focus:ring-primary-medium focus:border-transparent"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-body mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e222d] text-heading focus:ring-2 focus:ring-primary-medium focus:border-transparent"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleFilter}
                      disabled={!startDate && !endDate}
                      className="flex-1 px-4 py-2 bg-[#06a57f] text-white rounded-lg hover:bg-[#06a57f]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply Filter
                    </button>
                    {filterActive && (
                      <button
                        onClick={clearFilter}
                        className="px-4 py-2 text-white border border-red-300 rounded-lg bg-red-600 hover:bg-red-600/80 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 dark:border-gray-700 my-4"></div>

                <ul className="mb-6 space-y-3">
                  <li className="bg-gray-100 dark:bg-[#1e222d] border border-gray-200 dark:border-[#2d3139] hover:bg-gray-200 dark:hover:bg-[#1e222d]/80 rounded-lg">
                    <a
                      href="#"
                      className="flex items-center p-3 text-lg font-semibold text-heading rounded-base bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium group"
                    >
                      <ChartColumnBig className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="flex-1 ms-3 whitespace-nowrap text-sm md:text-lg">
                        Total Trades
                      </span>
                      <span className="bg-neutral-primary-soft text-heading text-sm md:text-md font-normal px-1.5 py-0.5">
                        {strategy.total_trades}
                      </span>
                    </a>
                  </li>
                  <li className="bg-gray-100 dark:bg-[#1e222d] border border-gray-200 dark:border-[#2d3139] hover:bg-gray-200 dark:hover:bg-[#1e222d]/80 rounded-lg">
                    <a
                      href="#"
                      className="flex items-center p-3 text-lg font-semibold text-heading rounded-base bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium group"
                    >
                      <Smile className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="flex-1 ms-3 whitespace-nowrap text-sm md:text-lg">
                        Winning Trades
                      </span>
                      <span className="bg-neutral-primary-soft text-heading text-sm md:text-md font-normal px-1.5 py-0.5">
                        {strategy.profit_trades}
                      </span>
                    </a>
                  </li>
                  <li className="bg-gray-100 dark:bg-[#1e222d] border border-gray-200 dark:border-[#2d3139] hover:bg-gray-200 dark:hover:bg-[#1e222d]/80 rounded-lg">
                    <a
                      href="#"
                      className="flex items-center p-3 text-lg font-semibold text-heading rounded-base bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium group"
                    >
                      <Frown className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="flex-1 ms-3 whitespace-nowrap text-sm md:text-lg">
                        Losing Trades
                      </span>
                      <span className="bg-neutral-primary-soft text-heading text-sm md:text-md font-normal px-1.5 py-0.5">
                        {strategy.loss_trades}
                      </span>
                    </a>
                  </li>
                  <li className="bg-gray-100 dark:bg-[#1e222d] border border-gray-200 dark:border-[#2d3139] hover:bg-gray-200 dark:hover:bg-[#1e222d]/80 rounded-lg">
                    <a
                      href="#"
                      className="flex items-center p-3 text-lg font-semibold text-heading rounded-base bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium group"
                    >
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="flex-1 ms-3 whitespace-nowrap text-sm md:text-lg">
                        Max Profit
                      </span>
                      <span className="bg-neutral-primary-soft text-heading text-md font-normal px-1.5 py-0.5">
                        {strategy.max_profit > 0 ? "+" : ""}
                        {formatCurrency(strategy.max_profit)}
                      </span>
                    </a>
                  </li>
                  <li className="bg-gray-100 dark:bg-[#1e222d] border border-gray-200 dark:border-[#2d3139] hover:bg-gray-200 dark:hover:bg-[#1e222d]/80 rounded-lg">
                    <a
                      href="#"
                      className="flex items-center p-3 text-lg font-semibold text-heading rounded-base bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium group"
                    >
                      <TrendingDown className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="flex-1 ms-3 whitespace-nowrap text-sm md:text-lg">
                        Max Loss
                      </span>
                      <span className="bg-neutral-primary-soft text-heading text-sm md:text-md font-normal px-1.5 py-0.5">
                        {strategy.max_loss < 0 ? "-" : ""}
                        {formatCurrency(strategy.max_loss)}
                      </span>
                    </a>
                  </li>
                  <li className="bg-gray-100 dark:bg-[#1e222d] border border-gray-200 dark:border-[#2d3139] hover:bg-gray-200 dark:hover:bg-[#1e222d]/80 rounded-lg">
                    <a
                      href="#"
                      className="flex items-center p-3 text-lg font-semibold text-heading rounded-base bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium group"
                    >
                      <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="flex-1 ms-3 whitespace-nowrap text-sm md:text-lg">
                        Approx PnL
                      </span>
                      <span
                        className={`bg-neutral-primary-soft text-heading text-sm md:text-md font-normal px-1.5 py-0.5 ${strategy.approx_pnl > 0
                          ? "text-[#06a57f]"
                          : "text-red-600"
                          }`}
                      >
                        {strategy.approx_pnl > 0 ? "+" : "-"}
                        {formatCurrency(strategy.approx_pnl)}
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            ))}

          <div className="w-full max-w-4xl p-4 sm:p-6 bg-white dark:bg-[#17181d] rounded-lg shadow-md border">
            <div>
              <span className="inline-flex items-start md:items-center text-xs md:text-sm text-body tracking-normal">
                <HelpCircle className="w-4 h-4 mr-1.5" />
                This is not an exact PnL. To check your exact PnL click on the
                link.
              </span>
              <a
                href="https://coindcx.com/stats/futures/positions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-medium underline hover:text-blue-600 ml-2 text-xs md:text-sm"
              >
                https://coindcx.com/stats/futures/positions
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
