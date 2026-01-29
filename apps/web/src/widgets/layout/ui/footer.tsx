export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex h-14 items-center justify-center border-border border-t bg-background">
      <p className="text-muted-foreground text-sm leading-6">© {currentYear} All rights reserved</p>
    </footer>
  );
}
