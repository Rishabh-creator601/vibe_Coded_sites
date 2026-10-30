"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { SettingsProvider } from "@/hooks/useSettings";
import { ToastProvider } from "@/hooks/useToast";
import ImportPrompt from "@/components/ui/ImportPrompt";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          {children}
          <ImportPrompt />
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
