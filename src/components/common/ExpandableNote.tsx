"use client";

import React, { useState } from "react";
import { Button } from "antd";

interface ExpandableNoteProps {
  note: string;
}

const ExpandableNote: React.FC<ExpandableNoteProps> = ({ note }) => {
  const [expanded, setExpanded] = useState(false);
  const limit = 90; // character limit before truncation

  const isLong = note.length > limit;
  const displayText = expanded || !isLong ? note : note.slice(0, limit) + "...";

  return (
    <div style={{ color: "#555", marginTop: 8 }}>
      <strong>Note:</strong> {displayText}
      {isLong && (
        <Button
          type="link"
          size="small"
          style={{ padding: 0, marginLeft: 4 }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </div>
  );
};

export default ExpandableNote;
