import { NavLink } from "@/components/NavLink";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { user, logout } = useAuth();

  const NavItems = () => (
    <>
      <NavLink
        to="/"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
        activeClassName="text-foreground"
        onClick={() => setIsOpen(false)}
      >
        Accueil
      </NavLink>
      <NavLink
        to="/assessment"
        className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        activeClassName="text-foreground"
        onClick={() => setIsOpen(false)}
      >
        Auto-évaluation
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/20 text-primary" aria-label="Version Alpha">ALPHA</span>
      </NavLink>
      <NavLink
        to="/tools"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
        activeClassName="text-foreground"
        onClick={() => setIsOpen(false)}
      >
        Outils
      </NavLink>
      <NavLink
        to="/about"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
        activeClassName="text-foreground"
        onClick={() => setIsOpen(false)}
      >
        À propos
      </NavLink>
    </>
  );

  const AuthButtons = () => {
    if (user) {
      return (
        <>
          <NavLink
            to="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            activeClassName="text-foreground"
            onClick={() => setIsOpen(false)}
          >
            Tableau de bord
          </NavLink>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
          >
            Déconnexion
          </Button>
        </>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <NavLink
          to="/login"
          onClick={() => setIsOpen(false)}
        >
          <Button variant="ghost" size="sm">Connexion</Button>
        </NavLink>
        <NavLink
          to="/register"
          onClick={() => setIsOpen(false)}
        >
          <Button size="sm">Inscription</Button>
        </NavLink>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2 hover:opacity-80">
          <img src="/AlterNumIA_light.webp" alt="AlterNumIA Logo" className="h-8 w-auto dark:hidden" />
          <img src="/AlterNumIA_Darkmode.webp" alt="AlterNumIA Logo" className="h-8 w-auto hidden dark:block" />
          <span className="text-xl font-semibold hidden sm:inline-block">
            Hub Sobriété Numérique
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
          <NavItems />
          <div className="h-6 w-px bg-border" />
          <AuthButtons />
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu principal">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <NavItems />
                <div className="h-px w-full bg-border my-2" />
                <div className="flex flex-col gap-2">
                  <AuthButtons />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
