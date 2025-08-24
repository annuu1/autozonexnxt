"use client";

import { Card, Row, Col } from "antd";

export default function DashboardPage() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
        <Card title="Users" bordered={false}>
          1234
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card title="Revenue" bordered={false}>
          $5678
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card title="Active Sessions" bordered={false}>
          89
        </Card>
      </Col>
    </Row>
  );
}
