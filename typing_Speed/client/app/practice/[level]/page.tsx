import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PracticeRunner from "@/components/typing/PracticeRunner";
import { getLevel } from "../../../../shared/levels.js";

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  return { title: `Practice ${getLevel(level)?.name ?? ""}` };
}

export default async function PracticeLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const info = getLevel(level);
  if (!info) notFound();
  return (
    <div className="pt-6">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">Practice: {info.name}</h1>
      <PracticeRunner key={level} levelId={level} />
    </div>
  );
}
