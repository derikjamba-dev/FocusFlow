import type { Metadata } from 'next';
import { IBM_Plex_Sans, Playfair_Display, IBM_Plex_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const sans = IBM_Plex_Sans({ 
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-sans',
});

const serif = Playfair_Display({ 
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-serif',
});

const mono = IBM_Plex_Mono({ 
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'FocusFlow - Productivity Made Simple',
  description: 'Smart task prioritization and focus sessions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="bg-bg text-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
