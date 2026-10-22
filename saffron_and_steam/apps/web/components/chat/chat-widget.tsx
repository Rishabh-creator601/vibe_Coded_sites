"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Images, Info, RotateCcw, SendHorizontal, Sparkles, X } from "lucide-react";
import { CUISINES, formatNumber, type Locale, type MealPeriodKey } from "@saffron/shared";
import { Link } from "@/i18n/navigation";
import { KulhadMark } from "@/components/logo";
import { DIET_CHOICES, MAX_MESSAGE, MEALS, nextStep, type ChatReply, type HistoryTurn, type Profile, type Step } from "@/lib/chat/types";
import { useStoresHydrated } from "@/lib/use-hydrated";
import { cartCount, useCart } from "@/store/cart";
import { newId, useChat, type ChatMessage } from "@/store/chat";
import { Visualizer } from "./visualizer";
import { WhatsAppButton } from "./whatsapp-button";

const GREETING: ChatMessage = { id: "hello", role: "bot", ask: "name" };
const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

function Avatar({ large }: { large?: boolean }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-cream ring-2 ring-saffron/60 ${large ? "size-11" : "size-8"}`} aria-hidden="true">
      <KulhadMark className={large ? "h-7 w-6" : "h-5 w-4"} animated={large} />
    </span>
  );
}

/** On phones the chat covers the page, so close it when a link leads elsewhere. */
function closeOnSmallScreens() {
  if (window.matchMedia("(max-width: 767px)").matches) useChat.getState().close();
}

/** Tap-to-answer chips for the current question. */
function QuickReplies({ step, onPick }: { step: Step; onPick: (label: string, answer: Profile) => void }) {
  const t = useTranslations("chat");
  const tp = useTranslations("periods");
  const tc = useTranslations("cuisines");
  const locale = useLocale() as Locale;
  const options: { label: string; answer: Profile }[] =
    step === "party"
      ? PARTY_SIZES.map((n) => ({ label: formatNumber(n, locale), answer: { party: n } }))
      : step === "meal"
        ? MEALS.map((m) => ({ label: tp(m), answer: { meal: m } }))
        : step === "cuisine"
          ? [...CUISINES.map((c) => ({ label: tc(c), answer: { cuisines: [c] } })), { label: t("surprise"), answer: { cuisines: [] } }]
          : step === "diet"
            ? DIET_CHOICES.map((d) => ({ label: t(`diet.${d}`), answer: { diet: d } }))
            : [];
  if (!options.length) return null;
  return (
    <div role="group" aria-label={t("quickReplies")} className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onPick(o.label, o.answer)}
          className="min-h-11 min-w-11 cursor-pointer rounded-full border-[1.5px] border-kulhad bg-white px-4 text-sm font-semibold text-kulhad transition-colors hover:bg-kulhad hover:text-white"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** The Visualizer and Show Gallery buttons under a message that picked dishes. */
function PicksActions({ picks, meal }: { picks: string[]; meal?: MealPeriodKey }) {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-roast px-4 text-sm font-semibold text-cream hover:bg-roast/90"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          {open ? t("hideVisualizer") : t("visualizer")}
        </button>
        <Link
          href={meal ? `/gallery?cat=${meal}` : "/gallery"}
          onClick={closeOnSmallScreens}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-roast px-4 text-sm font-semibold hover:bg-roast hover:text-cream"
        >
          <Images className="size-4" aria-hidden="true" />
          {t("showGallery")}
        </Link>
      </div>
      {open && <Visualizer picks={picks} meal={meal} onNavigate={closeOnSmallScreens} />}
    </>
  );
}

export function ChatWidget() {
  const t = useTranslations("chat");
  const locale = useLocale() as Locale;
  const { messages, profile, isOpen, push, setProfile, open, close, reset } = useChat();
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const hydrated = useStoresHydrated();
  const cartLines = useCart((s) => s.lines);
  // Sit above the mobile "View cart" bar when it's showing.
  const raised = hydrated && cartCount(cartLines) > 0;

  const shown = messages.length ? messages : [GREETING];
  const ask = nextStep(profile);

  useEffect(() => {
    void useChat.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (isOpen) input.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [shown.length, pending, isOpen]);

  /** What a bot message says, in the page's language. */
  function say(m: Extract<ChatMessage, { role: "bot" }>) {
    if (m.text) return m.text;
    if (m.fallback) return t(`fallback.${m.fallback}`, { name: profile.name ?? "", party: profile.party ?? 2 });
    if (m.id === GREETING.id) return t("hello");
    if (m.ask) return t(`ask.${m.ask}`, { name: profile.name ?? "" });
    return "";
  }

  async function send(text: string, answer?: Profile) {
    const clean = text.trim().slice(0, MAX_MESSAGE);
    if (!clean || pending) return;
    const history: HistoryTurn[] = shown.slice(-8).map((m) => (m.role === "user" ? { role: "user", text: m.text } : { role: "bot", text: say(m) }));
    push({ id: newId(), role: "user", text: clean });
    setDraft("");
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, profile, message: answer ? undefined : clean, answer, history }),
      });
      if (!res.ok) {
        push({ id: newId(), role: "bot", fallback: res.status === 429 ? "busy" : "error" });
        return;
      }
      const reply = (await res.json()) as ChatReply;
      setProfile(reply.profile);
      const out: ChatMessage[] = [];
      if (reply.text || reply.fallback || reply.picks.length) {
        out.push({ id: newId(), role: "bot", text: reply.text ?? undefined, fallback: reply.fallback, picks: reply.picks.length ? reply.picks : undefined, done: reply.done || undefined });
      }
      if (reply.ask) out.push({ id: newId(), role: "bot", ask: reply.ask });
      push(...out);
    } catch {
      push({ id: newId(), role: "bot", fallback: "error" });
    } finally {
      setPending(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={open}
        aria-label={t("open")}
        className={`fixed right-4 z-30 flex h-14 cursor-pointer items-center gap-3 rounded-full bg-roast pr-2 pl-2 text-cream shadow-[0_14px_32px_-12px_rgb(42_26_18/0.7)] transition-transform hover:-translate-y-0.5 sm:pr-5 md:right-6 md:bottom-6 ${raised ? "bottom-24" : "bottom-4"}`}
      >
        <Avatar large />
        <span className="hidden font-semibold sm:inline">{t("launcher")}</span>
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-labelledby="chat-title"
      onKeyDown={(e) => e.key === "Escape" && close()}
      className="fixed inset-0 z-40 flex flex-col bg-paper text-roast md:inset-auto md:right-6 md:bottom-6 md:h-[min(42rem,calc(100dvh-3rem))] md:w-[25rem] md:overflow-hidden md:rounded-3xl md:border md:border-line md:shadow-[0_28px_70px_-24px_rgb(42_26_18/0.6)]"
    >
      <header className="flex items-center gap-3 bg-roast px-4 py-3 text-cream">
        <Avatar large />
        <div className="min-w-0 flex-1">
          <h2 id="chat-title" className="text-xl leading-tight">
            {t("title")}
          </h2>
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-cream/75 uppercase">
            <span className="size-2 shrink-0 rounded-full bg-saffron" aria-hidden="true" />
            {t("status")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo((s) => !s)}
          aria-expanded={showInfo}
          aria-label={t("info")}
          className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-cream/10"
        >
          <Info className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setDraft("");
            input.current?.focus();
          }}
          aria-label={t("restart")}
          title={t("restart")}
          className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-cream/10"
        >
          <RotateCcw className="size-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={close} aria-label={t("close")} className="flex size-11 cursor-pointer items-center justify-center rounded-full hover:bg-cream/10">
          <X className="size-6" aria-hidden="true" />
        </button>
      </header>
      {showInfo && <p className="border-b border-line px-4 py-3 text-sm text-roast-soft">{t("about")}</p>}

      <ol ref={list} aria-live="polite" aria-relevant="additions" className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {shown.map((m, i) =>
          m.role === "user" ? (
            <li key={m.id} className="flex justify-end">
              <p className="max-w-[80%] rounded-2xl rounded-br-md bg-kulhad px-4 py-2.5 break-words text-white">{m.text}</p>
            </li>
          ) : (
            <li key={m.id} className="flex items-start gap-2">
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="w-fit max-w-[92%] rounded-2xl rounded-tl-md border-l-[3px] border-kulhad bg-white px-4 py-2.5 break-words whitespace-pre-line shadow-[0_1px_2px_rgb(42_26_18/0.06)]">
                  {say(m)}
                </p>
                {m.picks && <PicksActions picks={m.picks} meal={profile.meal} />}
                {i === shown.length - 1 && m.ask && m.ask === ask && !pending && <QuickReplies step={m.ask} onPick={(label, answer) => send(label, answer)} />}
              </div>
            </li>
          ),
        )}
        {pending && (
          <li className="flex items-start gap-2">
            <Avatar />
            <p className="flex h-11 items-center gap-1 rounded-2xl rounded-tl-md border-l-[3px] border-kulhad bg-white px-4">
              <span className="sr-only">{t("typing")}</span>
              {[0, 1, 2].map((n) => (
                <span key={n} className="size-2 animate-bounce rounded-full bg-roast-soft" style={{ animationDelay: `${n * 150}ms` }} aria-hidden="true" />
              ))}
            </p>
          </li>
        )}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
        className="flex items-center gap-2 border-t border-line bg-paper px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <WhatsAppButton profile={profile} />
        <label htmlFor="chat-input" className="sr-only">
          {t("input")}
        </label>
        <input
          id="chat-input"
          ref={input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_MESSAGE}
          autoComplete={ask === "name" ? "given-name" : "off"}
          placeholder={t(`placeholder.${ask ?? "free"}`)}
          className="min-h-11 min-w-0 flex-1 rounded-full border-[1.5px] border-line bg-white px-4 placeholder:text-roast-soft/70 focus:border-kulhad focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim() || pending}
          aria-label={t("send")}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-kulhad text-white hover:bg-kulhad-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendHorizontal className="size-5" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
