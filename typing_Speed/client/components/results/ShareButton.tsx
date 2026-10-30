"use client";

import { useState } from "react";
import { Button } from "../ui/Button";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Link copied" : "Copy link to share"}
    </Button>
  );
}
