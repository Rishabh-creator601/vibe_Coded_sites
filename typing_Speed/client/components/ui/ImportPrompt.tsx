"use client";

import { useEffect, useState } from "react";
import { post } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { clearHistory, declineImport, getHistory, importDeclined } from "@/lib/storage";
import { Button } from "./Button";

/** After signing up or logging in, offers to move guest practice history into the account (once). */
export default function ImportPrompt() {
  const { user } = useAuth();
  const toast = useToast();
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(user && !importDeclined() ? getHistory().length : 0);
  }, [user]);

  if (!user || count === 0) return null;

  async function doImport() {
    try {
      await post("/practice/sessions/import", { sessions: getHistory() });
      clearHistory();
      toast(`Imported ${count} practice runs.`);
    } catch {
      toast("Couldn't import your practice runs. Try again later.");
    }
    setCount(0);
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm rounded-xl border border-line bg-panel p-4 shadow-lg" role="dialog" aria-label="Import practice history">
      <p className="text-sm">
        You have {count} practice runs saved in this browser. Add them to your account?
      </p>
      <div className="mt-3 flex gap-2">
        <Button variant="primary" onClick={doImport}>
          Import runs
        </Button>
        <Button
          onClick={() => {
            declineImport();
            setCount(0);
          }}
        >
          No thanks
        </Button>
      </div>
    </div>
  );
}
