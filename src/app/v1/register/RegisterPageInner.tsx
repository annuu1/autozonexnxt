// app/v1/register/RegisterPageInner.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Form, Input, Button, Typography, Alert, Select } from "antd";
import Link from "next/link";

const PLAN_OPTIONS = [
  { label: "Freemium", value: "freemium" },
  { label: "Starter", value: "starter" },
  { label: "Pro", value: "pro" },
];

export default function RegisterPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const from = useMemo(() => params.get("from") || "/v1/dashboard", [params]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/v1/auth/me", { cache: "no-store" });
        if (res.ok && active) {
          router.replace(from);
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, [router, from]);

  const onFinish = async (values: any) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          plan: values.plan,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Registration failed");
      }

      router.replace(from);
    } catch (e: any) {
      setError(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Card style={{ width: 420 }}>
        <Typography.Title
          level={3}
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          Create your account
        </Typography.Title>

        {error && (
          <Alert type="error" message={error} style={{ marginBottom: 16 }} />
        )}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Full name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input autoComplete="name" placeholder="Jane Doe" size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input
              autoComplete="email"
              placeholder="you@example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 8, message: "Minimum 8 characters" },
            ]}
          >
            <Input.Password
              autoComplete="new-password"
              placeholder="••••••••"
              size="large"
            />
          </Form.Item>

          <Form.Item label="Plan" name="plan" initialValue="freemium">
            <Select options={PLAN_OPTIONS} size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Create account
            </Button>
          </Form.Item>
        </Form>

        <Typography.Paragraph
          style={{ textAlign: "center", color: "#888", marginTop: 8 }}
        >
          Already have an account?{" "}
          <Link href={`/v1/login?from=${encodeURIComponent(from)}`}>
            Sign in
          </Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
