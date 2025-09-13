"use client";

import { useEffect, useState } from "react";
import { Button, Tooltip, message } from "antd";
import {
  LikeOutlined,
  DislikeOutlined,
  RocketOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import useAuthStore from "@/store/useAuthStore";

type ReactionType = "👍" | "👎" | "🚀";
type AllowedRoles = "admin" | "manager" | "agent";

const reactionOptions: { type: ReactionType; icon: React.ReactNode }[] = [
  { type: "👍", icon: <LikeOutlined /> },
  { type: "👎", icon: <DislikeOutlined /> },
  { type: "🚀", icon: <RocketOutlined /> },
];

export default function Reactions({
  itemId,
  type,
  teamPickEnabled = false,
}: {
  itemId: string;
  type: string; // "zone" | "trade" | "alert"
  teamPickEnabled?: boolean;
}) {
  const { user } = useAuthStore();
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [counts, setCounts] = useState<Record<ReactionType, number>>({
    "👍": 0,
    "👎": 0,
    "🚀": 0,
  });
  const [teamPick, setTeamPick] = useState(false);

  const [loadingReaction, setLoadingReaction] = useState<ReactionType | null>(
    null
  );
  const [teamPickLoading, setTeamPickLoading] = useState(false);

    // 🔹 Fetch reactions on mount
    useEffect(() => {
      (async () => {
        try {
          const res = await fetch(`/api/v1/reactions/${itemId}`);
          if (!res.ok) return;
          const data = await res.json();
          setUserReaction(data.userReaction);
          setCounts(data.counts);
          setTeamPick(data.teamPick);
        } catch (err) {
          console.error("Failed to load reactions", err);
        }
      })();
    }, [itemId]);

  // 🔹 Handle reaction click
  const handleReaction = async (reaction: ReactionType) => {
    if (!user?.id) return message.warning("Login required to react");
    setLoadingReaction(reaction);
    try {
      const res = await fetch(`/api/v1/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, type, reaction }),
      });
      if (!res.ok) throw new Error("Failed to react");
      const data = await res.json();
      setUserReaction(data.userReaction);
      setCounts(data.counts);
    } catch (err) {
      message.error("Could not update reaction");
    } finally {
      setLoadingReaction(null);
    }
  };

  // 🔹 Handle Team Pick
  const handleTeamPick = async () => {
    if (!user?.id) return message.warning("Login required");
    setTeamPickLoading(true);
    try {
      if (!teamPick) {
        await fetch(`/api/v1/teams-picks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, type }),
        });
        setTeamPick(true);
        message.success("Added to Team’s Pick");
      } else {
        await fetch(`/api/v1/teams-picks/${itemId}`, { method: "DELETE" });
        setTeamPick(false);
        message.info("Removed from Team’s Pick");
      }
    } catch (err) {
      message.error("Could not update team pick");
    } finally {
      setTeamPickLoading(false);
    }
  };

  // 🔹 Check if user has privilege
  const canTeamPick =
    teamPickEnabled &&
    user?.roles &&
    (["admin", "manager", "agent"] as AllowedRoles[]).includes(user.roles[0]);

  return (
    <div className="flex items-center gap-3">
      {/* Reactions */}
      {reactionOptions.map((r) => (
        <Tooltip key={r.type} title={r.type}>
          <span className="flex items-center">
            <Button
              type={userReaction === r.type ? "primary" : "default"}
              shape="circle"
              icon={r.icon}
              size="small"
              loading={loadingReaction === r.type}
              onClick={() => handleReaction(r.type)}
            />
            <span className="ml-1 text-sm">{counts[r.type] || 0}</span>
          </span>
        </Tooltip>
      ))}

      {/* Team’s Pick */}
      {canTeamPick && (
        <Tooltip title="Mark as Team’s Pick">
          <Button
            type={teamPick ? "primary" : "dashed"}
            shape="circle"
            icon={teamPick ? <StarFilled /> : <StarOutlined />}
            size="small"
            loading={teamPickLoading}
            onClick={handleTeamPick}
          />
        </Tooltip>
      )}
    </div>
  );
}
