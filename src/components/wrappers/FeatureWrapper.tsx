import { Card, Typography } from "antd";

const { Text } = Typography;

interface FeatureWrapperProps {
  title: string;
  feature: { enabled: boolean; paid?: boolean; comingSoon?: boolean };
  user: any;
  children: React.ReactNode;
}

export default function FeatureWrapper({ title, feature, user, children }: FeatureWrapperProps) {
  return (
    <Card title={title} style={{ marginBottom: 20 }}>
      {feature.comingSoon ? (
        <Text type="secondary">🚧 This feature is coming soon!</Text>
      ) : feature.paid && !user?.isSubscribed ? (
        <Text strong>🔒 Upgrade to Pro to access this feature.</Text>
      ) : feature.enabled ? (
        children
      ) : (
        <Text type="secondary">This feature is currently disabled.</Text>
      )}
    </Card>
  );
}
