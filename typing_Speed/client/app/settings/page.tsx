"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { del, patch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/useToast";
import type { User } from "@/types";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Tabs from "@/components/ui/Tabs";

export default function SettingsPage() {
  const { user, loading, setUser } = useAuth();
  const { settings, update } = useSettings();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);
  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/settings");
  }, [loading, user, router]);

  if (!user) return null;

  async function saveName() {
    try {
      setUser((await patch<{ user: User }>("/users/me", { name })).user);
      toast("Name saved.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't save your name.");
    }
  }

  async function deleteAccount() {
    await del("/users/me");
    setUser(null);
    router.push("/");
  }

  return (
    <div className="flex max-w-xl flex-col gap-10 pt-6">
      <h1 className="text-4xl font-bold tracking-tight">Settings</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Name</h2>
        <div className="flex gap-3">
          <input
            aria-label="Name"
            className="w-full rounded-lg border border-line bg-panel px-3 py-2.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
          <Button onClick={saveName} disabled={name.trim().length < 2 || name === user.name}>
            Save name
          </Button>
        </div>
        <p className="text-sm text-sub">{user.email}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Theme</h2>
        <Tabs label="Theme" active={settings.theme} onSelect={(id) => update({ theme: id as "dark" | "light" })} tabs={[{ id: "dark", label: "Dark" }, { id: "light", label: "Light" }]} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Text size</h2>
        <Tabs label="Text size" active={settings.fontSize} onSelect={(id) => update({ fontSize: id as "sm" | "md" | "lg" })} tabs={[{ id: "sm", label: "Small" }, { id: "md", label: "Medium" }, { id: "lg", label: "Large" }]} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Sound</h2>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={settings.sound} onChange={(e) => update({ sound: e.target.checked })} className="h-4 w-4 accent-[var(--accent)]" />
          Play a click for each key and a low tone for mistakes
        </label>
      </section>

      <section className="flex flex-col gap-3 border-t border-line pt-8">
        <h2 className="text-lg font-bold">Delete account</h2>
        <p className="text-sub">Removes your account, tests and practice history for good.</p>
        <div>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Delete my account
          </Button>
        </div>
      </section>

      <Modal open={confirmOpen} title="Delete your account?" onClose={() => setConfirmOpen(false)}>
        <p className="text-sub">All your scores and history will be deleted. This can&apos;t be undone.</p>
        <div className="mt-5 flex gap-3">
          <Button variant="danger" onClick={deleteAccount}>
            Delete everything
          </Button>
          <Button onClick={() => setConfirmOpen(false)}>Keep my account</Button>
        </div>
      </Modal>
    </div>
  );
}
