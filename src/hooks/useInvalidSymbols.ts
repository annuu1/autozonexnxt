// hooks/useInvalidSymbols.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export function useInvalidSymbols() {
  const queryClient = useQueryClient();

  const invalidSymbolsQuery = useQuery({
    queryKey: ["invalid-symbols"],
    queryFn: async () => {
      const res = await fetch("/api/v1/dashboard/invalid-symbols");
      if (!res.ok) throw new Error("Failed to fetch invalid symbols");
      return res.json();
    },
    enabled: false,
  });

  const updateSymbol = useMutation({
    mutationFn: async ({ id, symbol }: { id: string; symbol: string }) => {
      return fetch(`/api/v1/symbols/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
    },
    onSuccess: () => {
      message.success("Symbol updated");
      queryClient.invalidateQueries({ queryKey: ["invalid-symbols"] });
    },
    onError: () => message.error("Failed to update symbol"),
  });

  const deleteSymbol = useMutation({
    mutationFn: async (id: string) => {
      return fetch(`/api/v1/symbols/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      message.success("Symbol deleted");
      queryClient.invalidateQueries({ queryKey: ["invalid-symbols"] });
    },
    onError: () => message.error("Failed to delete symbol"),
  });

  return { ...invalidSymbolsQuery, updateSymbol, deleteSymbol };
}
