// app/v1/login/LoginPageInner.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Space,
} from "antd";
import Link from "next/link";
import useAuthStore from "@/store/useAuthStore";
import { MailOutlined, LockOutlined } from "@ant-design/icons";

export default function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const from = useMemo(() => params.get("from") || "/v1/dashboard", [params]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser } = useAuthStore();

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
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Login failed");
      }

      // ✅ fetch user profile after login
      const me = await fetch("/api/v1/auth/me", { cache: "no-store" });
      if (me.ok) {
        const userData = await me.json();
        setUser(userData); // store user globally
      }

      router.replace(from);
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Card className="login-card">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Typography.Title
              level={3}
              style={{ marginBottom: 8, fontWeight: 600 }}
            >
              Welcome Back
            </Typography.Title>
            <Typography.Text type="secondary">
              Sign in to access your trading dashboard
            </Typography.Text>
          </div>

          {error && <Alert type="error" message={error} showIcon />}

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="you@example.com"
                autoComplete="email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="••••••••"
                autoComplete="current-password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                Continue
              </Button>
            </Form.Item>
          </Form>

          <Typography.Paragraph
            style={{ textAlign: "center", marginBottom: 0 }}
          >
            Don&apos;t have an account?{" "}
            <Link href={`/v1/register?from=${encodeURIComponent(from)}`}>
              Sign up
            </Link>
          </Typography.Paragraph>
        </Space>
      </Card>

      <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: #f5f7fa;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        @media (max-width: 480px) {
          .login-card {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
