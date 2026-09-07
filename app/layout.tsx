import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "문장 사이 | 웹페이지 번역",
  description: "웹페이지와 소설을 한국어로 읽는 번역 작업실",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
