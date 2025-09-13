import { Button, Tooltip, message } from "antd";
import {
  LikeOutlined,
  DislikeOutlined,
  RocketOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import useAuthStore from "@/store/useAuthStore";
import {
  useReactions,
  useReactToItem,
  useToggleTeamPick,
} from "@/hooks/useReactions";

type ReactionType = "👍" | "👎" | "🚀";

const reactionOptions: { type: ReactionType; icon: React.ReactNode }[] = [
  { type: "👍", icon: <LikeOutlined /> },
  { type: "👎", icon: <DislikeOutlined /> },
  { type: "🚀", icon: <RocketOutlined /> },
];

export default function Reactions({
  itemId,
  type,
  allItemIds,
  teamPickEnabled = false,
}: {
  itemId: string;
  type: string;
  allItemIds: string[];
  teamPickEnabled?: boolean;
}) {
  const { user } = useAuthStore();
  const { data, isLoading } = useReactions(allItemIds);
  const reactMutation = useReactToItem();
  const teamPickMutation = useToggleTeamPick();

  const itemData = data?.[itemId];
  const userReaction = itemData?.userReaction;
  const counts = itemData?.counts ?? { "👍": 0, "👎": 0, "🚀": 0 };
  const isTeamPick = itemData?.isTeamPick ?? false;

  const handleReaction = (reaction: ReactionType) => {
    if (!user?.id) return message.warning("Login required");
    reactMutation.mutate({ itemId, type, reaction });
  };

  const handleTeamPick = () => {
    if (!user?.id) return message.warning("Login required");
    if (!["admin", "manager", "agent"].includes(user.roles[0])) {
      return message.warning("Not authorized");
    }
    teamPickMutation.mutate({ itemId, type });
  };

  return (
    <div className="flex items-center gap-3">
      {reactionOptions.map((r) => (
        <Tooltip key={r.type} title={r.type}>
          <span className="flex items-center">
            <Button
              type={userReaction === r.type ? "primary" : "default"}
              shape="circle"
              icon={r.icon}
              size="small"
              loading={
                reactMutation.isPending &&
                reactMutation.variables?.reaction === r.type
              }
              onClick={() => handleReaction(r.type)}
              disabled={isLoading}
            />
            <span className="ml-1 text-sm">{counts[r.type] || 0}</span>
          </span>
        </Tooltip>
      ))}

      {teamPickEnabled && (
        <Tooltip title="Team’s Pick">
          <Button
            shape="circle"
            icon={isTeamPick ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
            size="small"
            onClick={handleTeamPick}
            loading={teamPickMutation.isPending}
          />
        </Tooltip>
      )}
    </div>
  );
}
