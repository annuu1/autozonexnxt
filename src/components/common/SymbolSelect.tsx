// components/SymbolSelect.tsx (updated for Antd v4 compatibility)
import React from "react";
import { Select } from "antd";

const { Option } = Select;

interface SymbolSelectProps {
  options: { value: string; label: string }[];
  onSearch: (query: string) => void;
  loading: boolean;
}

const SymbolSelect: React.FC<SymbolSelectProps> = ({
  options,
  onSearch,
  loading,
}) => {
  return (
    <Select
      showSearch
      placeholder="Search symbol..."
      filterOption={false}
      onSearch={onSearch}
      loading={loading}
      notFoundContent={loading ? "Loading..." : "No symbols"}
    >
      {options.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  );
};

export default SymbolSelect;