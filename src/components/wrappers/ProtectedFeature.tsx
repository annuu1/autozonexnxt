interface ProtectedFeatureProps {
    featureKey: keyof typeof features;
    user: any;
    children: React.ReactNode;
  }
  
  export function ProtectedFeature({ featureKey, user, children }: ProtectedFeatureProps) {
    const { allowed, reason } = useFeatureAccess(featureKey, user);
  
    if (reason === "comingSoon") {
      return <Text type="secondary">🚧 This feature will be unlocked soon!</Text>;
    }
  
    if (reason === "upgrade") {
      return <Text strong>🔒 Upgrade to Pro to access this feature.</Text>;
    }
  
    return allowed ? <>{children}</> : <Text type="secondary">This feature is currently disabled.</Text>;
  }
  