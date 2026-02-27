import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Backdrop blur container */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md border-b border-white/10" />

      {/* Header content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-bold text-lg sm:text-xl hover:opacity-90 transition-opacity"
          >
            {/* Decorative icon */}
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/30">
              GD
            </span>
            <span className="hidden sm:inline">Goc Decor</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-white/90 hover:text-white text-sm font-medium rounded-full hover:bg-white/10 transition-all"
            >
              Trang chu
            </Link>
            <Link
              href="#products"
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-white/90 hover:text-white text-sm font-medium rounded-full hover:bg-white/10 transition-all"
            >
              San pham
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
