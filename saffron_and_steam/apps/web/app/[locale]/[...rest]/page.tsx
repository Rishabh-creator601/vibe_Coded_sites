import { notFound } from "next/navigation";

// Sends unknown paths under a language (e.g. /en/nope) to the localized 404 page.
export default function CatchAll() {
  notFound();
}
