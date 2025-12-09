import React, { useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";

interface CoinDCXTicker {
  market: string;
  change_24_hour: string;
  last_price: string;
}

export default function Lowheader() {
  const { user } = useAuth();

  useEffect(() => {}, [user]);

  interface CryptoPrice {
    symbol: string;
    price: number;
    change: number;
  }

  const { data: cryptoPrices = [] } = useQuery<CryptoPrice[]>({
    queryKey: ["cryptoPrices"],
    queryFn: async () => {
      try {
        const response = await fetch("https://api.coindcx.com/exchange/ticker");
        const data: CoinDCXTicker[] = await response.json();

        const btcData = data.find((item) => item.market === "BTCINR");
        const ethData = data.find((item) => item.market === "ETHINR");
        const solData = data.find((item) => item.market === "SOLINR");

        return [
          { symbol: "BTC", price: btcData ? parseFloat(btcData.last_price) : 0, change: btcData ? parseFloat(btcData.change_24_hour) : 0 },
          { symbol: "ETH", price: ethData ? parseFloat(ethData.last_price) : 0, change: ethData ? parseFloat(ethData.change_24_hour) : 0 },
          { symbol: "SOL", price: solData ? parseFloat(solData.last_price) : 0, change: solData ? parseFloat(solData.change_24_hour) : 0 },
        ];
      } catch {
        return [
          { symbol: "BTC", price: 0, change: 0 },
          { symbol: "ETH", price: 0, change: 0 },
          { symbol: "SOL", price: 0, change: 0 },
        ];
      }
    },
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-2 sm:px-4 md:px-6 bg-gray-200 dark:bg-gray-700 opacity-90 rounded-b-lg py-2">
      {/* Crypto Data */}
      <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs md:text-sm items-center w-full md:w-auto">
        <span className="font-bold text-[#1a785f] dark:text-[#02b589]">Crypto</span>
        {cryptoPrices?.map((crypto) => (
          <span key={crypto.symbol} className="font-mono inline-flex items-center gap-1 text-[#1a785f] dark:text-white">
            {crypto.symbol}:{" "}
            <span className={crypto.change >= 0 ? "text-[#06a57f] dark:text-[#06a57f]" : "text-red-500"}>
              {crypto.price.toFixed(0)} ({crypto.change >= 0 ? "+" : ""}
              {crypto.change.toFixed(1)}%)
            </span>
          </span>
        ))}
      </div>

      {/* Contact Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-[10px] sm:text-xs md:text-sm mt-1 md:mt-0">
        <a
          href="mailto:support@autopilotx.in"
          className="text-[#1a785f] dark:text-white hover:text-[#1a785f]/80 flex items-center"
        >
          <MessageSquare className="w-4 h-4 mr-1 text-[#1a785f] dark:text-white" />
          support@autopilotx.in
        </a>
      </div>
    </div>
  );
}
