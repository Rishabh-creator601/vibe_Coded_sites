import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TestRunner from "@/components/typing/TestRunner";
import RequireLogin from "@/components/ui/RequireLogin";
import { getLevel } from "../../../../shared/levels.js";

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  return { title: `Test ${getLevel(level)?.name ?? ""}` };
}

export default async function TestLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const info = getLevel(level);
  if (!info) notFound();
  return (
    <div className="pt-6">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">Test: {info.name}</h1>
      <RequireLogin>
        <TestRunner key={level} levelId={level} />
      </RequireLogin>
    </div>
  );
}
