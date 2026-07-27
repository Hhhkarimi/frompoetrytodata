import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "پژوهش‌های داده‌محور | تاریخ ادبیات فارسی دیجیتال",
  description: "ده پرسش جذاب از شعر فارسی و پرونده‌های سنجش انتساب خیام، حافظ و جریان‌های تاریخی.",
  openGraph: {
    title: "پژوهش‌های داده‌محور شعر فارسی",
    description: "پرسش‌های عمومی، تحلیل‌های قابل ردگیری و پرونده‌های انتساب و اصالت‌سنجی.",
    type: "website",
    locale: "fa_IR",
  },
};

export default function ResearchLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
