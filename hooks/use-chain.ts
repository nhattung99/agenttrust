"use client";
import { useQuery } from "@tanstack/react-query";
import { read, ready } from "@/lib/genlayer/client";
import type { CalldataEncodable } from "genlayer-js/types";
export function useChain<T>(
  method: string,
  args: CalldataEncodable[] = [],
  enabled = true,
) {
  return useQuery<T>({
    queryKey: ["chain", method, args],
    queryFn: () => read<T>(method, args),
    enabled: ready && enabled,
    refetchInterval: 20000,
    retry: 1,
  });
}
