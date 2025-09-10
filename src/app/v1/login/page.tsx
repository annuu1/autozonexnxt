// app/v1/login/page.tsx
"use client";

import { Suspense } from "react";
import LoginPageInner from "./LoginPageInner";

export const dynamic = "force-dynamic"; // keep if you want to skip static generation

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
