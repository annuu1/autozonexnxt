// hooks/useZones.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useZones() {
  const queryClient = useQueryClient();

  const zonesQuery = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await fetch("/api/v1/dashboard/zones-in-range");
      if (!res.ok) throw new Error("Failed to fetch zones");
      return res.json();
    },
    enabled: false, // don’t auto-fetch until you want
  });

  const markZoneSeen = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/demand-zones/${id}/seen`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<any[]>(["zones"], (old) =>
        old?.map((z) =>
          z._id === updated._id ? { ...z, last_seen: updated.last_seen } : z
        )
      );
    },
  });

  return { ...zonesQuery, markZoneSeen };
}
