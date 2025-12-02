// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to safely get theme from localStorage
const getStoredTheme = (): Theme | null => {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem('theme') as Theme | null;
    } catch (error) {
        console.warn('Could not access localStorage:', error);
        return null;
    }
};

// Helper function to safely set theme in localStorage
const setStoredTheme = (theme: Theme): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('theme', theme);
    } catch (error) {
        console.warn('Could not save theme preference:', error);
    }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Initialize with a default theme that will be updated in useEffect
    const [theme, setTheme] = useState<Theme>('dark');
    const [isMounted, setIsMounted] = useState(false);

    // Initialize theme on mount
    useEffect(() => {
        const storedTheme = getStoredTheme();
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
        
        setTheme(initialTheme);
        setIsMounted(true);
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (!getStoredTheme()) { // Only update if no explicit theme is set
                setTheme(mediaQuery.matches ? 'dark' : 'light');
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Apply theme class to root element
    useEffect(() => {
        const root = window.document.documentElement;
        // Remove both classes first to prevent conflicts
        root.classList.remove('light', 'dark');
        // Add the current theme class
        root.classList.add(theme);
        // Save to localStorage
        setStoredTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Prevent rendering children until theme is initialized
    if (!isMounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};