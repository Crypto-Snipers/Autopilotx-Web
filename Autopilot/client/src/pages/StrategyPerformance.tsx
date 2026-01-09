import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Lowheader from '@/components/Lowheader'
import {
  ChartColumnBig,
  Award,
  Smile,
  Frown,
  TrendingUp,
  TrendingDown,
  Wallet,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { apiRequest } from '@/lib/queryClient';

interface StrategyPerformance {
  strategy_name: string;
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
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStrategyPerformance();
  }, []);

  // Fetch strategy performance
  const fetchStrategyPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user email from sessionStorage or auth context
      const userEmail = sessionStorage.getItem('signupEmail') || '';
      
      if (!userEmail) {
        throw new Error('User email not found in session storage. Please log in again.');
      }
      
      console.log('Fetching strategy performance for email:', userEmail);
      const result: ApiResponse = await apiRequest('GET', `/api/strategy-performance?email=${encodeURIComponent(userEmail)}`);
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch strategy performance');
    } finally {
      setLoading(false);
    }
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
                onClick={fetchStrategyPerformance}
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
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-heading mb-2">No Strategy Data</h2>
              <p className="text-body">
                {data?.message || "No deployed strategies found or no trading data available."}
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
        <Lowheader />

        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h1 className={`text-2xl font-semibold dark:text-foreground`}>
              Strategy Performance
            </h1>
            <p className="text-body mt-2">
              You can check your strategy's overall performance here.
            </p>
          </div>

          {data.strategies.map((strategy) => (
            <div
              key={strategy.strategy_name}
              className="w-full max-w-4xl p-4 sm:p-6 bg-white dark:bg-[#17181d] rounded-lg shadow-md border mb-6"
            >
              <h5 className="text-lg font-semibold text-heading mb-4">
                {strategy.strategy_name}
                <span className="bg-[#06a57f] text-white text-[11px] px-2 py-1 ml-2 rounded-full tracking-wide">
                  BTC
                </span>
              </h5>
              <ul className="mb-6 space-y-3">
                <li className="bg-gray-100 dark:bg-[#1e222d] border border-gray-200 dark:border-[#2d3139] hover:bg-gray-200 dark:hover:bg-[#1e222d]/80 rounded-lg">
                  <a
                    href="#"
                    className="flex items-center p-3 text-lg font-semibold text-heading rounded-base bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium group"
                  >
                    <ChartColumnBig className="w-6 h-6" />
                    <span className="flex-1 ms-3 whitespace-nowrap">
                      Total Trades
                    </span>
                    <span className="bg-neutral-primary-soft text-heading text-md font-normal px-1.5 py-0.5">
                      {strategy.total_trades}
                    </span>
                  </a>
                </li>
                <li className="bg-gray-100 dark:bg-[#1e222d] border border-gray-200 dark:border-[#2d3139] hover:bg-gray-200 dark:hover:bg-[#1e222d]/80 rounded-lg">
                  <a
                    href="#"
                    className="flex items-center p-3 text-lg font-semibold text-heading rounded-base bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium group"
                  >
                    <Smile className="w-6 h-6" />
                    <span className="flex-1 ms-3 whitespace-nowrap">
                      Winning Trades
                    </span>
                    <span className="bg-neutral-primary-soft text-heading text-md font-normal px-1.5 py-0.5">
                      {strategy.profit_trades}
                    </span>
                  </a>
                </li>
                <li className="bg-gray-100 dark:bg-[#1e222d] border border-gray-200 dark:border-[#2d3139] hover:bg-gray-200 dark:hover:bg-[#1e222d]/80 rounded-lg">
                  <a
                    href="#"
                    className="flex items-center p-3 text-lg font-semibold text-heading rounded-base bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium group"
                  >
                    <Frown className="w-6 h-6" />
                    <span className="flex-1 ms-3 whitespace-nowrap">
                      Losing Trades
                    </span>
                    <span className="bg-neutral-primary-soft text-heading text-md font-normal px-1.5 py-0.5">
                      {strategy.loss_trades}
                    </span>
                  </a>
                </li>
                <li className="bg-gray-100 dark:bg-[#1e222d] border border-gray-200 dark:border-[#2d3139] hover:bg-gray-200 dark:hover:bg-[#1e222d]/80 rounded-lg">
                  <a
                    href="#"
                    className="flex items-center p-3 text-lg font-semibold text-heading rounded-base bg-neutral-secondary-medium hover:bg-neutral-tertiary-medium group"
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="flex-1 ms-3 whitespace-nowrap">
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
                    <TrendingDown className="w-6 h-6" />
                    <span className="flex-1 ms-3 whitespace-nowrap">
                      Max Loss
                    </span>
                    <span className="bg-neutral-primary-soft text-heading text-md font-normal px-1.5 py-0.5">
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
                    <Wallet className="w-6 h-6" />
                    <span className="flex-1 ms-3 whitespace-nowrap">
                      Approx PnL
                    </span>
                    <span
                      className={`bg-neutral-primary-soft text-heading text-md font-normal px-1.5 py-0.5 ${
                        strategy.approx_pnl > 0
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
              <span className="inline-flex items-center text-sm text-body tracking-normal">
                <HelpCircle className="w-4 h-4 me-1.5" />
                This is not an exact PnL. To check your exact PnL click on the
                link.
              </span>
              <a
                href="https://coindcx.com/stats/futures/positions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-medium underline hover:text-blue-600 ml-2 text-sm"
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
