// components/SymbolSelect.tsx
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
      options={options}
      notFoundContent={loading ? "Loading..." : "No symbols"}
    />
  );
};

export default SymbolSelect;