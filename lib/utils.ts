import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function shortAddress(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
export function successRate(rep: { PASS: number; FAIL: number }) {
  const total = rep.PASS + rep.FAIL;
  return {
    total,
    rate: total
      ? `${Math.round((rep.PASS / total) * 100)}%`
      : "Not enough verified data",
  };
}
