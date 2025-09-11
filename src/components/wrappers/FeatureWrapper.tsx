// wrappers/FeatureWrapper.tsx
import { Card, Typography } from "antd";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { features } from "@/config/features";

const { Text } = Typography;

interface FeatureWrapperProps {
  title: string;
  featureKey: keyof typeof features;
  user: any;
  children: React.ReactNode;
}

export default function FeatureWrapper({
  title,
  featureKey,
  user,
  children,
}: FeatureWrapperProps) {
  const { allowed, reason } = useFeatureAccess(featureKey, user);

  return (
    <Card title={title} style={{ marginBottom: 20 }}>
      {reason === "comingSoon" && (
        <Text type="secondary">🚧 This feature will be unlocked soon!</Text>
      )}
      {reason === "upgrade" && (
        <Text strong>🔒 Upgrade to Pro to access this feature.</Text>
      )}
      {reason === "disabled" && (
        <Text type="secondary">This feature is currently disabled.</Text>
      )}
      {reason === "notFound" && (
        <Text type="danger">❌ Feature not found.</Text>
      )}
      {allowed && children}
    </Card>
  );
}
