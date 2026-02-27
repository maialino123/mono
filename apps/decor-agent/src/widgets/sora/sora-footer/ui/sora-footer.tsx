export function SoraFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-12 text-center text-sora-text-secondary text-sm animate-sora-fade-in"
      style={{
        animationDelay: '1.2s',
        animationFillMode: 'both',
      }}
    >
      <p>&copy; {currentYear} All rights reserved</p>
    </footer>
  );
}
