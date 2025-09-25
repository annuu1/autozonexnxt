import react from "react";
import { Card, Button, message } from "antd";

export default function NewUpdates(user: any) {
    return (
        <Card title="🔥 Hot News & Updates" style={{ marginTop: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
            {/* Highlighted Telegram CTA */}
            <div
              style={{
                padding: "16px",
                background: "linear-gradient(135deg, #0088cc, #1e90ff)",
                color: "#fff",
                borderRadius: 10,
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <h3 style={{ margin: 0 }}>🚀 Join Our Telegram Community</h3>
              <p style={{ margin: "8px 0" }}>
                Get <strong>LIVE stock zone alerts</strong> for QIT, MIT & WIT, plus
                exclusive <strong>trade discussions</strong> to spot more market opportunities!
              </p>
              <Button
                type="primary"
                size="large"
                href={user.invitedBy !== null ? `https://t.me/+9nlMFvHoC5gyZDQ1` : "https://t.me/stock_zone_alerts"}
                target="_blank"
                style={{
                  background: "#fff",
                  color: "#0088cc",
                  fontWeight: "bold",
                  marginTop: 8,
                }}
              >
                🔗 Join Telegram Now
              </Button>
            </div>
        
            {/* Subscription Info */}
            <div
              style={{
                padding: "10px",
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: 8,
              }}
            >
              {/* <strong>📅 Subscription Plan:</strong> <br />
              <span>
                Active · Expires on <strong>28th Sept, 2025</strong>
              </span>
              <Button
                type="link"
                style={{ padding: 0, marginLeft: 8 }}
                onClick={() => message.info("Redirecting to subscription renewal...")}
              >
                Renew Now
              </Button> */}
            </div>
        
            {/* Hot News / Announcements */}
            <div
              style={{
                padding: "10px",
                background: "#fffbe6",
                border: "1px solid #ffe58f",
                borderRadius: 8,
              }}
            >
              <strong>📰 Latest Updates</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {/* <li>✅ 15 New Demand Zones have been added today</li>
                <li>⚠️ Maintenance scheduled for 20th Sept, 12 AM - 1 AM</li> */}
                <li>🎯 Zones near day-low alert improved for faster updates</li>
              </ul>
            </div>
        
          </div>
        </Card>
    )
}