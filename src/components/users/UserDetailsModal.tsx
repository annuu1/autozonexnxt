// components/users/UserDetailsModal.tsx
import React from "react";
import { Modal, Descriptions, Tag, Typography } from "antd";

interface Subscription {
  plan: string;
  status: string;
  billingCycle: string;
  startDate: string;
}

interface OtherChannel {
  channel: string;
  id: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  roles: string[];
  isVerified: boolean;
  subscription?: Subscription;
  other_channels?: OtherChannel[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  invitedBy?: { _id: string; name: string; email: string };
}

interface UserDetailsModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
}

const { Title } = Typography;

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ visible, user, onClose }) => {
  return (
    <Modal
      title={`User Details: ${user?.name || ''}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {user && (
        <>
          <Title level={4}>Profile Information</Title>
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Mobile">{user.mobile || '-'}</Descriptions.Item>
            <Descriptions.Item label="Roles">
              {user.roles.map((role: string) => (
                <Tag key={role} color={role === "admin" ? "red" : "blue"}>
                  {role.toUpperCase()}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Verified">
              <Tag color={user.isVerified ? "green" : "orange"}>
                {user.isVerified ? "Yes" : "No"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(user.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {new Date(user.updatedAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Login">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
            </Descriptions.Item>
            {user.invitedBy && (
              <Descriptions.Item label="Invited By">
                {user.invitedBy.name} ({user.invitedBy.email})
              </Descriptions.Item>
            )}
          </Descriptions>

          <Title level={4}>Subscription</Title>
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
            {user.subscription ? (
              <>
                <Descriptions.Item label="Plan">{user.subscription.plan}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={user.subscription.status === "active" ? "green" : "volcano"}>
                    {user.subscription.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Billing Cycle">{user.subscription.billingCycle}</Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {new Date(user.subscription.startDate).toLocaleDateString()}
                </Descriptions.Item>
              </>
            ) : (
              <Descriptions.Item label="Subscription">No active subscription</Descriptions.Item>
            )}
          </Descriptions>

          <Title level={4}>Other Channels</Title>
          <Descriptions bordered column={1} size="small">
            {user.other_channels && user.other_channels.length > 0 ? (
              user.other_channels.map((ch) => (
                <Descriptions.Item key={ch.channel} label={ch.channel}>
                  {ch.id}
                </Descriptions.Item>
              ))
            ) : (
              <Descriptions.Item label="Channels">No channels added</Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}
    </Modal>
  );
};

export default UserDetailsModal;