import Link from "next/link";
import PracticeRunner from "@/components/typing/PracticeRunner";
import LevelCard, { LEVEL_BLURB } from "@/components/ui/LevelCard";
import { LinkButton } from "@/components/ui/Button";
import { LEVELS } from "../../shared/levels.js";

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pt-8">
      <section className="flex flex-col gap-8">
        <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">How fast do you really type?</h1>
        <p className="max-w-xl text-lg text-sub">Type for 30 seconds and get your speed, accuracy and the keys that slow you down. No account needed.</p>
        <div className="rounded-2xl border border-line bg-panel p-6 sm:p-8">
          <PracticeRunner levelId="medium" demo />
        </div>
      </section>

      <section className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Practice</h2>
          <p className="mt-2 max-w-md text-sub">
            Open to everyone, on all seven levels. Pick a time, a word count or a full passage, watch your accuracy as you go, and drill the keys you miss most.
          </p>
          <div className="mt-4">
            <LinkButton href="/practice">Start practising</LinkButton>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Test</h2>
          <p className="mt-2 max-w-md text-sub">
            A fixed 1, 3 or 5 minute run that we score on the server. Pass a level to unlock the next one and climb the leaderboard.
          </p>
          <div className="mt-4">
            <LinkButton href="/test">Take a test</LinkButton>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Seven levels, from home row to real code</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((l) => (
            <LevelCard key={l.id} id={l.id} name={l.name} href={`/practice/${l.id}`} blurb={LEVEL_BLURB[l.id]} detail={`Pass at ${l.passWpm} wpm`} />
          ))}
        </div>
        <p className="mt-6 text-sub">
          Curious how we count? <Link href="/about" className="text-accent underline">Read how WPM and accuracy work.</Link>
        </p>
      </section>
    </div>
  );
}
