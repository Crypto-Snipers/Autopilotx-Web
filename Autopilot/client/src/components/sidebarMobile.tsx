import React, { useEffect } from "react";
import Sidebar from "./Sidebar"; // optional (don’t render the desktop aside)
import { X } from "lucide-react";

type Props = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode; // sidebar content (nav items)
};

export default function SidebarMobile({ open, onClose, children }: Props) {
    // Prevent background scroll when drawer open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // ESC to close
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] md:hidden">
            {/* Backdrop */}
            <button
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-label="Close sidebar backdrop"
            />

            {/* Drawer */}
            <div className="absolute left-0 top-0 h-full w-[85%] max-w-[280px] bg-background shadow-2xl border-r border-border">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="font-semibold text-foreground">Menu</div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Actual sidebar content */}
                <div className="h-[calc(100%-56px)] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
