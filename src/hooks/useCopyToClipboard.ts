// hooks/useCopyToClipboard.ts
"use client";
import { message } from "antd";

export function useCopyToClipboard() {
  const [messageApi, contextHolder] = message.useMessage();

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      messageApi.success(`${text} copied to clipboard`);
    } catch (err) {
      messageApi.error("Failed to copy");
    }
  };

  return { copy, contextHolder };
}
