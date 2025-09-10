// app/v1/register/page.tsx
"use client";

import { Suspense } from "react";
import RegisterPageInner from "./RegisterPageInner";

export const dynamic = "force-dynamic"; // keep this if you don't want static HTML

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageInner />
    </Suspense>
  );
}
