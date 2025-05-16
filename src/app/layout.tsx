import { Web3Provider } from '@/providers/Web3Provider';
import '@/styles/globals.scss';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { LanguageProvider } from '@/providers/LanguageProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Zap',
  description: 'Zap mobile application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <Web3Provider>
              {children}
            </Web3Provider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
