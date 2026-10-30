"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./Button";

function Form({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      router.push(next && next.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  const field = "w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-fg";
  return (
    <form onSubmit={submit} className="flex max-w-sm flex-col gap-4" noValidate>
      {mode === "register" && (
        <label className="flex flex-col gap-1.5 text-sm">
          Name
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required minLength={2} maxLength={40} />
        </label>
      )}
      <label className="flex flex-col gap-1.5 text-sm">
        Email
        <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Password
        <input
          className={field}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "register" ? 8 : undefined}
        />
        {mode === "register" && <span className="text-sub">At least 8 characters.</span>}
      </label>
      {error && (
        <p className="text-err" role="alert">
          {error}
        </p>
      )}
      <div>
        <Button type="submit" variant="primary" disabled={busy}>
          {mode === "login" ? "Log in" : "Create account"}
        </Button>
      </div>
      <p className="text-sm text-sub">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link className="text-accent underline" href="/register">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link className="text-accent underline" href="/login">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  if (!loading && user) {
    router.replace("/dashboard");
    return null;
  }
  return (
    <div className="pt-6">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">{mode === "login" ? "Log in" : "Create your account"}</h1>
      <Suspense>
        <Form mode={mode} />
      </Suspense>
    </div>
  );
}
