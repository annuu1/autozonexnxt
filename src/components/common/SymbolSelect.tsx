// components/SymbolSelect.tsx (updated for controlled form integration)
import React from "react";
import { Select } from "antd";

const { Option } = Select;

interface SymbolSelectProps {
  value?: string;  // Add: From form state
  onChange?: (value: string) => void;  // Add: To update form
  options: { value: string; label: string }[];
  onSearch: (query: string) => void;
  loading: boolean;
  placeholder?: string;  // Optional: For flexibility
}

const SymbolSelect: React.FC<SymbolSelectProps> = ({
  value,
  onChange,
  options,
  onSearch,
  loading,
  placeholder = "Search symbol...",
}) => {
  return (
    <Select
      value={value}  // Forward: Sets the selected value
      onChange={onChange}  // Forward: Updates form on selection
      showSearch
      placeholder={placeholder}
      filterOption={false}
      onSearch={onSearch}
      loading={loading}
      notFoundContent={loading ? "Loading..." : "No symbols"}
      style={{ width: "100%" }}  // Ensure full width in form
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