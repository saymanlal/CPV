import type { Metadata } from 'next';
import './globals.css';
import { webEnv } from '@cpv/config/web';

export const metadata: Metadata = {
  title: `${webEnv.NEXT_PUBLIC_APP_NAME} | Competitive Programming Versus`,
  description: 'Real-time competitive coding battles built in deployable phases.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
