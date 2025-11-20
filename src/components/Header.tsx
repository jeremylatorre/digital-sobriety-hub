import { NavLink } from "@/components/NavLink";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2 hover:opacity-80">
          <img src="/AlterNumIA_Darkmode.webp" alt="AlterNumIA Logo" className="h-8 w-auto" />
          <span className="text-xl font-semibold">
            Hub Sobriété Numérique
          </span>
        </NavLink>

        <nav className="flex items-center gap-6" aria-label="Navigation principale">
          <NavLink
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            activeClassName="text-foreground"
          >
            Accueil
          </NavLink>
          <NavLink
            to="/assessment"
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            activeClassName="text-foreground"
          >
            Auto-évaluation
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/20 text-primary">ALPHA</span>
          </NavLink>
          <NavLink
            to="/tools"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            activeClassName="text-foreground"
          >
            Outils
          </NavLink>
          <NavLink
            to="/about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            activeClassName="text-foreground"
          >
            À propos
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
