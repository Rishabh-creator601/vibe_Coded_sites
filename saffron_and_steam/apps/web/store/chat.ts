"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Fallback, Profile, Step } from "@/lib/chat/types";

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "bot";
      /** AI-written text. Questions and fallbacks are stored as keys instead, so they follow the page's language. */
      text?: string;
      fallback?: Fallback;
      ask?: Step;
      picks?: string[];
      done?: boolean;
    };

interface ChatState {
  messages: ChatMessage[];
  profile: Profile;
  isOpen: boolean;
  push: (...messages: ChatMessage[]) => void;
  setProfile: (profile: Profile) => void;
  open: () => void;
  close: () => void;
  reset: () => void;
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      profile: {},
      isOpen: false,
      push: (...messages) => set((s) => ({ messages: [...s.messages, ...messages].slice(-60) })),
      setProfile: (profile) => set({ profile }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      reset: () => set({ messages: [], profile: {} }),
    }),
    {
      name: "saffron-chat",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ messages: s.messages, profile: s.profile }),
      // Loaded after mount by the chat widget, so server and client HTML match.
      skipHydration: true,
    },
  ),
);
