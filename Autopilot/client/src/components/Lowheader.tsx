"use client";

import { useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CryptoPrice {
  symbol: string;
  price: number;
  change: number;
}

const fetchCryptoData = async (
  symbol: string
): Promise<{ price: number; change: number }> => {
  try {
    const response = await fetch(
      `https://api.autopilotx.in/api/ohlcv/${symbol}-USDT?interval=1m&limit=100`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Handle your API response format
    if (Array.isArray(data) && data.length > 0) {
      // Parse strings to numbers using parseFloat
      const first = parseFloat(data[0][4]); // close price of first candle
      const last = parseFloat(data[data.length - 1][4]); // close price of last candle

      const price = last;
      const change = ((last - first) / first) * 100;

      return { price, change };
    }

    return { price: 0, change: 0 };
  } catch (error) {
    console.error(`Error fetching ${symbol} data:`, error);
    return { price: 0, change: 0 };
  }
};

export default function Lowheader() {
  const { user } = useAuth();

  useEffect(() => { }, [user]);

  const {
    data: cryptoPrices = [],
    isLoading,
    error,
  } = useQuery<CryptoPrice[]>({
    queryKey: ["cryptoPrices"],
    queryFn: async () => {
      const [btcData, ethData, solData] = await Promise.all([
        fetchCryptoData("BTC"),
        fetchCryptoData("ETH"),
        fetchCryptoData("SOL"),
      ]);

      return [
        { symbol: "BTC", price: btcData.price, change: btcData.change },
        { symbol: "ETH", price: ethData.price, change: ethData.change },
        { symbol: "SOL", price: solData.price, change: solData.change },
      ];
    },
    refetchInterval: 300000, // 5 minutes
    refetchIntervalInBackground: true,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-6 bg-gray-200 dark:bg-gray-700 opacity-90 rounded-b-lg py-3 overflow-hidden">
      {/* Crypto Data */}
      <div className="overflow-x-auto whitespace-nowrap text-sm sm:text-base md:text-base flex items-center gap-4">
        <span className="font-bold text-[#1a785f] dark:text-[#02b589]">Crypto</span>
        {cryptoPrices?.map((crypto) => (
          <span key={crypto.symbol} className="font-mono inline-flex items-center gap-1 text-[#1a785f] dark:text-white">
            {crypto.symbol}:
            <span className={crypto.change >= 0 ? "text-[#06a57f] dark:text-[#06a57f]" : "text-[#ff3737] dark:text-[#ff3737]"}>
              {typeof crypto.price === 'number' && !isNaN(crypto.price) ? crypto.price.toFixed(2) : '0.00'} ({crypto.change >= 0 ? "+" : ""}
              {typeof crypto.change === 'number' && !isNaN(crypto.change) ? crypto.change.toFixed(2) : '0.00'}%)
            </span>
          </span>
        ))}
      </div>
      {/* Contact Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
        <a
          href="mailto:support@autopilotx.in"
          className="text-[#1a785f] dark:text-white hover:text-[#1a785f]/80 flex items-center"
        >
          <MessageSquare className="w-4 h-4 mr-1 mt-2 text-[#1a785f] dark:text-white" />
          support@autopilotx.in
        </a>
      </div>
    </div>
  );
}