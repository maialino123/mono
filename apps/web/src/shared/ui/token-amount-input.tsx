"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

interface TokenAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  decimals?: number;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  error?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

export const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
  value,
  onChange,
  decimals = 18,
  placeholder = "0.0",
  className = "",
  style = {},
  disabled = false,
  error = false,
  "aria-describedby": ariaDescribedby,
  "aria-label": ariaLabel,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const validateAndFormatInput = useCallback(
    (inputValue: string): string => {
      let val = inputValue.replace(/,/g, ".").replace(/[^0-9.]/g, "");
      if (val.startsWith(".")) val = `0${val}`;
      const parts = val.split(".");
      if (parts.length > 2) {
        val = `${parts[0]}.${parts.slice(1).join("")}`;
      }
      if (val.includes(".")) {
        const [int, dec] = val.split(".");
        val = `${int}.${dec.substring(0, decimals)}`;
      }
      if (val.length > 1 && val.startsWith("0") && !val.startsWith("0.")) {
        val = val.replace(/^0+/, "") || "0";
      }
      return val;
    },
    [decimals],
  );

  useEffect(() => {
    if (value.endsWith(".0") && displayValue.endsWith(".")) {
      return;
    }
    const validatedValue = validateAndFormatInput(value);
    if (validatedValue !== displayValue) {
      setDisplayValue(validatedValue);
    }
    if (validatedValue !== value) {
      const actualValue = validatedValue.endsWith(".") ? `${validatedValue}0` : validatedValue;
      onChangeRef.current(actualValue);
    }
  }, [value, validateAndFormatInput, displayValue]);

  const handleDecimalTruncation = useCallback(() => {
    if (displayValue?.includes(".")) {
      const [integerPart, decimalPart] = displayValue.split(".");
      if (decimalPart && decimalPart.length > decimals) {
        const truncatedDecimalPart = decimalPart.substring(0, decimals);
        const newDisplayValue = `${integerPart}.${truncatedDecimalPart}`;
        setDisplayValue(newDisplayValue);
        const actualValue = newDisplayValue.endsWith(".") ? `${newDisplayValue}0` : newDisplayValue;
        onChangeRef.current(actualValue);
      }
    }
  }, [displayValue, decimals]);

  useEffect(() => {
    handleDecimalTruncation();
  }, [handleDecimalTruncation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const inputValue = e.target.value;
    const validatedValue = validateAndFormatInput(inputValue);
    setDisplayValue(validatedValue);
    const actualValue = validatedValue.endsWith(".") ? `${validatedValue}0` : validatedValue;
    onChangeRef.current(actualValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(e.key)) {
      return;
    }
    if (e.ctrlKey && ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase())) {
      return;
    }
    if (["Home", "End", "ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(e.key)) {
      return;
    }
    if (/^[0-9]$/.test(e.key) || e.key === "." || e.key === ",") {
      return;
    }
    e.preventDefault();
  };

  return (
    <input
      className={cn(
        "h-8 w-full border-none bg-transparent p-0 font-semibold leading-8 tracking-[-0.006em] shadow-none outline-none placeholder:text-muted-foreground focus:border-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0",
        error ? "text-destructive" : "text-foreground",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      type="text"
      inputMode="decimal"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      value={displayValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      style={style}
      disabled={disabled}
      autoComplete="off"
      spellCheck={false}
    />
  );
};
