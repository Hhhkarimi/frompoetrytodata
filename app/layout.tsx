import type { Metadata } from "next";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/800.css";
import "@fontsource/noto-naskh-arabic/600.css";
import "@fontsource/noto-naskh-arabic/700.css";
import "./globals.css";
import "./v7-shortcut.css";

export const metadata: Metadata = {
  title: "تاریخ ادبیات فارسی دیجیتال",
  description: "پایگاه تعاملی برای کاوش شاعران، آثار، منابع و کانون‌های تاریخ ادبیات فارسی",
  keywords: ["ادبیات فارسی", "شعر فارسی", "تاریخ ادبیات", "علوم انسانی دیجیتال", "گنجور"],
  openGraph: {
    title: "تاریخ ادبیات فارسی دیجیتال",
    description: "فهرست سده‌ای، پروفایل‌های مستند، کتابخانهٔ منابع باز و اطلس ادبی",
    type: "website",
    locale: "fa_IR",
  },
  robots: { index: true, follow: true },
  manifest: "/site.webmanifest",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <a className="v7-research-shortcut" href="/research" aria-label="رفتن به پژوهش‌های تازه نسخه هفت">
          <span>نسخهٔ ۷</span>
          <strong>پژوهش‌های تازه</strong>
        </a>
      </body>
    </html>
  );
}
