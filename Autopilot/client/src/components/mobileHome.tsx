import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import Lowheader from "@/components/Lowheader";
import TradingGreetingCard from "@/components/TradingGreetingCard";
import { apiRequest } from "@/lib/queryClient";
import DeployedStrategies from "@/components/DeployedStrategies";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { TrendingUp } from "lucide-react";
import CryptoMarketOverview from "./CryptoMarketOverview";

type MobileHomeProps = {
    userName?: string;
    brokerIsActive?: string;
    brokerName?: string;

    runAllEnabled: boolean;
    isLoadingDeactivate: boolean;
    isManuallyRefreshing: boolean;

    formatBalanceDisplay: () => string;
    getTotalBalanceForColor: () => number;
    handleRefreshBalance: () => void;

    email?: string;
    apiRequest: (method: "GET" | "POST" | "PUT" | "DELETE", url: string, data?: any) => Promise<any>;
    queryClient: any;
    toast: (x: any) => void;

    setRunAllEnabled: (v: boolean) => void;
    setIsLoadingDeactivate: (v: boolean) => void;
};

export default function MobileHome(props: MobileHomeProps) {
    const {
        userName,
        brokerIsActive,
        brokerName,
        runAllEnabled,
        isLoadingDeactivate,
        isManuallyRefreshing,
        formatBalanceDisplay,
        getTotalBalanceForColor,
        handleRefreshBalance,
        email,
        apiRequest,
        queryClient,
        toast,
        setRunAllEnabled,
        setIsLoadingDeactivate,
    } = props;

    return (
        <div className="min-h-screen">
            {/* If you want header on mobile too */}
            <Header />
            {/* <Lowheader /> */}

            <div className="mt-3 px-2 space-y-4">
                {/* Greeting / Summary Card */}
                <Card className="w-full bg-white/90 dark:bg-background border-0 shadow-md rounded-xl">
                    <CardContent className="p-4 space-y-4">
                        <div className="space-y-1">
                            <h1 className="font-[500] text-2xl font-poppins text-gray-900 dark:text-white">
                                Hi, {userName || "User"}!
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Hey, Trade Intelligently. Execute Instantly. Grow Confidently.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-500 dark:text-gray-300">Total Value</div>
                            {isManuallyRefreshing ? (
                                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <div
                                    className={`text-2xl font-bold ${getTotalBalanceForColor() > 0
                                        ? "text-[#06a57f]"
                                        : getTotalBalanceForColor() < 0
                                            ? "text-red-600"
                                            : "text-[#06a57f]"
                                        }`}
                                >
                                    {formatBalanceDisplay()}
                                </div>
                            )}
                        </div>

                        {/* Broker + Controls block */}
                        <div className="bg-[#DCE6FF] dark:bg-muted rounded-xl p-3 space-y-4">
                            {/* Broker name/logo */}
                            <div className="flex items-center justify-between">
                                {brokerName === "delta_exchange" ? (
                                    <div className="w-[160px] overflow-hidden">
                                        {/* reuse your svg here */}
                                        {/* <DeltaLogoSvg className="..." /> */}
                                    </div>
                                ) : (
                                    <span className="font-bold text-[22px] select-none whitespace-nowrap">
                                        <span className="text-[#2c4166ff] dark:text-white" style={{ fontFamily: "Poppins, Arial, sans-serif", letterSpacing: "-0.04em" }}>
                                            Coin
                                        </span>
                                        <span style={{ color: "#FF4D23", fontFamily: "Poppins, Arial, sans-serif", letterSpacing: "-0.04em" }}>
                                            DCX
                                        </span>
                                    </span>
                                )}
                            </div>

                            {/* Deactivate All */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#06a57f] rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Deactivate All</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`${!runAllEnabled ? "text-[#06a57f] font-medium" : "text-[#06a57f]"}`}>off</span>

                                    {isLoadingDeactivate ? (
                                        <div className="w-10 h-5 flex items-center justify-center">
                                            <div className="w-4 h-4 border-2 border-[#11a152] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Switch
                                                    checked={runAllEnabled}
                                                    className="data-[state=checked]:bg-[#11a152]"
                                                    disabled={isLoadingDeactivate}
                                                />
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirm Deactivation</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to deactivate all strategies?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={async () => {
                                                            try {
                                                                setIsLoadingDeactivate(true);
                                                                const response = await apiRequest(
                                                                    "GET",
                                                                    `/api/strategy/deactivate-all?email=${encodeURIComponent(email || "")}`
                                                                );

                                                                setRunAllEnabled(true);

                                                                toast({
                                                                    title: response?.message || "Success",
                                                                    description: response?.message || "Strategies deactivated successfully",
                                                                });

                                                                await queryClient.invalidateQueries({ queryKey: ["/deployed-strategies", email] });

                                                                setTimeout(() => setRunAllEnabled(false), 1000);
                                                            } catch (error: any) {
                                                                toast({
                                                                    title: "Error",
                                                                    description: error.response?.data?.detail || "Failed to deactivate strategies",
                                                                    variant: "destructive",
                                                                });
                                                                setRunAllEnabled(false);
                                                            } finally {
                                                                setIsLoadingDeactivate(false);
                                                            }
                                                        }}
                                                        disabled={isLoadingDeactivate}
                                                    >
                                                        {isLoadingDeactivate ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            "Deactivate All"
                                                        )}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}

                                    <span className={`${runAllEnabled ? "text-[#11a152] font-medium" : "text-gray-600"}`}>on</span>
                                </div>
                            </div>

                            {/* Balance button full width */}
                            <button
                                type="button"
                                onClick={handleRefreshBalance}
                                className="group w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#74d47742] text-[#06a57f] font-semibold hover:bg-[#06a57f]/80 hover:text-white transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="transition-transform duration-500 ease-in-out group-hover:rotate-180"
                                >
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                                    <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                                </svg>
                                Balance
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Deployed Strategies */}
                <div className="w-full">
                    <DeployedStrategies />
                </div>

                <div className="w-full">
                    <CryptoMarketOverview />
                </div>
            </div>
        </div>
    );
}
