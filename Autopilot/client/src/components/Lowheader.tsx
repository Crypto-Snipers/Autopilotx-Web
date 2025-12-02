import React, { useEffect, useState } from "react";
import { Menu, Phone, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CoinDCXTicker {
  market: string;
  change_24_hour: string;
  high: string;
  low: string;
  volume: string;
  last_price: string;
  bid: string;
  ask: string;
  timestamp: number;
}

export default function Lowheader() {
  const { user } = useAuth();

  useEffect(() => {

  }, [user]);

  interface CryptoPrice {
    symbol: string;
    price: number;
    change: number;
  }

  const { data: cryptoPrices = [], isLoading, error } = useQuery<CryptoPrice[]>({
    queryKey: ["cryptoPrices"],
    queryFn: async () => {
      try {
        const response = await fetch('https://api.coindcx.com/exchange/ticker');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: CoinDCXTicker[] = await response.json();
        
        // Filter and transform the data to match our expected format
        const btcData = data.find(item => item.market === 'BTCINR');
        const ethData = data.find(item => item.market === 'ETHINR');
        const solData = data.find(item => item.market === 'SOLINR');
        
        return [
          { 
            symbol: 'BTC', 
            price: btcData ? parseFloat(btcData.last_price) : 0, 
            change: btcData ? parseFloat(btcData.change_24_hour) : 0 
          },
          { 
            symbol: 'ETH', 
            price: ethData ? parseFloat(ethData.last_price) : 0, 
            change: ethData ? parseFloat(ethData.change_24_hour) : 0 
          },
          { 
            symbol: 'SOL', 
            price: solData ? parseFloat(solData.last_price) : 0, 
            change: solData ? parseFloat(solData.change_24_hour) : 0 
          }
        ];
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        return [
          { symbol: 'BTC', price: 0, change: 0 },
          { symbol: 'ETH', price: 0, change: 0 },
          { symbol: 'SOL', price: 0, change: 0 }
        ];
      }
    },
    refetchInterval: 15000, // 15 seconds - half of the cache time
    refetchIntervalInBackground: true,
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
  });

  return (
    // <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-6 bg-gray-200 opacity-90 rounded-md py-3 overflow-hidden">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-6 bg-gray-200 dark:bg-gray-700 opacity-90 rounded-b-lg py-3 overflow-hidden">
      {/* Crypto Data */}
      <div className="overflow-x-auto whitespace-nowrap text-sm sm:text-base md:text-base flex items-center gap-4">
        <span className="font-bold text-[#1a785f] dark:text-[#02b589]">Crypto</span>
        {cryptoPrices?.map((crypto) => (
          <span key={crypto.symbol} className="font-mono inline-flex items-center gap-1 text-[#1a785f] dark:text-white">
            {crypto.symbol}:
            {/* <span className={crypto.change >= 0 ? "text-green-600 dark:text-[#00ed64]" : "text-red-500"}> */}
            <span className={crypto.change >= 0 ? "text-[#06a57f] dark:text-[#06a57f]" : "text-[#06a57f]"}>
              {crypto.price.toFixed(2)} ({crypto.change >= 0 ? "+" : ""}
              {crypto.change.toFixed(2)}%)
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


