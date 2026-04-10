"use client";

import React from "react";
import { Card, Tag, Space, Divider, Popconfirm, Button, theme } from "antd";
import { CopyOutlined, BellOutlined, DeleteOutlined, LockOutlined } from "@ant-design/icons";
import Reactions from "@/components/ui/Reactions";

export interface ZoneCardProps {
  zone: any;
  variant: "latest" | "demand" | "scanner" | "sector" | "report";
  onClick?: (zone: any) => void;
  onCopy?: (ticker: string) => void;
  onAlert?: (ticker: string) => void;
  onDelete?: (zoneId: string) => void;
  onLastSeen?: (zoneId: string) => void;
  locked?: boolean;
  onUpgrade?: () => void;
  allItemIds?: string[];
  hideQuickAlert?: boolean;
}

const getTimeframeColor = (timeframe: string) => {
  switch (timeframe) {
    case "1wk": return "cyan";
    case "1mo": return "purple";
    case "3mo": return "orange";
    case "1d": return "blue";
    default: return "default";
  }
};

const formatNumber = (val: any) => (typeof val === "number" ? val.toFixed(2) : val);

const getDiffTag = (diff: number) => {
  if (diff < 0) return <Tag color="red">{diff.toFixed(2)}%</Tag>;
  if (diff <= 1) return <Tag color="gold">{diff.toFixed(2)}%</Tag>;
  if (diff <= 3) return <Tag color="green">{diff.toFixed(2)}%</Tag>;
  return <Tag>{diff.toFixed(2)}%</Tag>;
};

export default function ZoneCard({
  zone,
  variant,
  onClick,
  onCopy,
  onAlert,
  onDelete,
  onLastSeen,
  locked = false,
  onUpgrade,
  allItemIds = [],
  hideQuickAlert = false,
}: ZoneCardProps) {
  const { token } = theme.useToken();

  const handleCardClick = () => {
    if (locked) return;
    if (variant === "demand" || variant === "report") return; // Handled separately on title or not clickable
    if (onClick) onClick(zone);
  };

  const handleCopy = (e?: React.MouseEvent<HTMLElement>) => {
    if (e) e.stopPropagation();
    if (onCopy) onCopy(zone.ticker);
    if (onLastSeen) onLastSeen(zone._id);
  };

  const handleAlert = (e?: React.MouseEvent<HTMLElement>) => {
    if (e) e.stopPropagation();
    if (onAlert) onAlert(zone.ticker);
  };

  const handleDelete = (e?: React.MouseEvent<HTMLElement>) => {
    if (e) e.stopPropagation();
    if (onDelete) onDelete(zone.zone_id);
  };

  const match = zone.zone_id?.match(/\d{4}-\d{2}-\d{2}/);
  const formattedDate = zone.reportDate || (match
    ? new Date(match[0]).toLocaleDateString("en-IN", {
        year: "numeric",
        month: variant === "sector" ? "short" : "long",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : null);

  const contentStyle: React.CSSProperties = locked
    ? { filter: "blur(3px)", userSelect: "none" }
    : {};

  return (
    <Card
      key={zone._id}
      style={{
        transition: "box-shadow 0.2s, transform 0.2s",
        borderColor: zone.last_seen ? "#52c41a" : token.colorBorderSecondary,
        boxShadow: token.boxShadowTertiary,
        position: "relative",
        cursor: onClick && variant !== "demand" && variant !== "report" && !locked ? "pointer" : "default",
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 14 }}
      onClick={handleCardClick}
      className={`hover:shadow-md ${!locked && variant !== "demand" && variant !== "report" ? "hover:-translate-y-1" : ""}`}
    >
      {/* Locked Overlay */}
      {locked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0, 0, 0, 0.05)",
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <LockOutlined style={{ fontSize: 28, color: token.colorPrimary }} />
            <Button type="primary" size="small" onClick={onUpgrade}>
              Upgrade
            </Button>
          </div>
        </div>
      )}

      <div style={contentStyle}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: variant === 'demand' ? 4 : 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong
              onClick={(e) => {
                if (variant === "demand" && onClick && !locked) {
                  e.stopPropagation();
                  onClick(zone);
                }
              }}
              style={{
                fontSize: 16,
                cursor: variant === "demand" && !locked ? "pointer" : "inherit",
                color: variant === "demand" ? token.colorPrimary : "inherit",
              }}
            >
              {zone.ticker}
            </strong>
            <Space size={4} wrap>
              {(zone.timeframes || []).map((f: string) => (
                <Tag key={f} color={getTimeframeColor(f)} style={{ margin: 0, fontSize: variant === "sector" ? 10 : undefined }}>
                  {f}
                </Tag>
              ))}
            </Space>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {(variant === "scanner" || variant === "sector") && zone.status && (
              <Tag color={zone.status === "entered" ? "green" : "blue"} style={{ margin: 0 }}>
                {zone.status?.toUpperCase()}
              </Tag>
            )}
            {variant === "report" && zone.time && (
              <span style={{ fontSize: 12, color: token.colorTextSecondary }}>{zone.time}</span>
            )}
            {variant !== "demand" && variant !== "sector" && (
              <>
                {variant !== "report" && onCopy && (
                  <CopyOutlined onClick={handleCopy} style={{ color: token.colorTextSecondary }} className="hover:text-blue-500 transition-colors" />
                )}
                {!hideQuickAlert && onAlert && (
                  <BellOutlined onClick={handleAlert} style={{ color: token.colorPrimary }} title="Set price alert" />
                )}
              </>
            )}
            {variant === "demand" && (
              <CopyOutlined onClick={handleCopy} style={{ fontSize: 16, color: token.colorTextSecondary }} className="hover:text-blue-500 transition-colors" />
            )}
          </div>
        </div>

        {variant === "demand" && <Divider style={{ margin: "8px 0" }} />}

        {/* Details section */}
        <div style={{ fontSize: 14, color: token.colorTextSecondary }}>
          {variant === "demand" && <div>Timeframe: {zone.timeframes}</div>}

          {formattedDate && variant !== "demand" && variant !== "sector" && variant !== "report" && (
            <div>{variant === "latest" ? "Date" : "Legout"}: {formattedDate}</div>
          )}

          {variant === "report" && formattedDate && (
            <div style={{ marginTop: 2, marginBottom: 8 }}>
              <Tag>{formattedDate}</Tag>
            </div>
          )}

          {variant === "sector" ? (
             <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Pattern:</span>
                  <span style={{ fontWeight: 500 }}>{zone.pattern}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Range:</span>
                  <span>{zone.proximal_line?.toFixed(1)} - {zone.distal_line?.toFixed(1)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Approach:</span>
                  <span style={{ fontWeight: "bold", color: "#d46b08" }}>
                    {zone.percentDiff?.toFixed(2)}%
                  </span>
                </div>
                {formattedDate && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: token.colorTextQuaternary }}>
                    <span>Legout:</span>
                    <span>{formattedDate}</span>
                  </div>
                )}
             </div>
          ) : (
            <>
              <div>Pattern: {zone.pattern}</div>
              <div>Proximal: {formatNumber(zone.proximal_line)}</div>
              <div>Distal: {formatNumber(zone.distal_line)}</div>

              {variant === "latest" && (
                <>
                  <div>Trade Score: {zone.trade_score}</div>
                  <div>Freshness: {zone.freshness}</div>
                  <div>Coinciding Zones: {zone.coinciding_lower_zones?.length || 0}</div>
                </>
              )}

              {variant === "demand" && (
                <>
                  <div>Freshness: {zone.freshness}</div>
                  <div style={{ marginTop: 4 }}>
                    LTP:{" "}
                    {zone.symbol_data?.ltp ? (
                      <Space size={4}>
                        <span>{formatNumber(zone.symbol_data.ltp)}</span>
                        {getDiffTag(((zone.symbol_data.ltp - zone.proximal_line) / zone.proximal_line) * 100)}
                      </Space>
                    ) : "-"}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    Day Low:{" "}
                    {zone.symbol_data?.day_low ? (
                      <Space size={4}>
                        <span>{formatNumber(zone.symbol_data.day_low)}</span>
                        {getDiffTag(((zone.symbol_data.day_low - zone.proximal_line) / zone.proximal_line) * 100)}
                      </Space>
                    ) : "-"}
                  </div>
                </>
              )}

              {variant === "scanner" && (
                <div>
                  Approach:{" "}
                  <span style={{ fontWeight: "bold", color: "#d46b08" }}>
                    {zone.percentDiff?.toFixed(3)}%
                  </span>
                </div>
              )}

              {variant === "report" && (
                <div style={{ marginTop: 4, color: token.colorText }}>
                  Range: <strong>{zone.range || "-"}</strong>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footers for reactions, deletes, etc */}
        {variant === "demand" && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
            {allItemIds.length > 0 && (
              <div style={{ marginRight: 12 }}>
                <Reactions itemId={zone._id} type="zone" allItemIds={allItemIds} teamPickEnabled />
              </div>
            )}
            {!hideQuickAlert && onAlert && (
              <BellOutlined
                style={{ fontSize: 18, color: token.colorPrimary, cursor: "pointer" }}
                title="Set alert"
                onClick={handleAlert}
              />
            )}
            {onDelete && (
              <Popconfirm title="Delete this zone?" okText="Yes" cancelText="No" onConfirm={handleDelete}>
                <DeleteOutlined style={{ fontSize: 18, color: token.colorError, cursor: "pointer" }} title="Delete zone" onClick={(e) => e.stopPropagation()} />
              </Popconfirm>
            )}
          </div>
        )}

        {(variant === "scanner" || variant === "report") && allItemIds.length > 0 && zone.showReactions !== false && (
          <div style={{ marginTop: 12 }}>
            <Reactions itemId={zone._id} type="zone" allItemIds={allItemIds} teamPickEnabled />
          </div>
        )}

        {variant === "sector" && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: 8, marginTop: 12 }}>
            <Space>
              <CopyOutlined onClick={handleCopy} style={{ color: token.colorTextQuaternary, cursor: "pointer" }} className="hover:text-blue-500 transition-colors" />
              {!hideQuickAlert && onAlert && (
                <BellOutlined onClick={handleAlert} style={{ color: token.colorTextQuaternary, cursor: "pointer" }} className="hover:text-yellow-500 transition-colors" />
              )}
            </Space>
            {allItemIds.length > 0 && (
              <Reactions itemId={zone._id} type="zone" allItemIds={allItemIds} teamPickEnabled={false} />
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
