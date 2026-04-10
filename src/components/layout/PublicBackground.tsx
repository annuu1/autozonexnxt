"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function PublicBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-700"
      style={{ background: isDark ? "#000" : "#fafbfc" }}
    >
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: isDark ? 0.2 : 0.08,
          backgroundImage: isDark
            ? `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`
            : `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
        }}
      />
      {/* Orb 1 */}
      <div
        className="absolute top-[-20%] left-[20%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[120px] animate-pulse transition-colors duration-700"
        style={{
          background: isDark ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.06)",
        }}
      />
      {/* Orb 2 */}
      <div
        className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[150px] transition-colors duration-700"
        style={{
          background: isDark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.04)",
        }}
      />
    </div>
  );
}
