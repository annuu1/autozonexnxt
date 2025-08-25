import { Tag } from "antd";

export const getLastSeenTag = (lastSeen?: string) => {
  if (!lastSeen) return <Tag color="blue">New</Tag>;
  const seenDate = new Date(lastSeen);
  const today = new Date();
  const diffDays =
    (today.getTime() - seenDate.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 1) return <Tag color="green">Today</Tag>;
  if (diffDays <= 3) return <Tag color="lime">{seenDate.toLocaleDateString()}</Tag>;
  if (diffDays <= 10) return <Tag color="orange">{seenDate.toLocaleDateString()}</Tag>;
  return <Tag color="red">{seenDate.toLocaleDateString()}</Tag>;
};

export const getDiffTag = (percent: number) => {
  if (percent < 0) return <Tag color="red">{percent.toFixed(2)}%</Tag>;
  if (percent <= 1) return <Tag color="gold">{percent.toFixed(2)}%</Tag>;
  if (percent <= 3) return <Tag color="green">{percent.toFixed(2)}%</Tag>;
  return <Tag>{percent.toFixed(2)}%</Tag>;
};
