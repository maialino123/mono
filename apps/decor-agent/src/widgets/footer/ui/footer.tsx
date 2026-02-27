import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-white/10 bg-slate-900/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-90 transition-opacity"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                GD
              </span>
              <span>Goc Decor</span>
            </Link>
            <p className="text-white/50 text-sm text-center sm:text-left max-w-xs">
              Chia se nhung mon do decor minh da dung va yeu thich.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Trang chu
            </Link>
            <Link
              href="#products"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              San pham
            </Link>
            <Link
              href="mailto:hello@ecomatehome.com"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Lien he
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-white/40 text-xs sm:text-sm">
            2026 Goc Decor. Review chan thuc, khong quang cao.
          </p>
        </div>
      </div>
    </footer>
  );
}
