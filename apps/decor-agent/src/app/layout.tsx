import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import { AmbientLayer } from '@/shared/ui/sora';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Góc Decor của mình | ecomatehome',
  description: 'Chia sẻ những món đồ decor mình đã dùng và yêu thích. Review chân thực, không quảng cáo.',
  metadataBase: new URL('https://ecomatehome.com'),
  openGraph: {
    type: 'website',
    title: 'Góc Decor của mình',
    description: 'Review chân thực các sản phẩm decor cho góc làm việc, phòng ngủ.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${dmSans.variable} ${playfair.variable} font-dm-sans bg-sora-bg text-sora-text-primary min-h-screen`}>
        <AmbientLayer />
        <div className="relative z-[1] flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
