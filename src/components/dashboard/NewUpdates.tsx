import React from "react";
import { Card, Button, message } from "antd";

export default function NewUpdates(user: any) {
  return (
    <Card title="🔥 Don’t Miss Out: Hot News & Updates" style={{ marginTop: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Hot News / Announcements */}
        <div
          style={{
            padding: "10px",
            background: "#fffbe6",
            border: "1px solid #ffe58f",
            borderRadius: 8,
          }}
        >
          <strong>📰 What’s New</strong>
          <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: "15px" }}>
            <li>📊 <strong>Market Scan Upgrade:</strong> AutoZoneX now scans <strong>NSE 2600+ stocks</strong> every 5 minutes—no more missed setups.</li>
            <li>⚡ <strong>Early Entry Alerts:</strong> Get notified <strong>before price enters demand zones</strong>, so you can plan trades calmly.</li>
            <li>🎓 <strong>Beginner Series:</strong> Upcoming: *“How to Mark High-Probability Zones in 5 Steps”*</li>
            <li>🧠 <strong>Trader Tips:</strong> Community shared 3 new case studies where early alerts caught trades with 1:5 RR — check Telegram!</li>
            
          </ul>
        </div>

        {/* Subscription Info */}
        {/* <div
          style={{
            padding: "10px",
            background: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: 8,
          }}
        >
          <strong>📅 Subscription Plan:</strong> <br />
          <span>
            Active · Expires on <strong>28th Sept, 2025</strong>
          </span>
          <Button
            type="link"
            style={{ padding: 0, marginLeft: 8 }}
            onClick={() => message.info("Redirecting to subscription renewal...")}
          >
            Renew Now
          </Button>
        </div> */}

        {/* Highlighted Telegram & YouTube CTA */}
        <div
          style={{
            padding: "20px",
            background: "linear-gradient(135deg, #0088cc, #1e90ff)",
            color: "#fff",
            borderRadius: 12,
            textAlign: "center",
            boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
            border: "2px solid #40c4ff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              transform: "rotate(45deg)",
            }}
          />
          <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            🚀 Trade Smarter, Not Harder!
          </h3>
          <p style={{ margin: "12px 0", fontSize: "16px" }}>
            Get <strong>real-time market scans</strong>, <strong>early alerts</strong>, and <strong>community picks</strong> every day.  
            Beginners, job professionals, and full-time traders — we’ve got you covered.
            Join our <strong>Telegram</strong> for instant updates and <strong>YouTube</strong> for step-by-step strategies!
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <Button
              type="primary"
              size="large"
              href="https://t.me/autozonex_nxt"
              // {user.invitedBy !== null ? `https://t.me/autozonex_nxt` : "https://t.me/autozonex_nxt"}
              target="_blank"
              style={{
                background: "#fff",
                color: "#0088cc",
                fontWeight: "bold",
                padding: "0 24px",
                height: "48px",
                borderRadius: "8px",
                transition: "transform 0.2s",
              }}
            >
              🔗 Join Telegram Now
            </Button>
            <Button
              type="primary"
              size="large"
              href="https://www.youtube.com/@AutozonexOfficial"
              target="_blank"
              style={{
                background: "#fff",
                color: "#ff0000",
                fontWeight: "bold",
                padding: "0 24px",
                height: "48px",
                borderRadius: "8px",
                transition: "transform 0.2s",
              }}
            >
              📺 Subscribe on YouTube
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
