import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const ui = Familjen_Grotesk({ subsets: ["latin"], variable: "--font-ui", display: "swap" });
const code = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Keystone: typing speed test", template: "%s | Keystone" },
  description: "Measure your typing speed and accuracy across seven levels. Practice freely or take scored tests.",
};

export const viewport: Viewport = { themeColor: "#0f1115" };

// applies the saved theme and font size before first paint
const initScript = `try{var s=JSON.parse(localStorage.getItem("ts_settings")||"null");if(s){document.documentElement.dataset.theme=s.theme||"dark";document.documentElement.dataset.font=s.fontSize||"md"}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-font="md" className={`${ui.variable} ${code.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-5xl px-5">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
