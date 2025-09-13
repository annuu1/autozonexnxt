// hooks/useReactions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ReactionType = "👍" | "👎" | "🚀";

export function useReactions(itemIds: string[]) {
  return useQuery({
    queryKey: ["reactions", itemIds],
    queryFn: async () => {
      const res = await fetch("/api/v1/reactions/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds }),
      });
      if (!res.ok) throw new Error("Failed to fetch reactions");
      return res.json() as Promise<
        Record<
          string,
          {
            counts: Record<ReactionType, number>;
            userReaction: ReactionType | null;
            isTeamPick: boolean;
          }
        >
      >;
    },
    enabled: itemIds.length > 0,
  });
}

export function useReactToItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      type,
      reaction,
    }: {
      itemId: string;
      type: string;
      reaction: ReactionType;
    }) => {
      const res = await fetch("/api/v1/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, type, reaction }),
      });
      if (!res.ok) throw new Error("Failed to react");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions"] });
    },
  });
}

export function useToggleTeamPick() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, type }: { itemId: string; type: string }) => {
      const res = await fetch("/api/v1/teams-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, type }),
      });
      if (!res.ok) throw new Error("Failed to toggle team pick");
      return res.json() as Promise<{ success: boolean; isTeamPick: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions"] });
    },
  });
}
