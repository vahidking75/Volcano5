import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Volcano: Virtuoso AI Art Assistant',
  description: 'A model-aware prompt studio with vocabulary intelligence',
  manifest: '/manifest.json',
  themeColor: '#0b1220',
  icons: {
    apple: '/icons/icon-180.png',
    icon: '/icons/icon-192.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
