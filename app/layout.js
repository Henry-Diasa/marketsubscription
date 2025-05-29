/*
 * @Author: diasa diasa@gate.me
 * @Date: 2025-05-08 13:47:40
 * @LastEditors: diasa diasa@gate.me
 * @LastEditTime: 2025-05-29 15:27:40
 * @FilePath: /marketsubscription/app/layout.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import 'antd/dist/reset.css';
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "市场订阅系统",
  description: "市场订阅系统",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
