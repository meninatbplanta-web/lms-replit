export function Footer() {
  return (
    <footer className="w-full border-t bg-background/50 backdrop-blur">
      <div className="container flex h-14 items-center justify-center px-4 md:px-8">
        <p className="text-sm text-muted-foreground" data-testid="text-version">
          LMS Priscilla Moreira – versão 1.0.0
        </p>
      </div>
    </footer>
  );
}
