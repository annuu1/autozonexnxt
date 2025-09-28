"use client";

import { Modal, Button } from "antd";
import { useEffect, useState } from "react";

interface FreeTrialModalProps {
  open: boolean;
  onClose: () => void;
  onClaim: () => void;
}

export default function FreeTrialModal({ open, onClose, onClaim }: FreeTrialModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      closable
    >
      <div style={{ textAlign: "center", padding: "10px" }}>
        <h2 style={{ marginBottom: 10 }}>🎉 Claim Your Free Trial!</h2>
        <p style={{ fontSize: 16, marginBottom: 20 }}>
          <strong>AutoZoneX</strong> – The ultimate companion for demand and supply traders.
          Get access to premium features and start trading smarter today.
        </p>
        <Button
          type="primary"
          size="large"
          style={{ width: "100%", marginBottom: 10 }}
          onClick={onClaim}
        >
          Claim My Free Trial 🚀
        </Button>
        <Button
          type="default"
          size="middle"
          block
          onClick={onClose}
        >
          Maybe Later
        </Button>
      </div>
    </Modal>
  );
}
