"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Form, Input, Button, Typography, Alert } from "antd";
import useAuthStore from "@/store/useAuthStore";

export default function RegisterPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const from = useMemo(() => params.get("from") || "/v1/dashboard", [params]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser } = useAuthStore();

  // Redirect if already logged in
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
          plan: "freemium", // default plan
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Registration failed");
      }

      const me = await fetch("/api/v1/auth/me", { cache: "no-store" });
      if (me.ok) {
        const userData = await me.json();
        setUser(userData);
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
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}
    >
      <style>{`
        @keyframes gradientBG {
          0% {background-position:0% 50%}
          50% {background-position:100% 50%}
          100% {background-position:0% 50%}
        }

        /* ✅ Responsive styles */
        .register-container {
          display: flex;
          flex-direction: row;
          gap: 24px;
          max-width: 900px;
          width: 100%;
        }

        @media (max-width: 768px) {
          .register-container {
            flex-direction: column; /* stack vertically on tablets/phones */
          }
        }
      `}</style>

      <div className="register-container">
        {/* Left Card */}
        <Card
          style={{
            flex: 1,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300, // reduced for smaller screens
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 24,
          }}
          bordered={false}
        >
          Welcome to <br /> AutoZone Trading
        </Card>

        {/* Right Card (Form) */}
        <Card
          style={{
            flex: 1,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            padding: 32,
            minHeight: 400,
          }}
          bordered={false}
        >
          <Typography.Title
            level={3}
            style={{ textAlign: "center", marginBottom: 24, color: "#fff" }}
          >
            Create Your Account
          </Typography.Title>

          {error && (
            <Alert type="error" message={error} style={{ marginBottom: 16 }} />
          )}

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={<span style={{ color: "#ddd" }}>Full Name</span>}
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input
                autoComplete="name"
                placeholder="Jane Doe"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "#ddd" }}>Email</span>}
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
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "#ddd" }}>Password</span>}
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
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                style={{
                  borderRadius: 8,
                  background: "#00c6ff",
                  borderColor: "#0072ff",
                }}
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <Typography.Paragraph
            style={{ textAlign: "center", color: "#ccc", marginTop: 8 }}
          >
            Already have an account?{" "}
            <a
              href={`/v1/login?from=${encodeURIComponent(from)}`}
              style={{ color: "#00c6ff" }}
            >
              Sign in
            </a>
          </Typography.Paragraph>
        </Card>
      </div>
    </div>
  );
}
