"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { localWeakKeys } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import PracticeRunner from "@/components/typing/PracticeRunner";
import { LinkButton } from "@/components/ui/Button";
import type { WeakKey } from "@/types";

export default function WeakKeysPage() {
  const { user, loading } = useAuth();
  const [keys, setKeys] = useState<string[] | null>(null);

  useEffect(() => {
    if (loading) return;
    if (user) {
      get<{ keys: WeakKey[]; enoughData: boolean }>("/users/me/weak-keys")
        .then((r) => setKeys(r.enoughData ? r.keys.slice(0, 5).map((k) => k.key) : []))
        .catch(() => setKeys([]));
    } else {
      const { keys: k, charsTyped } = localWeakKeys();
      setKeys(charsTyped >= 300 ? k.slice(0, 5).map((x) => x.key) : []);
    }
  }, [user, loading]);

  return (
    <div className="pt-6">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">Weak-key drill</h1>
      {keys === null ? (
        <p className="text-sub">Finding your weak keys</p>
      ) : keys.length === 0 ? (
        <div className="max-w-xl">
          <p className="text-fg">Type a bit more so we can find your weak keys.</p>
          <p className="mt-1 text-sub">We need about 300 typed characters of practice history first.</p>
          <div className="mt-4">
            <LinkButton href="/practice" variant="primary">
              Go to practice
            </LinkButton>
          </div>
        </div>
      ) : (
        <PracticeRunner levelId="medium" drillKeys={keys} />
      )}
    </div>
  );
}
