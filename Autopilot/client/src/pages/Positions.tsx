"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Lowheader from "@/components/Lowheader";
import { useTheme } from "@/context/ThemeContext";
import NoPositionFound from "@/assets/undraw_no_open_positions_found.svg"

interface Position {
  positionId?: string;
  symbol: string;
  positionSide: "LONG" | "SHORT";
  positionAmt: string;
  avgPrice: string;
  ltp: string;
  leverage: number;
  unrealizedProfit: string;
}

function PositionRow({ position }: { position: Position }) {
  const unrealizedProfit = parseFloat(position.unrealizedProfit || "0");
  const isProfit = unrealizedProfit >= 0;
  const pnlClass = isProfit ? "text-green-500" : "text-red-400";

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-muted transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center">
          <div className="w-1 h-8 bg-green-500 mr-2 rounded-sm"></div>
          <div>
            <div className="text-foreground font-medium">{position.symbol}</div>
            <div className="text-sm text-green-600">
              Isolated {position.leverage}x
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-foreground font-medium">
          {position.positionSide}
        </span>
      </td>
      <td className="py-3 px-4 text-foreground">
        {parseFloat(position.positionAmt).toFixed(5)} {position.symbol.split("-")[0]}
      </td>
      <td className="py-3 px-4 text-foreground">{position.avgPrice}</td>
      <td className="py-3 px-4 text-foreground">{position.ltp}</td>
      <td className="py-3 px-4">
        <div className={`${pnlClass} font-medium`}>
          {isProfit ? "+" : ""} ₹{unrealizedProfit.toFixed(4)}
        </div>
      </td>
    </tr>
  );
}

export default function Positions() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [_, navigate] = useLocation();

  // Check if user email exists in session storage
  useEffect(() => {
    const userEmail = sessionStorage.getItem('signupEmail');
    if (!userEmail) {
      navigate('/visitor');
      return;
    }
  }, []);
  const pollingIntervalRef = useRef<NodeJS.Timeout>();

  // Fetch positions from backend
  const fetchPositions = async () => {
    if (!user?.email) return [];

    const { data: { session }, error: sessionError } =
      await supabase.auth.getSession();

    if (!session || sessionError) {
      console.error("No active session or session error:", sessionError);
      throw new Error(sessionError?.message || "No active session");
    }

    const { apiRequest } = await import("@/lib/queryClient");

    try {
      console.log("Fetching positions for:", user.email);
      return await apiRequest(
        "GET",
        `/api/positions/live?email=${encodeURIComponent(user.email)}`
      );
    } catch (error) {
      console.error("Error fetching positions:", error);
      throw error;
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["positions", user?.email],
    queryFn: fetchPositions,
    enabled: !!user?.email,
    refetchOnWindowFocus: false,
    staleTime: 0,
    refetchInterval: 5000,
  });

  const positions: Position[] = Array.isArray(data) ? data : [];

  // Manual polling every 2s to ensure live updates
  useEffect(() => {
    if (positions && positions.length > 0) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

      pollingIntervalRef.current = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["positions", user?.email] });
      }, 2000);
    } else if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    return () => {
      if (pollingIntervalRef.current)
        clearInterval(pollingIntervalRef.current);
    };
  }, [positions, user?.email, queryClient]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50 dark:bg-[#2d3139]">
      <Sidebar />
      <div className="flex-1 md:ml-[14rem] flex flex-col">
        <Header />
        <div className="hidden md:block"><Lowheader /></div>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h1 className={`text-2xl font-semibold dark:text-foreground`}>
              Positions
            </h1>
          </div>

          {isLoading ? (
            <div className="p-6 flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">Loading positions...</p>
            </div>
          ) : positions.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-[#06a57f] shadow">
              <table className="w-full">
                <thead>
                  <tr
                    className={`text-left bg-[#05b289] text-white font-semibold`}
                  >
                    <th className="py-3 px-4">Contract</th>
                    <th className="py-3 px-4">Position</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4">Entry price</th>
                    <th className="py-3 px-4">Current price</th>
                    <th className="py-3 px-4">Unrealised P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <PositionRow key={pos.positionId || pos.symbol} position={pos} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center h-64 space-y-4">
              <img src={NoPositionFound} className="h-40 w-auto" alt="No open positions found image" />
              <p className="text-gray-500 dark:text-foreground">
                No open positions found
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
