'use client'

import { Button, Input, message } from "antd";
import { useEffect, useState } from "react";

export default function AdminHome() {

  const [configs, setConfigs] = useState({
    tempPassword: "",
  });

  const fetchConfigs = async () => {
    const res = await fetch("/api/v1/admin/configs");
    const data = await res.json();
    setConfigs(data.configs);
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const save = async () => {
    const res = await fetch("/api/v1/admin/configs", {
      method: "POST",
      body: JSON.stringify(configs),
    });

    if (res.ok) message.success("Saved");
    else message.error("Failed");
  };


  return (
    <div>
      <h1>System Configurations</h1>

      <div style={{ maxWidth: 400 }}>
        <p>Default Temporary Password</p>
        <Input
          value={configs.tempPassword}
          onChange={(e) => setConfigs({ ...configs, tempPassword: e.target.value })}
        />

        <Button type="primary" style={{ marginTop: 20 }} onClick={save}>
          Save
        </Button>
      </div>
    </div>
  );
}
