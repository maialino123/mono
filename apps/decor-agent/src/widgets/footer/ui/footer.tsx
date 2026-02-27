import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto w-full border-white/10 border-t bg-slate-900/50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-white transition-opacity hover:opacity-90"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 font-bold text-sm text-white">
                GD
              </span>
              <span>Goc Decor</span>
            </Link>
            <p className="max-w-xs text-center text-sm text-white/50 sm:text-left">
              Chia se nhung mon do decor minh da dung va yeu thich.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Trang chu
            </Link>
            <Link
              href="#products"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              San pham
            </Link>
            <Link
              href="mailto:hello@ecomatehome.com"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Lien he
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-white/10 border-t pt-6 text-center">
          <p className="text-white/40 text-xs sm:text-sm">
            2026 Goc Decor. Review chan thuc, khong quang cao.
          </p>
        </div>
      </div>
    </footer>
  );
}
