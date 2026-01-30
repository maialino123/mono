"use client";

import { ChevronDown, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/shadcn/button";
import { Input } from "@/shared/shadcn/input";

// Popular Google Fonts
const POPULAR_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Source Sans Pro",
  "Nunito",
  "Playfair Display",
  "Merriweather",
  "Oswald",
  "Ubuntu",
  "Crimson Text",
  "Lora",
] as const;

export const FontSelect = () => {
  const { theme } = useTheme();
  const currentFont = theme === "dark" ? "Roboto" : "Inter";
  const [searchValue, setSearchValue] = useState<string>(currentFont);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredFonts = POPULAR_FONTS.filter((font) => font.toLowerCase().includes(searchValue.toLowerCase()));

  const handleFontChange = useCallback((font: string) => {
    setSearchValue(font);
    setIsOpen(false);
    inputRef.current?.blur();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    updateDropdownPosition();
  };

  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  const handleClear = () => {
    setSearchValue("");
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredFonts.length > 0) {
        handleFontChange(filteredFonts[0]);
      } else if (searchValue.trim()) {
        // Apply custom font name
        handleFontChange(searchValue.trim());
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Sync search value with current font when it changes externally
  useEffect(() => {
    setSearchValue(currentFont);
  }, [currentFont]);

  // Update dropdown position when opening or window resizes
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      const handleScroll = () => updateDropdownPosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Apply font when closing if search value is different
        if (searchValue.trim() && searchValue !== currentFont) {
          handleFontChange(searchValue.trim());
        } else if (!searchValue.trim()) {
          setSearchValue(currentFont);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchValue, currentFont, handleFontChange]);

  return (
    <div className="space-y-3 overflow-visible px-3">
      {/* Combobox Input Field */}
      <div className="relative overflow-visible">
        <Input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Inter"
          className="h-9 rounded-sm border border-slate-300 bg-white pr-16 text-slate-700 text-sm focus:border-slate-900 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-300 dark:focus:border-slate-100"
        />
        <div className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-1">
          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-transparent"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) {
                updateDropdownPosition();
              }
            }}
            className="h-6 w-6 p-0 hover:bg-transparent"
            aria-label="Toggle dropdown"
          >
            <ChevronDown
              className={cn("h-4 w-4 text-slate-500 transition-transform dark:text-slate-400", isOpen && "rotate-180")}
            />
          </Button>
        </div>

        {/* Dropdown List - Rendered via Portal */}
        {isOpen &&
          dropdownPosition &&
          typeof window !== "undefined" &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-9999 max-h-[300px] overflow-auto rounded-md border border-slate-300 bg-white shadow-md dark:border-gray-600 dark:bg-gray-800"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
              }}
            >
              {filteredFonts.length > 0 ? (
                filteredFonts.map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => handleFontChange(font)}
                    className={cn(
                      "w-full cursor-pointer px-3 py-2 text-left text-slate-700 text-sm transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-gray-700",
                      font === currentFont && "bg-slate-100 font-medium dark:bg-gray-700",
                    )}
                  >
                    {font}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-slate-500 text-sm dark:text-slate-400">No fonts found</div>
              )}
            </div>,
            document.body,
          )}
      </div>

      {/* Descriptive Text */}
      <p className="text-slate-500 text-xs dark:text-slate-400">Support all font in Google fonts</p>
    </div>
  );
};
