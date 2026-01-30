"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

interface CustomThemeContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CustomThemeContext = createContext<CustomThemeContextValue | undefined>(undefined);

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider = ({ children }: CustomThemeProviderProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  const value: CustomThemeContextValue = {
    isOpen,
    open,
    close,
    toggle,
  };

  return <CustomThemeContext.Provider value={value}>{children}</CustomThemeContext.Provider>;
};

export const useCustomTheme = (): CustomThemeContextValue => {
  const context = useContext(CustomThemeContext);
  if (context === undefined) {
    throw new Error("useCustomTheme must be used within a CustomThemeProvider");
  }
  return context;
};
