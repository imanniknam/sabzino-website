import type { Metadata } from "next";
import "@fontsource-variable/vazirmatn";
import "./globals.css";

export const metadata: Metadata = {
  title: "سبزینو | چشیدن طعم‌های جهان",
  description: "فروشگاه محصولات سبزی‌محور، ادویه‌های بین‌المللی و نوشیدنی‌های طبیعی؛ یک استارتاپ کارآفرینی اجتماعی.",
  icons: { icon: "/images/sabzino-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
