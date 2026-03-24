import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "后陡门 58 号",
  description: "使用 Next.js、TypeScript 和 Sass Modules 实现的后陡门对话页。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
