// components/AlertCard.tsx
import React from "react";
import {
  Button,
  Card,
  Space,
  Switch,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  BellOutlined,
} from "@ant-design/icons";
import ExpandableNote from "@/components/common/ExpandableNote";

interface AlertCardProps {
  alert: any;
  onToggleActive: (alert: any, active: boolean) => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onToggleActive,
  onEdit,
  onDelete,
}) => {
  return (
    <Card
      style={{
        width: "100%",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      title={
        <Space>
          <BellOutlined />
          <strong>{alert.symbol}</strong>
        </Space>
      }
      extra={
        <Switch
          checked={alert.active}
          onChange={(checked) => onToggleActive(alert, checked)}
        />
      }
      actions={[
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={onEdit}
          key="edit"
        >
          Edit
        </Button>,
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(alert._id)}
          key="delete"
        >
          Delete
        </Button>,
      ]}
    >
      <p style={{ marginBottom: 6 }}>
        <strong>Condition:</strong>{" "}
        {alert.condition === "Above" ? (
          <Tag color="green">Above</Tag>
        ) : (
          <Tag color="red">Below</Tag>
        )}
      </p>
      <p style={{ marginBottom: 6 }}>
        <strong>Target Price:</strong> ₹{alert.price}
      </p>
      {alert.note && (
        <ExpandableNote note={alert.note} />
      )}
    </Card>
  );
};

export default AlertCard;