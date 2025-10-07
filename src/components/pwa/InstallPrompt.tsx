"use client";

import { useEffect, useState } from "react";

// Utility: basic platform detection
function usePlatform() {
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandalone, setIsInStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // iOS detection
    const ua = window.navigator.userAgent || "";
    const isIPhone = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua);
    setIsIOS(isIPhone && isSafari);

    // Standalone (installed) detection
    const standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || (window as any).navigator.standalone === true;
    setIsInStandalone(!!standalone);
  }, []);

  return { isIOS, isInStandalone };
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const { isIOS, isInStandalone } = usePlatform();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If already installed, do not show the prompt UI
    if (isInStandalone) {
      setVisible(false);
      return;
    }

    // Desktop & Android: capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      // Stop the mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // iOS Safari: no beforeinstallprompt; show manual banner
    let iosTimer: any;
    if (isIOS) {
      iosTimer = setTimeout(() => {
        setVisible(true);
      }, 1500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, [isIOS, isInStandalone]);

  if (!visible) return null;

  // Simple UI banner; fixed bottom, unobtrusive
  return (
    <div style={styles.container} role="dialog" aria-live="polite">
      <div style={styles.content}>
        <div style={styles.textBlock}>
          <strong>Install Autozonex</strong>
          <span style={styles.caption}>
            {isIOS
              ? "Add this app to your Home Screen for a full-screen experience."
              : "Install this app for faster access and offline support."}
          </span>
        </div>
        {isIOS ? (
          <IOSInstructions onClose={() => setVisible(false)} />
        ) : (
          <InstallButtons
            onInstall={async () => {
              if (!deferredPrompt) return;
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              // Hide if accepted or dismissed; we'll show again on a new event
              setVisible(false);
              setDeferredPrompt(null);
              if (outcome === "accepted") {
                // no-op; appinstalled event will fire on success
              }
            }}
            onClose={() => setVisible(false)}
          />
        )}
      </div>
    </div>
  );
}

function IOSInstructions({ onClose }: { onClose: () => void }) {
  return (
    <div style={styles.actionsRow}>
      <div style={styles.iosText}>
        Open in Safari, tap the Share button
        <span aria-hidden> ⎋ </span> then
        <strong> Add to Home Screen</strong>.
      </div>
      <button type="button" onClick={onClose} style={styles.secondaryBtn} aria-label="Close install banner">
        Close
      </button>
    </div>
  );
}

function InstallButtons({ onInstall, onClose }: { onInstall: () => void; onClose: () => void }) {
  return (
    <div style={styles.actionsRow}>
      <button type="button" onClick={onInstall} style={styles.primaryBtn} aria-label="Install app">
        Install
      </button>
      <button type="button" onClick={onClose} style={styles.secondaryBtn} aria-label="Dismiss install banner">
        Not now
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    padding: "8px",
    display: "flex",
    justifyContent: "center",
  },
  content: {
    width: "min(680px, 96vw)",
    background: "#0b1220f2",
    color: "#fff",
    borderRadius: 12,
    padding: "12px 14px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    backdropFilter: "saturate(140%) blur(6px)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  textBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 14,
  },
  caption: {
    opacity: 0.85,
    fontWeight: 400,
  },
  actionsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 6,
  },
  primaryBtn: {
    background: "#0ea5e9",
    color: "#001b2e",
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
  },
  iosText: {
    fontSize: 13,
    opacity: 0.9,
  },
};
