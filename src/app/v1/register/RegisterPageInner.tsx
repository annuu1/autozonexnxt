"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Form, Input, Button, Typography, Alert, Modal } from "antd";
import useAuthStore from "@/store/useAuthStore";

export default function RegisterPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const from = useMemo(() => params.get("from") || "/v1/dashboard", [params]);
  const invite = useMemo(() => params.get("invite") || "", [params]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser } = useAuthStore();

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [emailValid, setEmailValid] = useState(false);

  const [form] = Form.useForm();

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

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = window.setInterval(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Enable Send OTP if email is valid
  const onFieldsChange = (_: any, allFields: any) => {
    const emailField = allFields.find((f: any) => f.name[0] === "email");
    setEmailValid(emailField?.errors.length === 0 && !!emailField?.value);
  };

  const sendOtp = async (email: string) => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/v1/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "register" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send OTP");
      }
      setOtpSent(true);
      setResendCountdown(60);
    } catch (e: any) {
      setOtpError(e.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setOtpError("Please enter the OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      const email = form.getFieldValue("email");
      const res = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "register", otp }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Invalid OTP");
      }
      setOtpVerified(true);
    } catch (e: any) {
      setOtpError(e.message || "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!otpVerified) {
      setError("Please verify your email first");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          mobile: values.mobile,
          password: values.password,
          referralCode: values.inviteCode,
          plan: "freemium",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Registration failed");
      }

      router.replace("/v1/login");

      // const me = await fetch("/api/v1/auth/me", { cache: "no-store" });
      // if (me.ok) {
      //   const userData = await me.json();
      //   setUser(userData);
      // }
      // router.replace(from);
    } catch (e: any) {
      setError(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      background: "#f6fffa",
      backgroundSize: "400% 400%",
      animation: "gradientBG 15s ease infinite",
    }}>
      <style>{`
        @keyframes gradientBG {
          0% {background-position:0% 50%}
          50% {background-position:100% 50%}
          100% {background-position:0% 50%}
        }
          .ant-input[disabled],
          .ant-input-disabled,
          .ant-input-password-disabled {
            background-color: #f1f1f1 !important; /* soft light gray */
            color: #555 !important;              /* readable text */
            cursor: not-allowed !important;
            opacity: 1 !important;               /* remove AntD fade */
          }
            
        .register-container { display: flex; flex-direction: row; gap: 24px; max-width: 900px; width: 100%; }

        .ant-btn[disabled] {
          background-color: #e0e0e0 !important;
          color: #888 !important;
          cursor: not-allowed !important;
          border: none !important;
          opacity: 1 !important; /* keep visible */
        @media (max-width: 768px) { .register-container { flex-direction: column; } }
      `}</style>

      <div className="register-container">
      <Card
  style={{
    flex: 1,
    background: "#75f3b2",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    color: "#111",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    textAlign: "center",
    padding: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  }}
  bordered={false}
>
  <Typography.Title level={3} style={{ color: "#111", marginBottom: 16 }}>
    Welcome to AutoZoneX Trading 🚀
  </Typography.Title>
  <Typography.Paragraph style={{ color: "#555", fontSize: 15, marginBottom: 24 }}>
    Create your account and start exploring powerful trading tools.  
  </Typography.Paragraph>

  <div
    style={{
      background: "#f9fffa",
      padding: 16,
      borderRadius: 12,
      marginTop: "auto",
    }}
  >
    <Typography.Text style={{ color: "#666", fontSize: 14, display: "block", marginBottom: 12 }}>
      Having issues while registering?  
    </Typography.Text>

    <Button
      type="primary"
      href="https://t.me/anuragX_sys"
      target="_blank"
      block
      style={{
        background: "linear-gradient(135deg, #00c853, #64dd17)",
        border: "none",
        borderRadius: 8,
        fontWeight: 600,
      }}
    >
      Contact Support on Telegram
    </Button>

    <Typography.Text style={{ color: "#888", fontSize: 12, display: "block", marginTop: 12 }}>
      We’ll help you with manual registration if needed.
    </Typography.Text>
  </div>
</Card>


        <Card style={{
          flex: 1,
          background: "#75f3b2",
          backdropFilter: "blur(10px)",
          borderRadius: 16,
          padding: 32,
          minHeight: 400,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }} bordered={false}>
          <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 24, color: "#111" }}>
            Create Your Account
          </Typography.Title>

          {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ inviteCode: invite }}
            onFieldsChange={onFieldsChange}
          >
            <Form.Item label={<span style={{ color: "#555" }}>Full Name</span>} name="name"
              rules={[{ required: true, message: "Please enter your name" }]}>
              <Input autoComplete="name" placeholder="Jane Doe" size="large" style={{ borderRadius: 8 }} disabled={!otpVerified && otpSent} />
            </Form.Item>

            <Form.Item label={<span style={{ color: "#555" }}>Mobile Number</span>} name="mobile"
              rules={[
                { required: true, message: "Please enter your mobile number" },
                { pattern: /^\d{10}$/, message: "Invalid mobile number (10 digits required)" },
              ]}>
              <Input autoComplete="tel" placeholder="1234567890" size="large" style={{ borderRadius: 8 }} disabled={!otpVerified && otpSent} />
            </Form.Item>

            {/* Email field moved below mobile */}
            <Form.Item label={<span style={{ color: "#555" }}>Email</span>} name="email"
              rules={[{ required: true, message: "Please enter your email" }, { type: "email", message: "Invalid email" }]}>
              <Input autoComplete="email" placeholder="you@example.com" size="large" style={{ borderRadius: 8 }} disabled={otpSent} />
            </Form.Item>

            {/* OTP Section */}
            {!otpSent && (
              <Form.Item>
                <Button
                  type="default"
                  onClick={() => sendOtp(form.getFieldValue("email"))}
                  block size="large"
                  loading={otpLoading}
                  style={{ borderRadius: 8 }}
                  disabled={!emailValid}
                >
                  Send OTP
                </Button>
              </Form.Item>
            )}

            {otpSent && !otpVerified && (
              <>
                <Form.Item label={<span style={{ color: "#555" }}>Enter OTP</span>} required>
                  <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" size="large" style={{ borderRadius: 8 }} />
                </Form.Item>

                {otpError && <Alert type="error" message={otpError} style={{ marginBottom: 16 }} />}

                <Form.Item>
                  <Button type="primary" onClick={verifyOtp} block size="large" loading={otpLoading} style={{ borderRadius: 8 }}>
                    Verify OTP
                  </Button>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="default"
                    onClick={() => sendOtp(form.getFieldValue("email"))}
                    block size="large"
                    disabled={resendCountdown > 0 || otpLoading}
                    style={{ borderRadius: 8 }}
                  >
                    Resend OTP {resendCountdown > 0 && `(${resendCountdown}s)`}
                  </Button>
                </Form.Item>
              </>
            )}

            <Form.Item label={<span style={{ color: "#555" }}>Password</span>} name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 8, message: "Minimum 8 characters" },
              ]}>
              <Input.Password autoComplete="new-password" placeholder="••••••••" size="large" style={{ borderRadius: 8 }} disabled={!otpVerified} />
            </Form.Item>

            <Form.Item label={<span style={{ color: "#555" }}>Invite Code (optional)</span>} name="inviteCode">
              <Input placeholder="Enter invite code" size="large" style={{ borderRadius: 8 }} disabled={!otpVerified} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ borderRadius: 8 }} disabled={!otpVerified}>
                Create Account
              </Button>
            </Form.Item>
          </Form>

          <Typography.Paragraph style={{ textAlign: "center", color: "#666", marginTop: 8 }}>
            Already have an account?{" "}
            <a href={`/v1/login?from=${encodeURIComponent(from)}${invite ? `&invite=${invite}` : ''}`} style={{ color: "#00c853" }}>
              Sign in
            </a>
          </Typography.Paragraph>
        </Card>
      </div>
    </div>
  );
}
